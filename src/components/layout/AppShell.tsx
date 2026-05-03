import { Outlet } from 'react-router-dom'
import { BottomTabNav } from './BottomTabNav'
import { SidebarNav } from './SidebarNav'

export const AppShell = () => (
  <div className="flex min-h-screen bg-slate-50">
    <SidebarNav />
    <div className="flex-1 flex flex-col min-h-screen">
      {/* モバイル専用トップヘッダー */}
      <header className="md:hidden sticky top-0 z-10 bg-white border-b border-slate-100 px-5 h-12 flex items-center">
        <p className="text-base font-bold text-indigo-500">kotoba</p>
      </header>
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
    <BottomTabNav />
  </div>
)
