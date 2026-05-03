import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Bookmark, User } from 'lucide-react'
import clsx from 'clsx'

const ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/study', icon: BookOpen, label: '단어학습' },
  { to: '/bookmarks', icon: Bookmark, label: '단어장' },
  { to: '/profile', icon: User, label: '프로필' },
]

export const SidebarNav = () => (
  <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-100 py-8 px-4">
    <span className="text-lg font-bold text-indigo-500 px-3 mb-8 block">kotoba</span>
    <nav aria-label="サイドバーナビゲーション" className="space-y-1">
      {ITEMS.map(({ to, icon: Icon, label }) => (
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
