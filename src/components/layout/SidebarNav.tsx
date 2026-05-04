import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { NAV_ITEMS } from '@/constants/navigation'

export const SidebarNav = () => (
  <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-100 py-8 px-4">
    <span className="text-lg font-bold text-indigo-500 px-3 mb-8 block">kotoba</span>
    <nav aria-label="サイドバーナビゲーション" className="space-y-1">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
)
