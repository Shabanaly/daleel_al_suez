'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, Loader2, CheckCheck, ShieldAlert } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { replyAsAdmin, updateTicketStatus, getAdminTicketMessages } from '@/actions/admin-support.actions'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminTicketChatProps {
    ticket: any
    initialMessages: any[]
}

export function AdminTicketChat({ ticket, initialMessages }: AdminTicketChatProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Realtime subscription & Polling fallback
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const latestMessages = await getAdminTicketMessages(ticket.id)
                if (latestMessages) {
                    setMessages(prev => {
                        // Simple check to avoid creating new array if length is same
                        // Ideally we check IDs, but this is a decent heuristic for chat
                        if (prev.length === latestMessages.length) return prev
                        return latestMessages
                    })
                }
            } catch (error) {
                console.error('Polling error:', error)
            }
        }

        // Poll every 5 seconds
        const interval = setInterval(fetchMessages, 5000)

        // Keep Realtime as well for instant updates if it works
        const channel = supabase
            .channel(`ticket_chat_${ticket.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `ticket_id=eq.${ticket.id}`
                },
                (payload) => {
                    const newMsg = payload.new
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            clearInterval(interval)
            supabase.removeChannel(channel)
        }
    }, [ticket.id, router, supabase])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            await replyAsAdmin(ticket.id, newMessage)
            setNewMessage('')
            // Optimistic update handled by realtime or refresh
        } catch (error) {
            console.error('Failed to send message:', error)
            alert('فشل إرسال الرسالة')
        } finally {
            setSending(false)
        }
    }

    const handleStatusChange = async (status: string) => {
        setUpdatingStatus(true)
        try {
            await updateTicketStatus(ticket.id, status)
            router.refresh()
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('فشل تحديث الحالة')
        } finally {
            setUpdatingStatus(false)
        }
    }

    return (
        <div className="flex flex-col h-[650px] border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <div>
                    <h2 className="font-bold flex items-center gap-2 text-slate-100">
                        {ticket.subject}
                        <Badge variant="outline" className="border-slate-700 text-slate-400">{ticket.category}</Badge>
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        المستخدم: {ticket.profiles?.full_name}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updatingStatus}
                        className="text-sm border border-slate-700 rounded-md px-2 py-1 bg-slate-950 text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="open">مفتوح</option>
                        <option value="in_progress">قيد المعالجة</option>
                        <option value="resolved">تم الحل</option>
                        <option value="closed">مغلق</option>
                    </select>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-slate-950/50">
                <div className="p-4 space-y-4">
                    {messages.map((msg: any) => {
                        const isAdmin = msg.is_admin

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full mb-4",
                                    isAdmin ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex max-w-[80%] gap-3",
                                    isAdmin ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                        isAdmin ? "bg-primary text-white" : "bg-slate-800 text-slate-400"
                                    )}>
                                        {isAdmin ? <ShieldAlert size={16} /> : <User size={16} />}
                                    </div>

                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm relative group",
                                        isAdmin
                                            ? "bg-primary text-white rounded-tr-sm"
                                            : "bg-slate-800 text-slate-200 rounded-tl-sm"
                                    )}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                                        <div className={cn(
                                            "text-[10px] mt-1 opacity-70 flex items-center gap-1",
                                            isAdmin ? "text-white/70" : "text-slate-400"
                                        )}>
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ar })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 flex items-center justify-center"
                    >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={ar ? "rotate-180" : ""} />}
                    </button>
                </div>
            </form>
        </div>
    )
}
