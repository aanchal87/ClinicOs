'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, Users, Clock, Calendar, 
  ClipboardList, TestTube, PhoneCall, Image as ImageIcon, 
  BarChart2, Settings, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Shield, User, MessageSquare
} from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import Avatar from './ui/Avatar';
import BrandLogo from './ui/BrandLogo';
import apiClient from '../services/apiClient';

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const role = useUiStore((state) => state.currentRole);
  const darkMode = useUiStore((state) => state.darkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('clinicos_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      }
    }
  }, []);

  // Dynamic navigation items based on role
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['doctor', 'receptionist', 'super_admin'] },
    { name: 'Patient 360', path: '/patients', icon: Users, roles: ['doctor', 'receptionist', 'super_admin'] },
    { name: 'Queue Manager', path: '/queue', icon: Clock, roles: ['doctor', 'receptionist', 'super_admin'] },
    { name: 'Calendar', path: '/calendar', icon: Calendar, roles: ['doctor', 'receptionist', 'super_admin'] },
    { name: 'Consultations', path: '/consultations', icon: ClipboardList, roles: ['doctor', 'super_admin'] },
    { name: 'Laboratory', path: '/laboratory', icon: TestTube, roles: ['doctor', 'super_admin'] },
    { name: 'Follow-Ups', path: '/followups', icon: PhoneCall, roles: ['doctor', 'receptionist', 'super_admin'] },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon, roles: ['doctor', 'super_admin'] },
    { name: 'Analytics', path: '/reports', icon: BarChart2, roles: ['doctor', 'super_admin'] },
    { name: 'Notifications', path: '/notifications', icon: MessageSquare, roles: ['receptionist', 'super_admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['super_admin'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: Shield, roles: ['super_admin'] },
    { name: 'User Management', path: '/users', icon: User, roles: ['super_admin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout API call failed:', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('clinicos_token');
        localStorage.removeItem('clinicos_user');
        window.location.href = '/';
      }
    }
  };

  const displayRole = role === 'super_admin' ? 'Super Admin' : role === 'doctor' ? 'Doctor' : 'Receptionist';
  const displayEmail = currentUser?.email || 'Staff Room';

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col bg-clinic-surface border-r border-clinic-border h-full overflow-hidden"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-clinic-border shrink-0">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <BrandLogo size="md" />
            <span className="text-base font-bold tracking-tight text-clinic-text-primary">ClinicOS</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <BrandLogo size="md" />
          </div>
        )}
        {!collapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-lg cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
          return (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-clinic-10 text-sm font-medium transition-colors cursor-pointer group",
                isActive 
                  ? "bg-clinic-accent/10 text-clinic-accent dark:bg-clinic-accent/20" 
                  : "text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg"
              )}
            >
              <item.icon className={clsx(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                isActive ? "text-clinic-accent" : "text-clinic-text-secondary group-hover:text-clinic-text-primary"
              )} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-clinic-border flex flex-col gap-3 shrink-0 bg-clinic-bg/50">
        
        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-clinic-10 text-sm font-medium transition-colors cursor-pointer text-clinic-danger hover:bg-clinic-danger/10",
            collapsed && "justify-center"
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Theme + Avatar Controls */}
        <div className="flex items-center justify-between border-t border-clinic-border/50 pt-3 mt-1">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar 
              name={displayEmail} 
              size="sm"
            />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-xs font-semibold text-clinic-text-primary truncate">
                  {displayRole}
                </span>
                <span className="text-[10px] text-clinic-text-secondary truncate">
                  {displayEmail}
                </span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            {collapsed && (
              <button 
                onClick={toggleSidebar}
                className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-lg cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-lg cursor-pointer"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
