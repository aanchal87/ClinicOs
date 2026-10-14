'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useUiStore } from '@/shared/stores/uiStore';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import apiClient from '@/shared/services/apiClient';

export default function AuthPage() {
  const router = useRouter();
  const currentRole = useUiStore((state) => state.currentRole);
  const setCurrentRole = useUiStore((state) => state.setCurrentRole);
  const darkMode = useUiStore((state) => state.darkMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('clinicos_token', accessToken);
        localStorage.setItem('clinicos_user', JSON.stringify(user));
      }
      
      setCurrentRole(user.role.toLowerCase() as 'doctor' | 'receptionist' | 'super_admin');
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Reset password link sent! Please check your inbox.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMsg('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-clinic-bg items-center justify-center p-4">
      {/* Dynamic Background subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-clinic-surface border border-clinic-border rounded-clinic-18 shadow-xl p-8 flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-clinic-accent text-white p-2.5 rounded-clinic-14 flex items-center justify-center font-bold text-lg h-12 w-12 shadow-md mb-3">
            CO
          </div>
          <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary">Welcome to ClinicOS</h1>
          <p className="text-sm text-clinic-text-secondary mt-1">
            Physical Clinic Management & Patient Care
          </p>
        </div>



        {/* Error / Success Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-clinic-danger/10 border border-clinic-danger/30 text-clinic-danger rounded-clinic-10 px-3 py-2 text-xs font-medium mb-4"
            >
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-clinic-success/10 border border-clinic-success/30 text-clinic-success rounded-clinic-10 px-3 py-2 text-xs font-medium mb-4"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authentication forms */}
        <AnimatePresence mode="wait">
          {!isForgotPassword ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-[34px] h-4 w-4 text-clinic-text-secondary pointer-events-none" />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@clinicos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-[34px] h-4 w-4 text-clinic-text-secondary pointer-events-none" />
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] p-0.5 text-clinic-text-secondary hover:text-clinic-text-primary rounded"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-3.5 w-3.5 rounded border-clinic-border text-clinic-accent focus:ring-clinic-accent bg-clinic-surface cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-clinic-text-secondary cursor-pointer">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-clinic-accent hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="forgot-password"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleForgotPassword}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-[34px] h-4 w-4 text-clinic-text-secondary pointer-events-none" />
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="admin@clinicos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>

              <div className="text-xs text-clinic-text-secondary mt-1">
                Enter your email address and we'll send you a password reset link.
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full"
                  disabled={isLoading}
                >
                  Back to Sign In
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Demo credentials help (Only in non-production environments) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 pt-6 border-t border-clinic-border text-center text-xs text-clinic-text-secondary">
            <p className="font-semibold text-clinic-accent">Demo Accounts (Development Mode):</p>
            <p className="mt-1">Doctor: {(process.env.NODE_ENV as string) !== 'production' ? 'doctor@clinicios.com (doctor123)' : ''}</p>
            <p>Receptionist: {(process.env.NODE_ENV as string) !== 'production' ? 'receptionist@clinicios.com (receptionist123)' : ''}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
