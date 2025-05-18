"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  // Define interface for profile form to avoid TypeScript errors
  interface ProfileForm {
    name: string;
    email: string;
    country: string;
    timezone: string;
    bio: string;
  }
  
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: '',
    country: '',
    timezone: '',
    bio: '' // Bio is blank by default
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [profileIsSubmitting, setProfileIsSubmitting] = useState(false);
  const [passwordIsSubmitting, setPasswordIsSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      // In a real app, you would fetch the user's profile from an API
      // For this demo, we'll just use the session data and add some mock fields
      setTimeout(() => {
        setProfileForm({
          name: session.user.name || '',
          email: session.user.email || '',
          country: 'United States',    // Mock data
          timezone: 'America/New_York', // Mock data
          bio: ''  // Empty by default until user updates it
        });
        setIsLoading(false);
      }, 800);
    }
  }, [session]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profileForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(profileForm.email)) {
      errors.email = 'Invalid email address';
    }
    
    // Phone validation removed
    
    return errors;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateProfileForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setProfileIsSubmitting(true);
      setProfileMessage(null);
      
      try {
        // In a real app, you would call your API to update the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfileMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });
        
        // The profile update would typically update the session as well
      } catch (error) {
        console.error('Error updating profile:', error);
        setProfileMessage({
          type: 'error',
          text: 'An error occurred while updating your profile.'
        });
      } finally {
        setProfileIsSubmitting(false);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validatePasswordForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setPasswordIsSubmitting(true);
      setPasswordMessage(null);
      
      try {
        // In a real app, you would call your API to update the password
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPasswordMessage({
          type: 'success',
          text: 'Password changed successfully!'
        });
        
        // Reset password form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error changing password:', error);
        setPasswordMessage({
          type: 'error',
          text: 'An error occurred while changing your password.'
        });
      } finally {
        setPasswordIsSubmitting(false);
      }
    }
  };

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
    'France', 'Japan', 'Singapore', 'Brazil', 'India', 'South Korea'
  ];
  
  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 
    'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Singapore', 
    'Australia/Sydney', 'Pacific/Auckland'
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-dark-200 rounded-xl p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {profileForm.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold mb-1">{profileForm.name}</h2>
              <p className="text-gray-400 mb-4">{profileForm.email}</p>
              <div className="w-full border-t border-dark-100 pt-4 mt-4">
                <div className="text-sm text-gray-400 mb-2">Member Since</div>
                <div className="font-medium">{format(new Date(), 'MMMM yyyy')}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="bg-dark-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-dark-100">
                <h2 className="text-lg font-semibold">Profile Information</h2>
              </div>
              <div className="p-6">
                {profileMessage && (
                  <div className={`p-4 mb-6 rounded-lg ${
                    profileMessage.type === 'success' 
                      ? 'bg-green-900/30 border border-green-800 text-green-400' 
                      : 'bg-red-900/30 border border-red-800 text-red-400'
                  }`}>
                    {profileMessage.text}
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className={`input w-full ${formErrors.name ? 'border-red-500' : ''}`}
                        value={profileForm.name}
                        onChange={handleProfileChange}
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`input w-full ${formErrors.email ? 'border-red-500' : ''}`}
                        value={profileForm.email}
                        onChange={handleProfileChange}
                      />
                      {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        className="input w-full"
                        value={profileForm.country}
                        onChange={handleProfileChange}
                      >
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      className="input w-full"
                      value={profileForm.timezone}
                      onChange={handleProfileChange}
                    >
                      {timezones.map(timezone => (
                        <option key={timezone} value={timezone}>{timezone.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="input w-full"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={profileIsSubmitting}>
                      {profileIsSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Change Password */}
            <div className="bg-dark-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-dark-100">
                <h2 className="text-lg font-semibold">Change Password</h2>
              </div>
              <div className="p-6">
                {passwordMessage && (
                  <div className={`p-4 mb-6 rounded-lg ${
                    passwordMessage.type === 'success' 
                      ? 'bg-green-900/30 border border-green-800 text-green-400' 
                      : 'bg-red-900/30 border border-red-800 text-red-400'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        className={`input w-full pr-10 ${formErrors.currentPassword ? 'border-red-500' : ''}`}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                      >
                        {showCurrentPassword ? (
                          <FiEyeOff className="w-5 h-5" />
                        ) : (
                          <FiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formErrors.currentPassword && <p className="mt-1 text-xs text-red-500">{formErrors.currentPassword}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          className={`input w-full pr-10 ${formErrors.newPassword ? 'border-red-500' : ''}`}
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                        >
                          {showNewPassword ? (
                            <FiEyeOff className="w-5 h-5" />
                          ) : (
                            <FiEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {formErrors.newPassword && <p className="mt-1 text-xs text-red-500">{formErrors.newPassword}</p>}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={`input w-full pr-10 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff className="w-5 h-5" />
                          ) : (
                            <FiEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.
                  </p>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={passwordIsSubmitting}>
                      {passwordIsSubmitting ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
