'use client';

import React, { useState } from 'react';
import { useSuperAdminUsersList } from '@/shared/hooks/useClinicApi';
import { useUiStore } from '@/shared/stores/uiStore';
import apiClient from '@/shared/services/apiClient';
import { 
  Users, CheckCircle, XCircle, RefreshCw, ToggleLeft, ToggleRight 
} from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Skeleton from '@/shared/components/ui/Skeleton';

export default function UserManagementPage() {
  const currentRole = useUiStore((state) => state.currentRole);
  const isAdmin = currentRole === 'super_admin';

  const { data: users = [], isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers, isFetching: isFetchingUsers } = useSuperAdminUsersList(isAdmin);
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

  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-clinic-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-clinic-accent" />
            <span>Identity & Access Management (Users)</span>
          </h1>
          <p className="text-xs text-clinic-text-secondary mt-1">
            Manage credentials, account statuses, and system roles for clinic staff.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => refetchUsers()}
          className="flex items-center gap-1.5 text-xs text-clinic-text-secondary hover:text-clinic-text-primary"
          disabled={isFetchingUsers}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetchingUsers ? 'animate-spin' : ''}`} />
          <span>{isFetchingUsers ? 'Syncing...' : 'Sync Users'}</span>
        </Button>
      </div>

      {/* Table section */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm">
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
                Array.from({ length: 5 }).map((_, i) => (
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
      </div>
    </div>
  );
}
