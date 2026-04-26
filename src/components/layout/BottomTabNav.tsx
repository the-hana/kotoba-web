import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Bookmark, User } from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/study', icon: BookOpen, label: '단어학습' },
  { to: '/bookmarks', icon: Bookmark, label: '단어장' },
  { to: '/profile', icon: User, label: '프로필' },
]

export const BottomTabNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex md:hidden">
    {TABS.map(({ to, icon: Icon, label }) => (
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
