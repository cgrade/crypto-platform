"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  btcAddress?: string;
  btcAddressQrCode?: string;
};

interface AddressForm {
  btcAddress: string;
  btcAddressQrCode?: string;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    btcAddress: '',
    btcAddressQrCode: ''
  });
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isPromotingToAdmin, setIsPromotingToAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load real user data from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to load users. Please try again.');
      // Use mock data as fallback
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@cryptopro.com',
          role: 'ADMIN',
          createdAt: '2025-05-01T12:00:00Z',
          btcAddress: 'bc1q3v5cu3zgev8mcptgj79nnzr9vj2qzcd0g5lph9',
          btcAddressQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1q3v5cu3zgev8mcptgj79nnzr9vj2qzcd0g5lph9'
        },
        {
          id: '2',
          name: 'Test User',
          email: 'user@example.com',
          role: 'USER',
          createdAt: '2025-05-02T10:30:00Z',
          btcAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
          btcAddressQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
        },
        {
          id: '3',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'USER',
          createdAt: '2025-05-03T14:15:00Z'
        },
        {
          id: '4',
          name: 'Robert Johnson',
          email: 'robert@example.com',
          role: 'USER',
          createdAt: '2025-05-04T09:45:00Z',
          btcAddress: 'bc1q9jvmqt0r247dfhy86sxm5wgpgdv5xqpgxz6qgr',
          btcAddressQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1q9jvmqt0r247dfhy86sxm5wgpgdv5xqpgxz6qgr'
        }
      ];
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setAddressForm({
      btcAddress: user.btcAddress || '',
      btcAddressQrCode: user.btcAddressQrCode || ''
    });
    setSelectedRole(user.role);
    setIsEditing(true);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('QR code image must be less than 2MB');
      return;
    }
    
    // Check file type (only images)
    if (!file.type.startsWith('image/')) {
      setErrorMessage('File must be an image');
      return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAddressForm((prev) => ({
        ...prev,
        btcAddressQrCode: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const generateQrCode = () => {
    if (!addressForm.btcAddress) {
      setErrorMessage('Please enter a Bitcoin address first');
      return;
    }
    
    // Generate QR code using external API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(addressForm.btcAddress)}`;
    setAddressForm((prev) => ({
      ...prev,
      btcAddressQrCode: qrCodeUrl
    }));
  };

  const handleSaveAddresses = async () => {
    if (!selectedUser) return;
    
    // Validate BTC address (basic validation)
    if (addressForm.btcAddress && !addressForm.btcAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
      setErrorMessage('Invalid Bitcoin address format');
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
          role: selectedRole
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
            role: selectedRole
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
      console.error('Error updating user addresses:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update user addresses');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage users and their crypto addresses</p>
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
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-dark-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">BTC Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-dark-100/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{user.name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.btcAddress ? (
                        <div className="flex items-center">
                          <span className="text-xs font-mono max-w-[120px] truncate">{user.btcAddress}</span>
                          {user.btcAddressQrCode && (
                            <span className="ml-2 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <rect x="7" y="7" width="3" height="3"></rect>
                                <rect x="14" y="7" width="3" height="3"></rect>
                                <rect x="7" y="14" width="3" height="3"></rect>
                                <rect x="14" y="14" width="3" height="3"></rect>
                              </svg>
                            </span>
                          )}
                          <span className="ml-2 text-green-500">✓</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not set</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <div className="flex space-x-2">                 
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit User
                          </Button>
                          {user.role !== 'ADMIN' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-purple-900/20 hover:bg-purple-900/40 border-purple-800/50 text-purple-400"
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole('ADMIN');
                                setIsPromotingToAdmin(true);
                              }}
                            >
                              Make Admin
                            </Button>
                          )}
                        </div>
                        {user.role !== 'ADMIN' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-900/20 hover:bg-red-900/40 border-red-800/50 text-red-400"
                            onClick={() => {
                              setDeleteUserId(user.id);
                              setIsDeleting(true);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Edit Addresses Modal */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit User Settings</h2>
            <p className="text-gray-400 mb-4">
              Update user settings for {selectedUser.name || selectedUser.email}
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  User Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'USER' | 'ADMIN')}
                  className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-2 text-sm"
                >
                  <option value="USER">Regular User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Admins have full access to manage all users and platform settings
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bitcoin (BTC) Address
                </label>
                <input
                  type="text"
                  name="btcAddress"
                  value={addressForm.btcAddress}
                  onChange={handleAddressChange}
                  placeholder="e.g., bc1..."
                  className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-2 text-sm font-mono"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Bitcoin native segwit address format
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  QR Code
                </label>
                
                <div className="space-y-3">
                  {addressForm.btcAddressQrCode ? (
                    <div className="flex flex-col items-center bg-dark-300 border border-dark-100 rounded-lg p-4">
                      <div className="relative w-32 h-32 mb-2">
                        <Image 
                          src={addressForm.btcAddressQrCode} 
                          alt="Bitcoin address QR code" 
                          layout="fill"
                          objectFit="contain"
                          className="rounded-md" 
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => setAddressForm(prev => ({ ...prev, btcAddressQrCode: '' }))}
                      >
                        Remove QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col items-center justify-center bg-dark-300 border border-dashed border-dark-100 rounded-lg p-6">
                        <div className="text-gray-400 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <rect x="7" y="7" width="3" height="3"></rect>
                            <rect x="14" y="7" width="3" height="3"></rect>
                            <rect x="7" y="14" width="3" height="3"></rect>
                            <rect x="14" y="14" width="3" height="3"></rect>
                          </svg>
                        </div>
                        <p className="text-sm text-center text-gray-400">Upload a QR code image or generate one</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={handleQrCodeUpload}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={generateQrCode}
                        >
                          Generate QR
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
              <Button onClick={handleSaveAddresses}>
                Save Addresses
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Promote to Admin Confirmation Modal */}
      {isPromotingToAdmin && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">Promote to Admin</h2>
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
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                      method: 'PATCH',
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
                          role: 'ADMIN' as 'ADMIN' // Explicit type casting to fix TypeScript error
                        };
                      }
                      return user;
                    });
                    
                    setUsers(updatedUsers);
                    setSuccessMessage(`${selectedUser.name || selectedUser.email} has been promoted to admin`);
                    
                    // Hide modal
                    setIsPromotingToAdmin(false);
                    setSelectedUser(null);
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                      setSuccessMessage('');
                    }, 3000);
                  } catch (error) {
                    console.error('Error promoting user:', error);
                    setErrorMessage(error instanceof Error ? error.message : 'Failed to promote user');
                    setIsPromotingToAdmin(false);
                    setSelectedUser(null);
                  }
                }}
              >
                Promote to Admin
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete User Confirmation Modal */}
      {isDeleting && deleteUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-red-400">Delete User</h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this user? This action cannot be undone and will remove all user data including portfolios, transactions, and accounts.
            </p>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleting(false);
                  setDeleteUserId(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/users/${deleteUserId}`, {
                      method: 'DELETE',
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to delete user');
                    }
                    
                    // Update UI by removing deleted user
                    setUsers(users.filter(user => user.id !== deleteUserId));
                    setSuccessMessage('User deleted successfully');
                    
                    // Hide modal
                    setIsDeleting(false);
                    setDeleteUserId(null);
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                      setSuccessMessage('');
                    }, 3000);
                  } catch (error) {
                    console.error('Error deleting user:', error);
                    setErrorMessage(error instanceof Error ? error.message : 'Failed to delete user');
                    setIsDeleting(false);
                    setDeleteUserId(null);
                  }
                }}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
