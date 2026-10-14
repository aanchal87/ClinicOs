'use client';

import { redirect } from 'next/navigation';

export default function AnalyticsPage() {
  redirect('/reports');
  return null;
}
