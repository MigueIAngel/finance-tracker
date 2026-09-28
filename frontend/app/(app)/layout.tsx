import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { isDemoMode } from '@/lib/demo'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="md:ml-[160px] min-h-screen pb-24 md:pb-10 px-4 md:px-8 py-6">
        {isDemoMode && (
          <p
            className="mb-4 rounded-xl px-4 py-2 text-xs"
            style={{ background: 'rgba(167,139,250,0.15)', color: 'rgba(255,255,255,0.8)' }}
          >
            Demo pública: todos los datos son ficticios y se reinician periódicamente.
          </p>
        )}
        {children}
      </main>
      <BottomNav />
    </>
  )
}
