'use client';

import React, { useState } from 'react';
import { 
  useSuperAdminHealth, 
  useSuperAdminStats, 
  useSuperAdminAuditLogs, 
  useSuperAdminUsersList, 
  useSuperAdminClinicsList 
} from '@/shared/hooks/useClinicApi';
import { useUiStore } from '@/shared/stores/uiStore';
import apiClient from '@/shared/services/apiClient';
import { 
  Shield, Server, Database, Key, Activity, 
  Users, Building, DollarSign, ListFilter,
  CheckCircle, XCircle, AlertCircle, RefreshCw,
  Search, ToggleLeft, ToggleRight, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Skeleton from '@/shared/components/ui/Skeleton';

export default function SuperAdminDashboard() {
  const currentRole = useUiStore((state) => state.currentRole);
  const isAdmin = currentRole === 'super_admin';

  const { data: systemHealth, isLoading: isLoadingHealth, error: healthError, refetch: refetchHealth, isFetching: isFetchingHealth } = useSuperAdminHealth(isAdmin);
  const { data: stats, isLoading: isLoadingStats, error: statsError, refetch: refetchStats, isFetching: isFetchingStats } = useSuperAdminStats(isAdmin);
  const { data: auditLogs = [], isLoading: isLoadingLogs, error: logsError, refetch: refetchLogs, isFetching: isFetchingLogs } = useSuperAdminAuditLogs(isAdmin);
  const { data: users = [], isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers, isFetching: isFetchingUsers } = useSuperAdminUsersList(isAdmin);
  const { data: clinics = [], isLoading: isLoadingClinics, error: clinicsError, refetch: refetchClinics, isFetching: isFetchingClinics } = useSuperAdminClinicsList(isAdmin);

  const isFetching = isFetchingHealth || isFetchingStats || isFetchingLogs || isFetchingUsers || isFetchingClinics;

  const refetch = () => {
    refetchHealth();
    refetchStats();
    refetchLogs();
    refetchUsers();
    refetchClinics();
  };
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    try {
      await apiClient.put(`/users/${userId}/status`, { isActive: !currentStatus });
      await refetchUsers();
      alert('User status updated successfully.');
    } catch (err: any) {
      console.error('Failed to toggle user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Removed page-level error check to allow independent card rendering

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto relative p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-clinic-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary flex items-center gap-2">
            <Shield className="h-5 w-5 text-clinic-accent" />
            <span>Super Admin Operations Center</span>
          </h1>
          <p className="text-xs text-clinic-text-secondary mt-1">
            ClinicOS system health, active sessions telemetry, tenant clinics, and audit logs.
          </p>
        </div>

        <div>
          <Button
            variant="ghost"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-clinic-text-secondary hover:text-clinic-text-primary"
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Syncing...' : 'Sync System'}</span>
          </Button>
        </div>
      </div>

      {/* SYSTEM TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoadingHealth ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm h-[74px] flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex flex-col gap-1.5 w-24">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))
        ) : healthError ? (
          <div className="col-span-full p-4 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
            Failed to load system health telemetry.
          </div>
        ) : (
          <>
            {/* Core API */}
            <div className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm flex items-center gap-4">
              <div className="bg-clinic-accent/10 text-clinic-accent rounded-xl p-3 shrink-0">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-clinic-text-secondary uppercase tracking-wider block">
                  Core NestJS API
                </span>
                <span className="text-sm font-bold text-clinic-text-primary flex items-center gap-1.5 mt-0.5">
                  {systemHealth?.api === 'healthy' ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-clinic-success animate-pulse" />
                      <span className="text-clinic-success font-semibold text-xs">ONLINE</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-clinic-danger animate-pulse" />
                      <span className="text-clinic-danger font-semibold text-xs">UNAVAILABLE</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* PostgreSQL Database */}
            <div className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-500/10 text-emerald-500 rounded-xl p-3 shrink-0">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-clinic-text-secondary uppercase tracking-wider block">
                  PostgreSQL Database
                </span>
                <span className="text-sm font-bold text-clinic-text-primary flex items-center gap-1.5 mt-0.5">
                  {systemHealth?.database === 'healthy' ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-clinic-success animate-pulse" />
                      <span className="text-clinic-success font-semibold text-xs">ONLINE</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-clinic-danger animate-pulse" />
                      <span className="text-clinic-danger font-semibold text-xs">OFFLINE</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Redis Cache & Sessions */}
            <div className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm flex items-center gap-4">
              <div className="bg-rose-500/10 text-rose-500 rounded-xl p-3 shrink-0">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-clinic-text-secondary uppercase tracking-wider block">
                  Redis Session Cache
                </span>
                <span className="text-sm font-bold text-clinic-text-primary flex items-center gap-1.5 mt-0.5">
                  {systemHealth?.redis === 'healthy' ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-clinic-success animate-pulse" />
                      <span className="text-clinic-success font-semibold text-xs">ONLINE</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-clinic-danger animate-pulse" />
                      <span className="text-clinic-danger font-semibold text-xs">DISCONNECTED</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm flex items-center gap-4">
              <div className="bg-indigo-500/10 text-indigo-500 rounded-xl p-3 shrink-0">
                <Key className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-clinic-text-secondary uppercase tracking-wider block">
                  Active User Sessions
                </span>
                <span className="text-base font-extrabold text-clinic-text-primary mt-0.5">
                  {systemHealth?.activeSessions ?? 0} <span className="text-[10px] text-clinic-text-secondary font-normal">sessions cached</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm h-[92px] flex flex-col justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-12 mt-2" />
            </div>
          ))
        ) : statsError ? (
          <div className="col-span-full p-4 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
            Failed to load admin stats telemetry.
          </div>
        ) : (
          [
            { label: 'Total Tenant Clinics', value: stats?.totalClinics ?? 0, icon: Building, color: 'text-clinic-accent bg-clinic-accent/10' },
            { label: 'Total Registered Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
            { label: 'Total Patients Managed', value: stats?.totalPatients ?? 0, icon: Activity, color: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Total System Revenue (Est)', value: `₹${stats?.totalRevenue ?? 0}`, icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' }
          ].map((item, idx) => (
            <div key={idx} className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-clinic-text-secondary uppercase tracking-wider">{item.label}</span>
                <div className={`p-1.5 rounded-lg ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-bold mt-2 text-clinic-text-primary">{item.value}</div>
            </div>
          ))
        )}
      </div>

      {/* LOWER PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* USER MANAGEMENT & ACTIVATION TOGGLE */}
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4 lg:col-span-2 min-h-[350px]">
          <div className="flex justify-between items-center border-b border-clinic-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
              Identity & Access Management (Users)
            </h2>
            <Badge variant="neutral">Active Accounts</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-clinic-border text-clinic-text-secondary font-semibold">
                  <th className="pb-3 pr-2">Email Address</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">Registered On</th>
                  <th className="pb-3 px-2 text-center">Status</th>
                  <th className="pb-3 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                 {isLoadingUsers ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-clinic-border/40 last:border-0 h-[49px]">
                      <td className="py-3.5 pr-2"><Skeleton className="h-4 w-32 rounded" /></td>
                      <td className="py-3.5 px-2"><Skeleton className="h-5 w-16 rounded" /></td>
                      <td className="py-3.5 px-2"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="py-3.5 px-2 text-center"><Skeleton className="h-4 w-12 mx-auto rounded" /></td>
                      <td className="py-3.5 pl-2 text-right"><Skeleton className="h-4 w-12 ml-auto rounded" /></td>
                    </tr>
                  ))
                ) : usersError ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-clinic-danger italic">
                      Failed to load users directory.
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-clinic-text-secondary italic">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="border-b border-clinic-border/40 hover:bg-clinic-bg/40 last:border-0">
                      <td className="py-3.5 pr-2 font-semibold text-clinic-text-primary">{u.email}</td>
                      <td className="py-3.5 px-2">
                        <Badge variant={u.role === 'SUPER_ADMIN' ? 'danger' : u.role === 'DOCTOR' ? 'info' : 'neutral'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-2 text-clinic-text-secondary">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 font-semibold ${u.isActive ? 'text-clinic-success' : 'text-clinic-text-secondary'}`}>
                          {u.isActive ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 text-clinic-success" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-clinic-text-secondary" />
                              <span>Suspended</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <button
                          onClick={() => toggleUserActive(u.id, u.isActive)}
                          disabled={updatingUserId === u.id || u.role === 'SUPER_ADMIN'}
                          className={`inline-flex items-center gap-1 font-semibold text-xs hover:underline cursor-pointer disabled:opacity-50 ${u.isActive ? 'text-clinic-danger' : 'text-clinic-accent'}`}
                        >
                          {u.isActive ? (
                            <>
                              <ToggleRight className="h-4 w-4" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* CLINIC SETTINGS / FEATURE FLAGS */}
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4 min-h-[350px]">
          <div className="flex justify-between items-center border-b border-clinic-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
              Clinic Feature Flags
            </h2>
            <Settings className="h-4 w-4 text-clinic-text-secondary" />
          </div>

          <div className="flex flex-col gap-3">
            {[
              { name: 'Reports Analytics', key: 'reports_enabled', desc: 'Enable operational analytics modules' },
              { name: 'Laboratory Integration', key: 'labs_enabled', desc: 'Lab report uploading & review drawers' },
              { name: 'Patient Image Gallery', key: 'gallery_enabled', desc: 'Consultation scan timelines & gallery' },
              { name: 'Follow-Up Recalls', key: 'followups_enabled', desc: 'Front-desk recall list & callbacks' },
              { name: 'WhatsApp Queue Alerts', key: 'whatsapp_enabled', desc: 'Realtime token check-in messages' }
            ].map((flag) => (
              <div key={flag.key} className="flex justify-between items-start p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-semibold text-clinic-text-primary">{flag.name}</span>
                  <span className="text-[10px] text-clinic-text-secondary mt-0.5 leading-tight">{flag.desc}</span>
                </div>
                <Badge variant="success">ENABLED</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FULL SYSTEM AUDIT LOG */}
      <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-clinic-border pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
            System Operations Audit Log
          </h2>
          <Badge variant="danger">Security Log</Badge>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto pr-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-clinic-border text-clinic-text-secondary font-semibold">
                <th className="pb-3 pr-2">Timestamp</th>
                <th className="pb-3 px-2">Account</th>
                <th className="pb-3 px-2">Role</th>
                <th className="pb-3 px-2">Action / Operations</th>
                <th className="pb-3 px-2">IP Address</th>
                <th className="pb-3 pl-2 text-right">Context Metadata</th>
              </tr>
            </thead>
            <tbody>
               {isLoadingLogs ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-clinic-border/40 last:border-0 h-[41px]">
                    <td className="py-3 pr-2"><Skeleton className="h-3.5 w-24 rounded" /></td>
                    <td className="py-3 px-2"><Skeleton className="h-3.5 w-32 rounded" /></td>
                    <td className="py-3 px-2"><Skeleton className="h-5 w-16 rounded" /></td>
                    <td className="py-3 px-2"><Skeleton className="h-3.5 w-20 rounded" /></td>
                    <td className="py-3 px-2"><Skeleton className="h-3.5 w-16 rounded" /></td>
                    <td className="py-3 pl-2 text-right"><Skeleton className="h-3.5 w-12 ml-auto rounded" /></td>
                  </tr>
                ))
              ) : logsError ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-clinic-danger italic">
                    Failed to load security audit logs.
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-clinic-text-secondary italic">
                    No system operations audit logs recorded.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log: any) => {
                  const date = new Date(log.timestamp);
                  const dtStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                  return (
                    <tr key={log.id} className="border-b border-clinic-border/40 hover:bg-clinic-bg/40 last:border-0">
                      <td className="py-3 pr-2 text-clinic-text-secondary font-mono">{dtStr}</td>
                      <td className="py-3 px-2 font-semibold text-clinic-text-primary">{log.user?.email || 'System'}</td>
                      <td className="py-3 px-2">
                        <Badge variant={log.role === 'SUPER_ADMIN' ? 'danger' : log.role === 'DOCTOR' ? 'info' : 'neutral'}>
                          {log.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 font-mono text-clinic-accent font-semibold">{log.action}</td>
                      <td className="py-3 px-2 text-clinic-text-secondary font-mono">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-3 pl-2 text-right text-[10px] text-clinic-text-secondary font-mono truncate max-w-[200px]" title={log.metadata ? JSON.stringify(log.metadata) : ''}>
                        {log.metadata ? JSON.stringify(log.metadata) : '{}'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
