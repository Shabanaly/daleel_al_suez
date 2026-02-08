import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export type TabItem = {
    id: string
    label: string
    icon: LucideIcon
}

interface ProfileTabsProps {
    items: TabItem[]
    activeTab: string
    onTabChange: (tab: any) => void
}

export function ProfileTabs({ items, activeTab, onTabChange }: ProfileTabsProps) {
    return (
        <div className="border-b border-border mb-6 -mx-8 px-8 overflow-x-auto">
            <nav className="flex gap-1 min-w-max">
                {items.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap transition-all border-b-2 min-w-fit",
                                isActive
                                    ? "text-primary border-primary bg-primary/5"
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}
