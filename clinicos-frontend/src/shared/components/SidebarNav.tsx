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
<<<<<<< HEAD
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
  const role = useUiStore((state) => state.currentRole);
  const darkMode = useUiStore((state) => state.darkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);

  const [currentUser, setCurrentUser] = useState<any>(null);
<<<<<<< HEAD
  const [wideSidebar, setWideSidebar] = useState(false);
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec

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
<<<<<<< HEAD
    { name: role === 'doctor' ? 'Waiting Queue' : 'Check-in Queue', path: '/queue', icon: Clock, roles: ['doctor', 'receptionist', 'super_admin'] },
=======
    { name: 'Queue Manager', path: '/queue', icon: Clock, roles: ['doctor', 'receptionist', 'super_admin'] },
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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

<<<<<<< HEAD
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const syncSidebar = () => {
      setWideSidebar(media.matches);
      setSidebarCollapsed(!media.matches);
    };
    syncSidebar();
    media.addEventListener('change', syncSidebar);
    return () => media.removeEventListener('change', syncSidebar);
  }, [setSidebarCollapsed]);

=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
<<<<<<< HEAD
      className="fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-[#102a29] border-r border-white/10 h-full overflow-hidden text-white shadow-xl shadow-[#102a29]/10"
    >
      {/* Brand Header */}
      <div className={clsx("flex items-center justify-between h-[76px] border-b border-white/10 shrink-0", collapsed || !wideSidebar ? "px-4" : "px-6")}>
        {!collapsed && wideSidebar && (
=======
      className="fixed inset-y-0 left-0 z-30 flex flex-col bg-clinic-surface border-r border-clinic-border h-full overflow-hidden"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-clinic-border shrink-0">
        {!collapsed && (
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <BrandLogo size="md" />
<<<<<<< HEAD
            <span className="text-base font-semibold tracking-tight text-white">ClinicOS</span>
          </motion.div>
        )}
        {(collapsed || !wideSidebar) && (
=======
            <span className="text-base font-bold tracking-tight text-clinic-text-primary">ClinicOS</span>
          </motion.div>
        )}
        {collapsed && (
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="mx-auto">
            <BrandLogo size="md" />
          </div>
        )}
<<<<<<< HEAD
        {!collapsed && wideSidebar && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
=======
        {!collapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-lg cursor-pointer"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
<<<<<<< HEAD
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
        {!collapsed && wideSidebar && <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Workspace</p>}
=======
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        {filteredItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
          return (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className={clsx(
<<<<<<< HEAD
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer group",
                isActive 
                  ? "bg-[#70c5b4]/15 text-[#a9e2d5] shadow-sm" 
                  : "text-white/65 hover:text-white hover:bg-white/[0.07]"
=======
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-clinic-10 text-sm font-medium transition-colors cursor-pointer group",
                isActive 
                  ? "bg-clinic-accent/10 text-clinic-accent dark:bg-clinic-accent/20" 
                  : "text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
              )}
            >
              <item.icon className={clsx(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
<<<<<<< HEAD
                isActive ? "text-[#a9e2d5]" : "text-white/50 group-hover:text-white"
              )} />
              {!collapsed && wideSidebar && (
=======
                isActive ? "text-clinic-accent" : "text-clinic-text-secondary group-hover:text-clinic-text-primary"
              )} />
              {!collapsed && (
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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
<<<<<<< HEAD
      <div className="p-4 border-t border-white/10 flex flex-col gap-3 shrink-0 bg-black/10">
=======
      <div className="p-4 border-t border-clinic-border flex flex-col gap-3 shrink-0 bg-clinic-bg/50">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        
        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className={clsx(
<<<<<<< HEAD
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer text-white/60 hover:text-white hover:bg-white/[0.07]",
            (collapsed || !wideSidebar) && "justify-center"
=======
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-clinic-10 text-sm font-medium transition-colors cursor-pointer text-clinic-danger hover:bg-clinic-danger/10",
            collapsed && "justify-center"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
<<<<<<< HEAD
          {!collapsed && wideSidebar && <span>Sign Out</span>}
        </button>

        {/* Theme + Avatar Controls */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
=======
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Theme + Avatar Controls */}
        <div className="flex items-center justify-between border-t border-clinic-border/50 pt-3 mt-1">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="flex items-center gap-3 min-w-0">
            <Avatar 
              name={displayEmail} 
              size="sm"
            />
<<<<<<< HEAD
            {!collapsed && wideSidebar && (
=======
            {!collapsed && (
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-w-0"
              >
<<<<<<< HEAD
                <span className="text-xs font-semibold text-white truncate">
                  {displayRole}
                </span>
                <span className="text-[10px] text-white/50 truncate">
=======
                <span className="text-xs font-semibold text-clinic-text-primary truncate">
                  {displayRole}
                </span>
                <span className="text-[10px] text-clinic-text-secondary truncate">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                  {displayEmail}
                </span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
<<<<<<< HEAD
            {(collapsed || !wideSidebar) && (
              <button 
                onClick={toggleSidebar}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
=======
            {collapsed && (
              <button 
                onClick={toggleSidebar}
                className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-lg cursor-pointer"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={toggleDarkMode}
<<<<<<< HEAD
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
=======
              className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-lg cursor-pointer"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
