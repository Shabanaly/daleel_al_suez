import { getTicketDetails, getAdminTicketMessages } from '@/actions/admin-support.actions'
import { AdminTicketChat } from '@/app/admin/support/admin-ticket-chat' // Logic extracted to client component
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminTicketPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    let ticket;
    let messages;

    try {
        ticket = await getTicketDetails(id)
        if (!ticket) return notFound()
        messages = await getAdminTicketMessages(id)
    } catch (error) {
        console.error('Error loading ticket:', error)
        return notFound()
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/support" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ChevronRight className="w-4 h-4 ml-1" />
                        العودة للتذاكر
                    </Link>
                    <h1 className="text-2xl font-bold">محادثة الدعم</h1>
                </div>
            </div>

            <AdminTicketChat ticket={ticket} initialMessages={messages || []} />
        </div>
    )
}
