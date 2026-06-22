'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppLayout from './AppLayout';
import { useQueueSocketSync } from '@/shared/hooks/useClinicApi';
import { useUiStore } from '@/shared/stores/uiStore';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';

// Route authorization matrix
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['doctor', 'receptionist', 'super_admin'],
  '/patients': ['doctor', 'receptionist', 'super_admin'],
  '/queue': ['doctor', 'receptionist', 'super_admin'],
  '/calendar': ['doctor', 'receptionist', 'super_admin'],
  '/followups': ['doctor', 'receptionist', 'super_admin'],
  '/consultations': ['doctor', 'super_admin'],
  '/laboratory': ['doctor', 'super_admin'],
  '/gallery': ['doctor', 'super_admin'],
  '/reports': ['doctor', 'super_admin'],
  '/settings': ['super_admin'],
  '/users': ['super_admin'],
  '/audit-logs': ['super_admin'],
  '/analytics': ['doctor', 'super_admin'],
  '/notifications': ['receptionist', 'super_admin'],
};

// Helper to decode JWT payload on the client side
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useUiStore((state) => state.currentRole);
  const setCurrentRole = useUiStore((state) => state.setCurrentRole);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Run real-time WebSocket query synchronizer
  useQueueSocketSync();
  
  const isAuthPage = pathname === '/';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('clinicos_token');
      const hasAuth = !!token;
      setIsAuthenticated(hasAuth);

      if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.role) {
          const roleMap: Record<string, 'doctor' | 'receptionist' | 'super_admin'> = {
            'DOCTOR': 'doctor',
            'RECEPTIONIST': 'receptionist',
            'SUPER_ADMIN': 'super_admin'
          };
          const mappedRole = roleMap[payload.role];
          if (mappedRole) {
            setCurrentRole(mappedRole);
          }
        }
      }

      // If not authenticated and trying to access a protected page, redirect to login
      if (!hasAuth && !isAuthPage) {
        router.push('/');
      }
      
      // If authenticated and trying to access login page, redirect to dashboard
      if (hasAuth && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [pathname, isAuthPage, router, setCurrentRole]);

  // Loading state during auth check
  if (!isAuthenticated && !isAuthPage) {
    return (
      <div className="min-h-screen bg-clinic-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-accent" />
      </div>
    );
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-clinic-bg flex flex-col">{children}</div>;
  }

  // Check role authorization for the route
  let isRouteAllowed = true;
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(role)) {
        isRouteAllowed = false;
        break;
      }
    }
  }

  if (!isRouteAllowed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
          <div className="bg-clinic-danger/10 text-clinic-danger p-4 rounded-full mb-6 border border-clinic-danger/20 shadow-lg relative">
            <div className="absolute inset-0 bg-clinic-danger/5 rounded-full filter blur animate-pulse" />
            <ShieldAlert className="h-12 w-12 relative z-10" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-clinic-text-primary tracking-tight">
            403 Forbidden - Access Denied
          </h1>
          
          <p className="text-sm text-clinic-text-secondary mt-3 max-w-md leading-relaxed">
            Your account role (<span className="capitalize font-semibold text-clinic-accent">{role}</span>) does not possess the permissions required to view the workspace at <code className="bg-clinic-surface border border-clinic-border px-1.5 py-0.5 rounded font-mono text-clinic-text-primary text-xs">{pathname}</code>.
          </p>
          
          <div className="mt-8 flex gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-xs font-semibold bg-clinic-accent text-white hover:bg-clinic-accent/90"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
