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

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        background: 'rgba(10,8,30,0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors"
            style={{ color: active ? 'var(--accent)' : 'rgba(255,255,255,0.40)' }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
