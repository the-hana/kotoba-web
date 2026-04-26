import { Outlet } from 'react-router-dom'
import { BottomTabNav } from './BottomTabNav'
import { SidebarNav } from './SidebarNav'

export const AppShell = () => (
  <div className="flex min-h-screen bg-slate-50">
    <SidebarNav />
    <main className="flex-1 pb-16 md:pb-0">
      <Outlet />
    </main>
    <BottomTabNav />
  </div>
)
