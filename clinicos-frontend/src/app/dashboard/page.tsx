'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/shared/stores/uiStore';
import DoctorDashboard from '@/shared/components/DoctorDashboard';
import ReceptionDashboard from '@/shared/components/ReceptionDashboard';
import SuperAdminDashboard from '@/shared/components/SuperAdminDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const currentRole = useUiStore((state) => state.currentRole);

  useEffect(() => {
    // Client-side authentication check
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('clinicos_token');
      if (!token) {
        router.push('/');
      }
    }
  }, [router]);

  // Dynamically render dashboard based on resolved user role
  switch (currentRole) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'receptionist':
      return <ReceptionDashboard />;
    case 'doctor':
    default:
      return <DoctorDashboard />;
  }
}
