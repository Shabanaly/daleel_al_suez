'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [isGuest, setIsGuest] = useState(true)
    const [inputValue, setInputValue] = useState('')

    const supabase = createClient()
    const pathname = usePathname()

    // Admin route forces specific dark styling
    const isAdmin = pathname?.startsWith('/admin')

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsGuest(!user)
        }
        checkUser()
    }, [supabase])

    const { messages, status, sendMessage } = useChat({
        body: { isGuest },
        onError: (err: Error) => {
            console.error('Chat error:', err)
        }
    } as any)

    // Derive loading state from status
    const isLoading = status === 'submitted' || status === 'streaming'

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, status])

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isLoading) return

        const text = inputValue
        setInputValue('') // Clear input immediately

        try {
            await sendMessage({ text: text })
        } catch (err) {
            console.error('Failed to send:', err)
            setInputValue(text) // Restore on error
        }
    }

    return (
        <div className={cn("fixed bottom-4 left-4 z-50 flex flex-col items-start gap-4 font-sans", isAdmin && "dark")} dir="rtl">
            {isOpen && (
                <Card className={cn(
                    "w-[300px] sm:w-[350px] h-[500px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden",
                    isAdmin
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-card border-border text-card-foreground"
                )}>
                    {/* Header */}
                    <div className="p-3 bg-primary text-primary-foreground flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-sm block">المساعد الذكي</span>
                                <span className="text-[10px] text-primary-foreground/80 block">دليل السويس</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar", isAdmin ? "bg-slate-950/50" : "bg-muted/30")}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3 p-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Bot size={32} className="text-primary/50" />
                                </div>
                                <h3 className="font-semibold text-primary">مرحباً بك!</h3>
                                <p className="text-sm text-balance">أنا مساعدك الذكي، اسألني عن أي مكان أو خدمة تبحث عنها في السويس.</p>
                                <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    <span className="text-xs bg-white dark:bg-slate-800 border dark:border-slate-700 px-2 py-1 rounded-full text-slate-500 dark:text-slate-300">أفضل مطاعم؟</span>
                                    <span className="text-xs bg-white dark:bg-slate-800 border dark:border-slate-700 px-2 py-1 rounded-full text-slate-500 dark:text-slate-300">أماكن للخروج؟</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((m: any) => (
                                    <div key={m.id} className={cn("flex gap-2 max-w-[85%]", m.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto flex-row")}>
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm", m.role === 'user' ? "bg-primary text-primary-foreground" : isAdmin ? "bg-slate-800 text-primary" : "bg-muted text-primary border-border")}>
                                            {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div className={cn("rounded-2xl px-3 py-2 text-sm shadow-sm",
                                            m.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : cn("rounded-bl-none border", isAdmin ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-muted border-border text-foreground")
                                        )}>
                                            {m.parts ? (
                                                m.parts.map((part: any, i: number) => (
                                                    part.type === 'text' ? <span key={i}>{part.text}</span> : null
                                                ))
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-2 max-w-[85%] ml-auto flex-row">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border shadow-sm">
                                            <Bot size={14} className="text-primary" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                                            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleFormSubmit} className={cn("p-3 border-t flex gap-2 items-center", isAdmin ? "bg-slate-900 border-slate-800" : "bg-card border-border")}>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="اكتب سؤالك هنا..."
                            className={cn("flex-1 focus-visible:ring-primary/20", isAdmin ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-400" : "bg-muted/50 border-input")}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="h-10 w-10 shrink-0 rounded-xl shadow-sm transition-all active:scale-95">
                            <Send size={18} className={isLoading ? 'opacity-0' : 'ml-0.5'} />
                            {isLoading && <Loader2 size={18} className="absolute animate-spin" />}
                        </Button>
                    </form>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn("rounded-full h-14 w-14 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-50", isOpen ? "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600" : "bg-primary hover:bg-primary/90 animate-in zoom-in spin-in-90")}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </Button>
        </div>
    )
}
