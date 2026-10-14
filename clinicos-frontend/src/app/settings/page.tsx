'use client';

import React, { useState, useEffect } from 'react';
import { useUiStore } from '@/shared/stores/uiStore';
import { Settings, Shield, Bell, Laptop, Sun, Moon, Clock, User, MessageSquare } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import Select from '@/shared/components/ui/Select';
import Badge from '@/shared/components/ui/Badge';
import apiClient from '@/shared/services/apiClient';

export default function SettingsPage() {
  const darkMode = useUiStore((state) => state.darkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);

  // Form states
  const [clinicName, setClinicName] = useState('ClinicOS Dermatology Centre');
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('06:00 PM');
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // WhatsApp states
  const [whatsappProvider, setWhatsappProvider] = useState('sandbox');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from backend on mount
  useEffect(() => {
    apiClient.get('/settings')
      .then((res) => {
        const data = res.data;
        if (data.clinicName) setClinicName(data.clinicName);
        if (data.openingTime) setOpeningTime(data.openingTime);
        if (data.closingTime) setClosingTime(data.closingTime);
        if (data.enableEmailNotifications) setEmailAlerts(data.enableEmailNotifications === 'true');
        if (data.whatsapp_provider) setWhatsappProvider(data.whatsapp_provider);
        if (data.whatsapp_access_token) setWhatsappAccessToken(data.whatsapp_access_token);
        if (data.whatsapp_phone_number_id) setWhatsappPhoneNumberId(data.whatsapp_phone_number_id);
      })
      .catch((err) => console.error('Error loading settings:', err));
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      await apiClient.put('/settings', {
        clinicName,
        openingTime,
        closingTime,
        enableEmailNotifications: String(emailAlerts),
        whatsapp_provider: whatsappProvider,
        whatsapp_access_token: whatsappAccessToken,
        whatsapp_phone_number_id: whatsappPhoneNumberId,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[960px]">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">System Preferences & Settings</h1>
        <p className="text-sm text-clinic-text-secondary mt-1">
          Configure physical clinic scheduling configurations, workspace parameters, and account consoles.
        </p>
      </div>

      <form onSubmit={handleSaveChanges} className="flex flex-col gap-8">
        
        {/* Core settings */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-bold text-clinic-text-primary border-b border-clinic-border pb-3 flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-clinic-accent" />
            <span>Clinic Identity & Schedule</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-clinic-text-secondary">Clinic Workspace Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="px-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Opening Hour"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                options={[
                  { value: '08:00 AM', label: '08:00 AM' },
                  { value: '09:00 AM', label: '09:00 AM' },
                  { value: '10:00 AM', label: '10:00 AM' }
                ]}
              />
              <Select
                label="Closing Hour"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                options={[
                  { value: '05:00 PM', label: '05:00 PM' },
                  { value: '06:00 PM', label: '06:00 PM' },
                  { value: '07:00 PM', label: '07:00 PM' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Theme and alerts */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-bold text-clinic-text-primary border-b border-clinic-border pb-3 flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-clinic-accent" />
            <span>Theme & Sound Alerts</span>
          </h2>

          <div className="flex flex-col gap-4">
            {/* Theme option row */}
            <div className="flex justify-between items-center p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-clinic-text-primary">System Interface Theme</span>
                <span className="text-[10px] text-clinic-text-secondary">Toggle interface color mode</span>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 text-xs"
              >
                {darkMode ? <Sun className="h-3.5 w-3.5 text-clinic-accent" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
              </Button>
            </div>

            {/* Email alerts row */}
            <div className="flex justify-between items-center p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-clinic-text-primary">Enable Email Notifications</span>
                <span className="text-[10px] text-clinic-text-secondary">Send daily diagnostic summary alerts</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 text-clinic-accent rounded cursor-pointer"
              />
            </div>

            {/* Sound alerts row */}
            <div className="flex justify-between items-center p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-clinic-text-primary">Queue Token Alert Sounds</span>
                <span className="text-[10px] text-clinic-text-secondary">Trigger voice/bell chiming alerts when tokens are called</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="h-4 w-4 text-clinic-accent rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp settings */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-bold text-clinic-text-primary border-b border-clinic-border pb-3 flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-clinic-accent" />
            <span>WhatsApp Communications Integration</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="whatsapp-provider-select" className="text-xs font-semibold uppercase tracking-wider text-clinic-text-secondary">Provider Mode</label>
              <select
                id="whatsapp-provider-select"
                value={whatsappProvider}
                onChange={(e) => setWhatsappProvider(e.target.value)}
                className="px-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
              >
                <option value="sandbox">Mock Sandbox Mode (Database and Logs only)</option>
                <option value="meta">Meta WhatsApp Cloud API (Production)</option>
              </select>
            </div>

            {whatsappProvider === 'meta' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="whatsapp-phone-id-input" className="text-xs font-semibold uppercase tracking-wider text-clinic-text-secondary">Phone Number ID</label>
                  <input
                    id="whatsapp-phone-id-input"
                    type="text"
                    value={whatsappPhoneNumberId}
                    onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                    placeholder="Enter Meta Phone Number ID"
                    className="px-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="whatsapp-token-input" className="text-xs font-semibold uppercase tracking-wider text-clinic-text-secondary">System User Access Token</label>
                  <input
                    id="whatsapp-token-input"
                    type="password"
                    value={whatsappAccessToken}
                    onChange={(e) => setWhatsappAccessToken(e.target.value)}
                    placeholder="Enter Meta Permanent Access Token"
                    className="px-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-4">
          <Button 
            type="submit" 
            isLoading={saveLoading}
            className="px-6"
          >
            Save Changes
          </Button>
          {saveSuccess && (
            <span className="text-xs text-clinic-success font-semibold flex items-center gap-1">
              ✓ Settings saved successfully!
            </span>
          )}
        </div>

      </form>
    </div>
  );
}
