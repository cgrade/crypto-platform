"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  investmentPlan: 'STARTER' | 'PREMIER' | 'PREMIUM' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'NONE';
  createdAt: string;
  btcAddress?: string;
  btcAddressQrCode?: string;
};

interface AddressForm {
  btcAddress: string;
  btcAddressQrCode?: string;
}

export default function AdminUsersPage() {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ADMIN'>('USER');
  const [selectedPlan, setSelectedPlan] = useState<User['investmentPlan']>('NONE');
  const [isPromotingToAdmin, setIsPromotingToAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCrediting, setIsCrediting] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditLoading, setCreditLoading] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    btcAddress: '',
    btcAddressQrCode: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load user data from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      // Ensure the users data has the correct types
      const typedUsers = (data.users || []).map((user: any) => ({
        ...user,
        role: user.role as 'USER' | 'ADMIN',
        investmentPlan: user.investmentPlan as User['investmentPlan']
      }));
      setUsers(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit user function
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedPlan(user.investmentPlan);
    setAddressForm({
      btcAddress: user.btcAddress || '',
      btcAddressQrCode: user.btcAddressQrCode || ''
    });
    setIsEditing(true);
  };

  // Credit BTC function
  const handleCreditBtc = (user: User) => {
    setSelectedUser(user);
    setCreditAmount('');
    setIsCrediting(true);
  };

  // Promote to admin function
  const handlePromoteToAdmin = (user: User) => {
    if (user.role !== 'ADMIN') {
      setSelectedUser(user);
      setIsPromotingToAdmin(true);
    }
  };

  // Upload QR code
  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAddressForm(prev => ({
          ...prev,
          btcAddressQrCode: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate QR code for BTC address
  const handleGenerateQRCode = async () => {
    if (!selectedUser || !addressForm.btcAddress) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}/qrcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate QR code');
      }
      
      const data = await response.json();
      
      setAddressForm(prev => ({
        ...prev,
        btcAddressQrCode: data.qrCode
      }));
      
      setSuccessMessage('QR code generated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete QR code
  const handleDeleteQRCode = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}/qrcode`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete QR code');
      }
      
      // Clear QR code from form
      setAddressForm(prev => ({
        ...prev,
        btcAddressQrCode: ''
      }));
      
      setSuccessMessage('QR code deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting QR code:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete QR code');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random BTC address for demo purposes
  const generateBtcAddress = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '1';
    for (let i = 0; i < 33; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddressForm(prev => ({
      ...prev,
      btcAddress: result
    }));
  };

  // Save user changes
  const handleSaveAddresses = async () => {
    if (!selectedUser) return;
    
    // Simple validation
    if (!addressForm.btcAddress) {
      setErrorMessage('Bitcoin address is required');
      return;
    }
    
    try {
      // API call to update user
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          btcAddress: addressForm.btcAddress,
          btcAddressQrCode: addressForm.btcAddressQrCode,
          role: selectedRole,
          investmentPlan: selectedPlan
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      const responseData = await response.json();
      
      // Update UI
      const updatedUsers = users.map((user) => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            btcAddress: addressForm.btcAddress,
            btcAddressQrCode: addressForm.btcAddressQrCode,
            role: selectedRole as 'USER' | 'ADMIN',
            investmentPlan: selectedPlan
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setIsEditing(false);
      setSelectedUser(null);
      setSuccessMessage(responseData.message || 'User updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  // Confirm admin promotion
  const confirmPromoteToAdmin = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/promote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'ADMIN'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to promote user');
      }
      
      // Update UI
      const updatedUsers = users.map((user) => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            role: 'ADMIN' as 'ADMIN'
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSuccessMessage(`${selectedUser.name || selectedUser.email} has been promoted to Admin`);
      
      // Close modal and reset
      setIsPromotingToAdmin(false);
      setSelectedUser(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to promote user');
      setIsPromotingToAdmin(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage users, update addresses, and credit balances</p>
        </div>
      </div>
      
      {successMessage && (
        <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <p className="text-gray-400">Loading users...</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {users.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">BTC Address</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{user.name || 'No name'}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      <div className="text-xs text-gray-500">Since {new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300`}>
                        {user.investmentPlan}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {user.btcAddress ? (
                          <span className="font-mono">{user.btcAddress.substring(0, 8)}...{user.btcAddress.substring(user.btcAddress.length - 8)}</span>
                        ) : (
                          <span className="text-gray-500">Not set</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-400 border-green-500 hover:bg-green-950"
                          onClick={() => handleCreditBtc(user)}
                        >
                          Credit BTC
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-purple-400 border-purple-500 hover:bg-purple-950"
                            onClick={() => handlePromoteToAdmin(user)}
                          >
                            Make Admin
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Edit User</h2>
            <p className="text-gray-300 mb-4">
              Editing {selectedUser.name || selectedUser.email}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'USER' | 'ADMIN')}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Investment Plan</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as User['investmentPlan'])}
                >
                  <option value="NONE">None</option>
                  <option value="STARTER">Starter</option>
                  <option value="PREMIER">Premier</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">BTC Address</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-mono"
                    value={addressForm.btcAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, btcAddress: e.target.value })}
                    placeholder="Enter BTC address"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateBtcAddress}
                    className="whitespace-nowrap"
                  >
                    Generate Address
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">BTC Address QR Code</label>
                <div className="flex space-x-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleQrCodeUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload QR Code
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateQRCode()}
                    className="text-green-400 border-green-500 hover:bg-green-950"
                    disabled={!addressForm.btcAddress}
                  >
                    Generate QR Code
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteQRCode()}
                    className="text-red-400 border-red-500 hover:bg-red-950"
                    disabled={!addressForm.btcAddressQrCode}
                  >
                    Delete QR
                  </Button>
                </div>
                
                {addressForm.btcAddressQrCode && (
                  <div className="mt-2 flex justify-center border border-gray-600 rounded-md p-2">
                    <img 
                      src={addressForm.btcAddressQrCode} 
                      alt="BTC QR Code" 
                      className="h-48 w-48 object-contain"
                    />
                  </div>
                )}
                {!addressForm.btcAddressQrCode && addressForm.btcAddress && (
                  <div className="mt-2 text-center text-gray-400 text-sm italic">
                    Generate a QR code for this Bitcoin address
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedUser(null);
                  setErrorMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAddresses}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Promote to Admin Confirmation Modal */}
      {isPromotingToAdmin && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Confirm Admin Promotion</h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to make <span className="font-semibold">{selectedUser.name || selectedUser.email}</span> an administrator? 
              They will have full access to all user data and administrative functions.
            </p>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsPromotingToAdmin(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={confirmPromoteToAdmin}
              >
                Confirm Promotion
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Credit BTC Modal */}
      {isCrediting && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Credit BTC Balance</h2>
            <p className="text-gray-300 mb-4">
              Credit BTC to <span className="font-semibold">{selectedUser.name || selectedUser.email}</span>'s account.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">BTC Amount</label>
                <input
                  type="number"
                  step="0.00000001"
                  min="0"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-mono"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Enter BTC amount"
                />
              </div>
              
              {/* Success/Error messages */}
              {successMessage && (
                <div className="p-2 bg-green-900/30 border border-green-800 rounded-lg text-center">
                  <p className="text-green-400 text-sm">{successMessage}</p>
                </div>
              )}
              
              {errorMessage && (
                <div className="p-2 bg-red-900/30 border border-red-800 rounded-lg text-center">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCrediting(false);
                  setSelectedUser(null);
                  setCreditAmount('');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={creditLoading}
                onClick={async () => {
                  setCreditLoading(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                  try {
                    const response = await fetch('/api/admin/credit-asset', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: selectedUser.id, amount: parseFloat(creditAmount) })
                    });
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to credit BTC');
                    }
                    setSuccessMessage('BTC credited successfully!');
                    setCreditAmount('');
                    setTimeout(() => {
                      setIsCrediting(false);
                      setSelectedUser(null);
                      setSuccessMessage('');
                    }, 2000);
                  } catch (error) {
                    setErrorMessage(error instanceof Error ? error.message : 'Failed to credit BTC');
                  } finally {
                    setCreditLoading(false);
                  }
                }}
              >
                {creditLoading ? 'Processing...' : 'Credit BTC'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
