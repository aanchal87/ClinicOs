'use client';

import React from 'react';
import { 
  BarChart3, Clock, Users, Activity, 
  TrendingUp, Award, ClipboardList, ShieldCheck, Pill, CheckSquare
} from 'lucide-react';
import { useReports } from '@/shared/hooks/useClinicApi';
import Badge from '@/shared/components/ui/Badge';
import Spinner from '@/shared/components/ui/Spinner';

export default function ReportsPage() {
  const { data: reportData, isLoading, isError } = useReports();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Spinner />
        <span className="text-sm text-clinic-text-secondary">Retrieving operational aggregates from PostgreSQL...</span>
      </div>
    );
  }

  if (isError || !reportData) {
    return (
      <div className="py-20 text-center text-clinic-danger flex flex-col items-center gap-2">
        <AlertTriangle className="h-10 w-10" />
        <p className="text-sm font-semibold">Failed to fetch operational report aggregates.</p>
      </div>
    );
  }

  const {
    patientsToday = 0,
    patientsThisWeek = 0,
    patientsThisMonth = 0,
    averageWaitTime = 0,
    longestWaitTime = 0,
    followUpConversion = 0,
    doctorPerformance = [],
    topDiagnoses = [],
    topPrescribedMedicines = [],
    treatmentCompletionRate = 0
  } = reportData;

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">Operational Analytics & Reports</h1>
        <p className="text-sm text-clinic-text-secondary mt-1">
          Review patient throughput, queue waiting delays, clinician performance, and top clinical indicators directly from PostgreSQL.
        </p>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Patients Today */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Patients Today</span>
            <span className="text-2xl font-bold mt-1.5 text-clinic-text-primary">{patientsToday}</span>
            <span className="text-[10px] text-clinic-text-secondary mt-1">Registered & Checked-In</span>
          </div>
          <div className="p-2.5 bg-clinic-accent/10 text-clinic-accent rounded-clinic-12">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Patients This Week */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Patients This Week</span>
            <span className="text-2xl font-bold mt-1.5 text-clinic-text-primary">{patientsThisWeek}</span>
            <span className="text-[10px] text-clinic-text-secondary mt-1">Weekly Active Patients</span>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-clinic-12">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Patients This Month */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Patients This Month</span>
            <span className="text-2xl font-bold mt-1.5 text-clinic-text-primary">{patientsThisMonth}</span>
            <span className="text-[10px] text-clinic-text-secondary mt-1">Monthly Active Patients</span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-clinic-12">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Follow-up Conversion Rate */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Recall Conversion</span>
            <span className="text-2xl font-bold mt-1.5 text-clinic-text-primary">{followUpConversion}%</span>
            <span className="text-[10px] text-clinic-success font-semibold mt-1">Booked / Scheduled Recalls</span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-clinic-success rounded-clinic-12">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* SLA & Wait Times */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Average Wait Time */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Avg Wait Time</span>
            <span className="text-2xl font-bold mt-1.5 text-clinic-text-primary">{averageWaitTime} Mins</span>
            <span className="text-[10px] text-clinic-text-secondary mt-1">Queue check-in to consultation</span>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-clinic-12">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Longest Wait Time */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Longest Wait Time</span>
            <span className="text-2xl font-bold mt-1.5 text-clinic-text-primary">{longestWaitTime} Mins</span>
            <span className="text-[10px] text-clinic-danger font-semibold mt-1">SLA Limit: 60 Mins</span>
          </div>
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-clinic-danger rounded-clinic-12">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Treatment Completion Rate */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Treatment Completion</span>
            <span className="text-2xl font-bold mt-1.5 text-clinic-text-primary">{treatmentCompletionRate}%</span>
            <span className="text-[10px] text-clinic-accent font-semibold mt-1">Outcome Status: Completed</span>
          </div>
          <div className="p-2.5 bg-clinic-accent/10 text-clinic-accent rounded-clinic-12">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Charts & Rankings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Doctor Performance */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-clinic-text-primary uppercase tracking-wider border-b border-clinic-border pb-3 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-clinic-accent" /> Clinician Consultation Load
          </h2>
          {doctorPerformance.length === 0 ? (
            <span className="text-xs text-clinic-text-secondary italic">No active consultation records found.</span>
          ) : (
            <div className="flex flex-col gap-4">
              {doctorPerformance.map((doc: any, i: number) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-clinic-text-primary">
                    <span>{doc.doctorName}</span>
                    <span>{doc.consultationsCount} Visits</span>
                  </div>
                  <div className="w-full h-1.5 bg-clinic-bg rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-clinic-accent rounded-full"
                      style={{ width: `${Math.min(100, (doc.consultationsCount / Math.max(...doctorPerformance.map((d: any) => d.consultationsCount), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Diagnoses */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-clinic-text-primary uppercase tracking-wider border-b border-clinic-border pb-3 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-clinic-accent" /> Top Clinical Diagnoses
          </h2>
          {topDiagnoses.length === 0 ? (
            <span className="text-xs text-clinic-text-secondary italic">No diagnoses registered in SOAP notes.</span>
          ) : (
            <div className="flex flex-col gap-3">
              {topDiagnoses.map((diag: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-clinic-bg border border-clinic-border rounded-clinic-10 text-xs">
                  <span className="font-semibold text-clinic-text-primary">{diag.name}</span>
                  <Badge variant="neutral">{diag.count} Cases</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Prescribed Medicines */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-clinic-text-primary uppercase tracking-wider border-b border-clinic-border pb-3 flex items-center gap-1.5">
            <Pill className="h-4 w-4 text-clinic-accent" /> Top Prescribed Medicines
          </h2>
          {topPrescribedMedicines.length === 0 ? (
            <span className="text-xs text-clinic-text-secondary italic">No prescription items found.</span>
          ) : (
            <div className="flex flex-col gap-3">
              {topPrescribedMedicines.map((med: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-clinic-bg border border-clinic-border rounded-clinic-10 text-xs">
                  <span className="font-semibold text-clinic-text-primary">{med.name}</span>
                  <Badge variant="info">{med.count} Rx</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Fallback import
import { AlertTriangle } from 'lucide-react';
import { Calendar } from 'lucide-react';
