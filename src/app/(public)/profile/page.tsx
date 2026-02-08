import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { ProfileContent } from '@/presentation/components/profile/profile-content'



export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    )
}
