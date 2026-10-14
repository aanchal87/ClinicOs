'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Clock, CalendarDays, Image as ImageIcon, MoreHorizontal } from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import SidebarNav from './SidebarNav';
import HeaderBar from './HeaderBar';
import SearchBar from './SearchBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useUiStore((state) => state.currentRole);
  const mobileLinks = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/queue', label: role === 'receptionist' ? 'Check-in' : 'Queue', icon: Clock },
    { path: '/calendar', label: 'Schedule', icon: CalendarDays },
    { path: role === 'receptionist' ? '/followups' : '/gallery', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="min-h-screen bg-clinic-bg flex flex-row">
      {/* Collapsible Left Sidebar */}
      <SidebarNav />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:ml-20 xl:ml-[280px] transition-[margin] duration-200">
        {/* Top Header */}
        <HeaderBar />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 sm:py-6 lg:px-7 xl:px-8 w-full mx-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-8">
          {children}
        </main>
      </div>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-clinic-border bg-clinic-surface/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl lg:hidden">
        {mobileLinks.map(({ path, label, icon: Icon }) => {
          const active = pathname === path || (path !== '/dashboard' && pathname?.startsWith(path));
          const href = label === 'More'
            ? role === 'receptionist' ? '/followups' : '/consultations'
            : path;
          return <Link key={path} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium ${active ? 'text-clinic-accent' : 'text-clinic-text-secondary'}`}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.8} />{label}
          </Link>;
        })}
      </nav>

      {/* Global Cmd+K Fuzzy Finder Modal */}
      <SearchBar />
    </div>
  );
}
