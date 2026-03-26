import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="md:ml-[160px] min-h-screen pb-24 md:pb-10 px-4 md:px-8 py-6">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
