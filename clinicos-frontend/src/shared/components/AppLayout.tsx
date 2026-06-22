'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SidebarNav from './SidebarNav';
import HeaderBar from './HeaderBar';
import SearchBar from './SearchBar';
import { useUiStore } from '../stores/uiStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-clinic-bg flex flex-row">
      {/* Collapsible Left Sidebar */}
      <SidebarNav />

      {/* Main Workspace Area */}
      <motion.div
        animate={{ paddingLeft: collapsed ? 80 : 280 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col min-w-0 min-h-screen"
      >
        {/* Top Header */}
        <HeaderBar />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </motion.div>

      {/* Global Cmd+K Fuzzy Finder Modal */}
      <SearchBar />
    </div>
  );
}
