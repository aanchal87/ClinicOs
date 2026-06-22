'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Bell, Activity, Clock } from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import { useTokens, socket } from '../hooks/useClinicApi';
import { AnimatePresence, motion } from 'framer-motion';
import Badge from './ui/Badge';

export default function HeaderBar() {
  const queryClient = useQueryClient();
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const role = useUiStore((state) => state.currentRole);
  
  // Real-time query sync
  const { data: tokens = [] } = useTokens();

  // Real-time notification ticker
  const [latestEvent, setLatestEvent] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleEvent = (event: string, data: any) => {
      // Invalidate the tokens cache to trigger immediate UI redraws on any event
      queryClient.invalidateQueries({ queryKey: ['tokens'] });

      let message = '';
      switch (event) {
        case 'token_created':
          message = `Token ${data.tokenNumber} created for ${data.patientName}`;
          break;
        case 'token_called':
          message = `Token ${data.tokenNumber} (${data.patientName}) called by Doctor`;
          break;
        case 'consultation_started':
          message = `Consultation started for ${data.patientName}`;
          break;
        case 'consultation_completed':
          message = `Consultation completed for ${data.patientName}`;
          break;
        case 'token_missed':
          message = `Token ${data.tokenNumber} marked as missed`;
          break;
        default:
          message = `System update received`;
      }
      
      setLatestEvent({ type: event, message });
      
      // Auto-clear notification after 5 seconds
      const timer = setTimeout(() => {
        setLatestEvent(null);
      }, 5000);
      return () => clearTimeout(timer);
    };

    socket.on('token_created', (data: any) => handleEvent('token_created', data));
    socket.on('token_called', (data: any) => handleEvent('token_called', data));
    socket.on('consultation_started', (data: any) => handleEvent('consultation_started', data));
    socket.on('consultation_completed', (data: any) => handleEvent('consultation_completed', data));
    socket.on('token_missed', (data: any) => handleEvent('token_missed', data));

    return () => {
      socket?.off('token_created');
      socket?.off('token_called');
      socket?.off('consultation_started');
      socket?.off('consultation_completed');
      socket?.off('token_missed');
    };
  }, [queryClient]);

  // Compute live queue stats
  const currentToken = tokens.find(t => t.status === 'called' || t.status === 'started');
  const nextToken = tokens.find(t => t.status === 'waiting');
  const waitingCount = tokens.filter(t => t.status === 'waiting').length;

  return (
    <header className="h-16 border-b border-clinic-border bg-clinic-surface flex items-center justify-between px-8 shrink-0 relative z-20">
      {/* Left Search Trigger Pill */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center justify-between gap-3 px-3 py-1.5 w-64 bg-clinic-bg border border-clinic-border hover:border-zinc-300 dark:hover:border-zinc-700 text-clinic-text-secondary rounded-clinic-10 text-xs text-left cursor-pointer transition-colors shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search patient (Cmd+K)...</span>
          </div>
          <kbd className="hidden sm:inline-block bg-clinic-surface border border-clinic-border px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Center Live WebSocket Event Ticker */}
      <div className="flex-1 max-w-xs hidden md:flex justify-center">
        <AnimatePresence mode="wait">
          {latestEvent && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-clinic-accent/10 border border-clinic-accent/30 text-clinic-accent text-xs font-semibold rounded-full shadow-sm"
            >
              <Activity className="h-3.5 w-3.5 animate-pulse text-clinic-accent" />
              <span className="truncate">{latestEvent.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Action & Global Token Widget Area */}
      <div className="flex items-center gap-4">
        {/* Persistent Global Token Widget */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-clinic-bg border border-clinic-border rounded-clinic-10 text-xs font-semibold select-none shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-clinic-text-secondary uppercase">Current:</span>
            <span className={currentToken ? "text-clinic-accent font-extrabold" : "text-clinic-text-secondary"}>
              {currentToken ? currentToken.tokenNumber : '--'}
            </span>
          </div>
          <div className="h-3 w-px bg-clinic-border" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-clinic-text-secondary uppercase">Next:</span>
            <span className={nextToken ? "text-clinic-text-primary font-bold" : "text-clinic-text-secondary"}>
              {nextToken ? nextToken.tokenNumber : '--'}
            </span>
          </div>
          <div className="h-3 w-px bg-clinic-border" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-clinic-text-secondary uppercase">Waiting:</span>
            <Badge variant={waitingCount > 0 ? "warning" : "neutral"} className="px-1.5 py-0">
              {waitingCount}
            </Badge>
          </div>
        </div>

        {/* Role Indicator Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-clinic-bg border border-clinic-border text-clinic-text-secondary rounded-full text-xs font-medium capitalize">
          <span className="h-2 w-2 rounded-full bg-clinic-success animate-ping" />
          <Clock className="h-3 w-3" />
          <span>{role} Console</span>
        </div>

        <button className="p-2 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-full border border-clinic-border bg-clinic-surface shadow-sm cursor-pointer relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-clinic-danger" />
        </button>
      </div>
    </header>
  );
}
