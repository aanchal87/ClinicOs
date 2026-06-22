'use client';

import React, { useState } from 'react';
import { usePatients, useFollowUps, useUpdateFollowUpStatus } from '@/shared/hooks/useClinicApi';
import { 
  Phone, Mail, Calendar, Search, AlertCircle, 
  CheckCircle2, Bell, CheckSquare, Square, Inbox,
  Clock, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Spinner from '@/shared/components/ui/Spinner';

interface RecallItem {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  dueDate: string;
  reason: string;
  status: 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'completed';
}

export default function FollowUpsPage() {
  const { data: patients = [] } = usePatients();
  const { data: dbFollowUps = [], isLoading } = useFollowUps();
  const updateStatusMutation = useUpdateFollowUpStatus();

  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'this_week' | 'overdue' | 'completed'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper: map backend followup item to frontend RecallItem format
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const mapStatus = (item: any): 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'completed' => {
    if (item.status === 'COMPLETED' || item.status === 'RESOLVED') {
      return 'completed';
    }
    const due = item.dueDate;
    if (due === todayStr) return 'today';
    if (due === tomorrowStr) return 'tomorrow';
    if (due < todayStr) return 'overdue';
    return 'this_week';
  };

  const recalls: RecallItem[] = dbFollowUps.map((item: any) => ({
    id: item.id,
    patientId: item.patientId,
    patientName: item.patient?.fullName || 'Patient',
    phone: item.patient?.phone || '555-0199',
    dueDate: item.dueDate,
    reason: item.reason || 'Post-consultation follow-up',
    status: mapStatus(item)
  }));

  const handleResolveRecall = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'COMPLETED' });
  };

  const handleRequeue = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'SCHEDULED' });
  };

  const filteredRecalls = recalls.filter(r => 
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const listItems = filteredRecalls.filter(r => r.status === activeTab);

  // Tab counters helper
  const getCount = (status: RecallItem['status']) => recalls.filter(r => r.status === status).length;

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">Clinical Recall Inbox</h1>
        <p className="text-sm text-clinic-text-secondary mt-1">
          A centralized, Linear-style inbox to track scheduled patient recalls, phone callbacks, and completed checkups.
        </p>
      </div>

      {/* Search and Category Tabs */}
      <div className="flex flex-col gap-4 bg-clinic-surface border border-clinic-border p-4 rounded-clinic-14 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-clinic-text-secondary" />
          <input
            type="text"
            placeholder="Search recalls by patient name or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
          />
        </div>

        {/* Tab Lists Navigation */}
        <div className="flex gap-2 border-b border-clinic-border overflow-x-auto pb-px scrollbar-none">
          {[
            { label: 'Today', value: 'today' },
            { label: 'Tomorrow', value: 'tomorrow' },
            { label: 'This Week', value: 'this_week' },
            { label: 'Overdue', value: 'overdue' },
            { label: 'Completed', value: 'completed' }
          ].map(tab => {
            const count = getCount(tab.value as any);
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent cursor-pointer transition-all flex items-center gap-2 focus:outline-none shrink-0 ${
                  isActive 
                    ? 'border-clinic-accent text-clinic-accent' 
                    : 'text-clinic-text-secondary hover:text-clinic-text-primary'
                }`}
              >
                <span>{tab.label}</span>
                <Badge variant={count > 0 ? (tab.value === 'overdue' ? 'danger' : 'neutral') : 'neutral'} className="px-1.5 py-0">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List (Linear Inbox Style) */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Spinner /></div>
          ) : listItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center text-clinic-text-secondary flex flex-col items-center justify-center gap-3"
            >
              <Inbox className="h-8 w-8 text-clinic-border" />
              <div>
                <h3 className="text-sm font-bold text-clinic-text-primary">Inbox Clear</h3>
                <p className="text-xs text-clinic-text-secondary mt-1">No recall items listed in this category.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col divide-y divide-clinic-border"
            >
              {listItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 hover:bg-clinic-bg/40 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Checkbox action */}
                    {item.status !== 'completed' ? (
                      <button
                        onClick={() => handleResolveRecall(item.id)}
                        className="p-1 text-clinic-text-secondary hover:text-clinic-success rounded-md hover:bg-clinic-bg mt-0.5 cursor-pointer"
                        title="Mark Completed"
                      >
                        <Square className="h-4.5 w-4.5" />
                      </button>
                    ) : (
                      <div className="p-1 text-clinic-success mt-0.5">
                        <CheckSquare className="h-4.5 w-4.5" />
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-clinic-text-primary text-sm">{item.patientName}</span>
                        <span className="text-[10px] text-clinic-text-secondary pr-2">Phone: {item.phone}</span>
                        {item.status === 'overdue' && (
                          <Badge variant="danger" className="text-[9px] uppercase font-bold py-0">Overdue</Badge>
                        )}
                      </div>
                      <span className="text-xs text-clinic-text-secondary mt-1">{item.reason}</span>
                    </div>
                  </div>

                  {/* Actions / Info */}
                  <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                    <span className="text-xs text-clinic-text-secondary flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Due {item.dueDate}
                    </span>
                    
                    {item.status !== 'completed' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResolveRecall(item.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <span>Resolve</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRequeue(item.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <span>Re-Queue</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
