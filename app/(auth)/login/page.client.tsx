"use client";

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  // const router = useRouter(); // removed unused variable
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');
  const registered = searchParams.get('registered');

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(error || null);
  const successMessage = registered ? 'Registration successful! Please sign in.' : null; // removed setSuccessMessage

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setLoginError('Please provide both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setLoginError(null);
      
      // Use NextAuth.js signIn function directly
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        setLoginError(result.error || 'Invalid email or password');
        setIsSubmitting(false);
      } else {
        // Force a manual redirect which ensures the client-side navigation happens
        console.log('Authentication successful, redirecting to:', callbackUrl);
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-300">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/images/logo.png" 
                alt="Bitcoin Logo" 
                width={40} 
                height={40} 
                className="rounded-full" 
              />
              <span className="text-white font-bold text-xl">CryptPro</span>
            </Link>
          </div>
          
          <div className="card bg-dark-200 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
            
            {loginError && (
              <div className="p-3 mb-4 bg-red-900/30 border border-red-800 text-red-400 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            
            {successMessage && (
              <div className="p-3 mb-4 bg-green-900/30 border border-green-800 text-green-400 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input w-full"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="input w-full pr-10"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-600 bg-dark-300 text-primary-600 focus:ring-primary-500"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              
              <div>
                <Button className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
            
            {/* Social login buttons removed */}
            
            <p className="mt-8 text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary-500 hover:text-primary-400">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
