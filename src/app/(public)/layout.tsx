import { Header } from "@/presentation/components/shared/layout/header";
import { Footer } from "@/presentation/components/shared/layout/footer";
import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const settingsRepository = new SupabaseSettingsRepository();
    const settings = await settingsRepository.getPublicSettings();

    return (
        <div className="flex flex-col min-h-screen">
            <Header settings={settings} />
            <main className="flex-1">
                {children}
            </main>
            <Footer settings={settings} />
        </div>
    );
}
