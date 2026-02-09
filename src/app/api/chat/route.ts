import { createClient } from '@/lib/supabase/server'
import { google } from '@ai-sdk/google'
import { streamText, embed } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { messages, isGuest } = body
        console.log('Gemini: Received body keys:', Object.keys(body))

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.error('Gemini: Invalid messages format')
            return new Response('Invalid messages format', { status: 400 })
        }

        const lastMessage = messages[messages.length - 1] as { content?: string; parts?: { type: string; text: string }[] }
        const query = typeof lastMessage.content === 'string' && lastMessage.content
            ? lastMessage.content
            : lastMessage.parts?.find((p) => p.type === 'text')?.text || ''

        if (!query) {
            console.error('Gemini: No text content found in last message')
            return new Response('No query found in messages', { status: 400 })
        }

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return new Response('Missing GOOGLE_GENERATIVE_AI_API_KEY', { status: 500 })
        }

        // Generate embedding for user query
        const { embedding } = await embed({
            model: google.textEmbeddingModel('gemini-embedding-001'),
            value: query,
            providerOptions: {
                google: {
                    outputDimensionality: 768,
                    taskType: 'RETRIEVAL_QUERY'
                }
            }
        })

        // 2. Search Database (Parallel)
        const supabase = await createClient()
        const [docsRes, activeEvents] = await Promise.all([
            supabase.rpc('match_documents', {
                query_embedding: embedding,
                match_threshold: 0.3,
                match_count: 5
            }),
            supabase.from('events').select('*').eq('status', 'active').gte('end_date', new Date().toISOString())
        ])

        const { data: documents, error: vectorError } = docsRes
        if (vectorError) console.error('Vector search error:', vectorError)

        const events = activeEvents.data || []
        const eventsContext = events.map(e => `- **${e.title}**: ${e.description} (المكان: ${e.location}, التاريخ: ${new Date(e.start_date).toLocaleDateString('ar-EG')})`).join('\n')

        // 3. Construct Context
        const context = (documents as { content: string }[] || []).map((doc) => doc.content).join('\n---\n')
        console.log('Gemini: Context length:', context.length)

        // 4. System Prompt
        const systemPrompt = `أنت مساعد ذكي ولطيف ومحنك لموقع "دليل السويس" (Daleel Al Suez).
هدفك هو مساعدة المستخدمين في العثور على أي شيء يحتاجونه في مدينة السويس، وتوفير تجربة مستخدم ممتازة.

[بيانات التواصل والدعم]:
- للدعم الفني والشكاوى والإعلانات: 01019979315 (متاح واتساب).
${isGuest
                ? `- أنت تتحدث الآن مع "زائر" (غير مسجل دخول). وجهه للتواصل عبر الواتساب مباشرة لأي مساعدة، وشجعه بلطف على إنشاء حساب لكي يتمكن من استخدام نظام التذاكر الرسمي وحفظ مفضلاته.`
                : `- أنت تتحدث مع "عضو مسجل". وجهه لاستخدام نظام التذاكر الرسمي في حسابه الشخصي (رابط: /profile?tab=support) بالضغط على زر "تذكرة جديدة" لضمان متابعة طلبه بشكل رسمي.`
            }

[هيكل التطبيق وقائمة الملاحة]:
- "الرئيسية": العودة لصفحة البداية.
- "التصنيفات": تصفح الأماكن حسب الفئة (مطاعم، كافيهات، خدمات طبية، إلخ).
- "الأماكن": استكشاف كل الأماكن المتاحة في الدليل.
- "الفعاليات": لمعرفة آخر الأحدث والفعاليات في السويس (رابط: /events).
- "حسابي": الوصول لملف المستخدم، المفضلات، وتذاكر الدعم.

[الفعاليات الحالية في السويس]:
${eventsContext || 'لا توجد فعاليات قادمة مسجلة حالياً.'}

[فئات المعلومات]:
1. بيانات الأماكن: (مطاعم، فنادق، صيدليات، خدمات تجارية).
2. خدمات عامة: (مستشفيات، بنوك، خدمات حكومية، مواقف مواصلات).
3. دعم الدليل: استخدم رقم الواتساب أو وجه المستخدم لنظام التذاكر في حسابه كما هو موضح أعلاه.

[سياق المعلومات المسترجع من قاعدة البيانات]:
${context}

[تعليمات الأسلوب والرد]:
- اللهجة: تحدث بلهجة مصرية بسيطة، ودودة، ومهذبة جداً (كأنك ابن بلد سويسي).
- الوضوح: استخدم التنسيق (Markdown) بجعل أسماء الأماكن **بخط عريض** واستخدام القوائم النقطية.
- الدقة: إذا كانت المعلومات موجودة في "سياق المعلومات" أعلاه، قدمها كاملة (العنوان، الهاتف، ساعات العمل).
- في حال عدم توفر المعلومة: اعتذر بلطف شديد (مثلاً: "يا فندم للأسف المعلومة دي مش عندي حالياً في الدليل، بس أوعدك هنحاول نضيفها في أقرب وقت")، وحاول اقتراح بدائل قريبة إذا أمكن.
- التحيات: رد على التحيات (هاي، سلام، أهلاً) بروح ودية مرحبة.

تاريخ اليوم: ${new Date().toLocaleDateString('ar-EG')}
`

        const modelMessages = (messages as { role: 'user' | 'assistant' | 'system'; content?: string; parts?: { type: string; text: string }[] }[])
            .filter((m) => (m.content !== undefined && m.content !== null) || (m.parts && m.parts.length > 0))
            .map((m) => ({
                role: m.role,
                content: m.content || m.parts?.find((p) => p.type === 'text')?.text || ''
            }))
        // 5. Stream Response
        const result = await streamText({
            model: google('gemini-2.5-flash-lite'),
            messages: modelMessages,
            system: systemPrompt,
            providerOptions: {
                google: {
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
                    ]
                }
            },
            onFinish: ({ text, finishReason }) => {
                console.log('Gemini: Stream Finished. Reason:', finishReason)
                console.log('Gemini: Generated Text length:', text?.length || 0)
                if (text) console.log('Gemini: First 50 chars:', text.substring(0, 50))
                if (!text) console.warn('Gemini: WARNING - Empty response text!')
            },
        })

        return result.toUIMessageStreamResponse()

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('Chat API Error:', error)
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
