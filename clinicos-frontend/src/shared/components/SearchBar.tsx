'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Phone, Mail, FileText, CornerDownLeft, X } from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import { usePatients } from '../hooks/useClinicApi';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  const searchOpen = useUiStore((state) => state.searchOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const setActivePatientId = useUiStore((state) => state.setActivePatientId);

  const { data: patients = [] } = usePatients();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global key listener for Cmd+K / Ctrl+K & Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  const filteredPatients = query.trim() === '' 
    ? patients.slice(0, 4) 
    : patients.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query) ||
        (p.email && p.email.toLowerCase().includes(query.toLowerCase()))
      );

  // Keyboard navigation within list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredPatients.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredPatients.length) % Math.max(1, filteredPatients.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPatients[selectedIndex]) {
        handleSelectPatient(filteredPatients[selectedIndex].id);
      }
    }
  };

  const handleSelectPatient = (id: string) => {
    setActivePatientId(id);
    setSearchOpen(false);
    router.push(`/patients`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSearchOpen(false)}
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-2xl overflow-hidden flex flex-col max-h-[420px]"
            onKeyDown={handleListKeyDown}
            ref={containerRef}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 border-b border-clinic-border h-12">
              <Search className="h-4 w-4 text-clinic-text-secondary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search patient name, phone, or email..."
                className="flex-1 bg-transparent border-0 text-sm text-clinic-text-primary focus:outline-none focus:ring-0 placeholder:text-clinic-text-secondary h-full"
              />
              <button 
                onClick={() => setSearchOpen(false)}
                className="p-1 text-clinic-text-secondary hover:text-clinic-text-primary rounded-md hover:bg-clinic-bg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredPatients.length === 0 ? (
                <div className="py-8 text-center text-sm text-clinic-text-secondary flex flex-col items-center justify-center gap-2">
                  <User className="h-8 w-8 text-clinic-border" />
                  <p>No patients found matching "{query}"</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">
                    {query.trim() === '' ? 'Recent Patients' : 'Matching Patients'}
                  </div>
                  {filteredPatients.map((patient, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient.id)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-clinic-10 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-clinic-accent text-white' 
                            : 'hover:bg-clinic-bg text-clinic-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-full ${isSelected ? 'bg-white/10' : 'bg-clinic-bg'}`}>
                            <User className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-clinic-text-secondary'}`} />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="text-sm font-medium truncate">{patient.name}</span>
                            <div className="flex items-center gap-3 text-xs mt-0.5">
                              <span className={`flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-clinic-text-secondary'}`}>
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </span>
                              <span className={`flex items-center gap-1 truncate ${isSelected ? 'text-white/80' : 'text-clinic-text-secondary'}`}>
                                <Mail className="h-3 w-3" />
                                {patient.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">
                            <span>Open</span>
                            <CornerDownLeft className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Commands */}
            <div className="border-t border-clinic-border px-4 py-2 bg-clinic-bg text-[10px] text-clinic-text-secondary flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Navigate: <kbd className="bg-clinic-surface border border-clinic-border px-1 rounded">↓↑</kbd></span>
                <span>Select: <kbd className="bg-clinic-surface border border-clinic-border px-1 rounded">Enter</kbd></span>
              </div>
              <div>
                <span>Close: <kbd className="bg-clinic-surface border border-clinic-border px-1 rounded">Esc</kbd></span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SearchBar;
