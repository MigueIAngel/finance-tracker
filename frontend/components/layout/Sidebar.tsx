'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Tag, PiggyBank } from 'lucide-react'

const navItems = [
  { href: '/',               icon: LayoutDashboard, label: 'Resumen' },
  { href: '/transacciones',  icon: ArrowLeftRight,  label: 'Transacciones' },
  { href: '/categorias',     icon: Tag,             label: 'Categorías' },
  { href: '/ahorro',         icon: PiggyBank,       label: 'Ahorro' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full w-[160px] flex-col py-6 z-40"
      style={{ background: 'rgba(255,255,255,0.06)', borderRight: '1px solid var(--card-border)' }}
    >
      <div className="px-5 mb-8">
        <span className="text-white font-bold text-sm tracking-wide">Finanzas</span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm transition-all"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.50)',
                background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                borderRight: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
