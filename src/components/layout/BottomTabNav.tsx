import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { NAV_ITEMS } from '@/constants/navigation'

export const BottomTabNav = () => (
  <nav aria-label="モバイルナビゲーション" className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex md:hidden">
    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          clsx(
            'flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors',
            isActive ? 'text-indigo-500' : 'text-slate-400'
          )
        }
      >
        <Icon size={20} />
        {label}
      </NavLink>
    ))}
  </nav>
)
