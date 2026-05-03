import { LayoutDashboard, BookOpen, Bookmark, User } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/study', icon: BookOpen, label: '단어학습' },
  { to: '/bookmarks', icon: Bookmark, label: '단어장' },
  { to: '/profile', icon: User, label: '프로필' },
] as const
