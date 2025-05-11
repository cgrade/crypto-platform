"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

// Metadata moved to layout.tsx as this is now a client component

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Password must include a number and a special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      setApiError(null);
      
      try {
        const name = `${formData.firstName} ${formData.lastName}`;
        const result = await signUp(formData.email, formData.password, name);
        
        if (!result.success) {
          throw new Error(result.error || 'Registration failed');
        }
        
        // Registration successful
        router.push('/login?registered=true');
      } catch (error: any) {
        setApiError(error.message);
      } finally {
        setIsSubmitting(false);
      }
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
              <span className="text-white font-bold text-xl">CryptoPro</span>
            </Link>
          </div>
          
          <div className="card bg-dark-200 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Create an Account</h2>
            
            {apiError && (
              <div className="p-3 mb-4 bg-red-900/30 border border-red-800 text-red-400 rounded-lg text-sm">
                {apiError}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={`input w-full ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={`input w-full ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
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
                  className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`input w-full ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password ? (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Password must be at least 8 characters with a number and a special character.
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`input w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-gray-600 bg-dark-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className={`text-gray-300 ${errors.terms ? 'text-red-500' : ''}`}>
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-primary-500 hover:text-primary-400">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-primary-500 hover:text-primary-400">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
            
            {/* Social signup buttons removed */}
            
            <p className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-500 hover:text-primary-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
