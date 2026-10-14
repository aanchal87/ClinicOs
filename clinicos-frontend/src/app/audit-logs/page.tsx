'use client';

import React from 'react';
import { useSuperAdminAuditLogs } from '@/shared/hooks/useClinicApi';
import { useUiStore } from '@/shared/stores/uiStore';
import { Shield, RefreshCw } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Skeleton from '@/shared/components/ui/Skeleton';

export default function AuditLogsPage() {
  const currentRole = useUiStore((state) => state.currentRole);
  const isAdmin = currentRole === 'super_admin';

  const { data: auditLogs = [], isLoading: isLoadingLogs, error: logsError, refetch: refetchLogs, isFetching: isFetchingLogs } = useSuperAdminAuditLogs(isAdmin);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-clinic-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary flex items-center gap-2">
            <Shield className="h-5 w-5 text-clinic-accent" />
            <span>System Operations Audit Log</span>
          </h1>
          <p className="text-xs text-clinic-text-secondary mt-1">
            Real-time security telemetry of administrative actions, user logins, and database mutations.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => refetchLogs()}
          className="flex items-center gap-1.5 text-xs text-clinic-text-secondary hover:text-clinic-text-primary"
          disabled={isFetchingLogs}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLogs ? 'animate-spin' : ''}`} />
          <span>{isFetchingLogs ? 'Syncing...' : 'Sync Logs'}</span>
        </Button>
      </div>

      {/* Table section */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-1">
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
                Array.from({ length: 10 }).map((_, i) => (
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
                      <td className="py-3 pl-2 text-right text-[10px] text-clinic-text-secondary font-mono truncate max-w-[300px]" title={log.metadata ? JSON.stringify(log.metadata) : ''}>
                        {log.metadata ? JSON.stringify(log.metadata) : '{}'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
