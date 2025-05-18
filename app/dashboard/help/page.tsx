"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string>('deposit');
  
  const renderContent = () => {
    switch (activeSection) {
      case 'deposit':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">How to Make a Deposit</h2>
            
            <div className="bg-dark-100 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 1: Navigate to the Deposit Page</h3>
                <p>Click on the "Deposit" button in your dashboard or use the sidebar navigation to access the deposit page.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 2: Select Cryptocurrency</h3>
                <p>Currently, we only support Bitcoin (BTC) for deposits.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 3: Enter Amount and Address</h3>
                <p>Enter the amount you wish to deposit and the crypto address from which you'll be sending funds.</p>
                <div className="bg-dark-200 p-4 rounded-lg text-amber-400 text-sm">
                  <strong>Important:</strong> Always double-check the deposit address provided to you. For security reasons, your deposit address is assigned by an admin.
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 4: Complete the Transaction</h3>
                <p>Send the cryptocurrency from your external wallet to the deposit address shown. Make sure the amount matches what you entered in the form.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 5: Wait for Admin Approval</h3>
                <p>After sending your cryptocurrency, your deposit will show as "Pending" in your transaction history. An admin must review and approve your deposit before the funds appear in your account balance.</p>
                <p>This approval process typically takes 30-60 minutes during business hours.</p>
              </div>
              
              <div className="mt-6 p-4 bg-dark-200 rounded-lg border border-dark-100">
                <h4 className="font-semibold text-amber-400 mb-2">Transaction Status Explained:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                    <span><strong>Pending</strong>: Your transaction has been submitted and is awaiting admin approval</span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span><strong>Completed</strong>: Your transaction has been approved and funds added to your balance</span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span><strong>Rejected</strong>: Your transaction was rejected (check your email for details)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 'withdraw':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">How to Make a Withdrawal</h2>
            
            <div className="bg-dark-100 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 1: Navigate to the Withdraw Page</h3>
                <p>Click on the "Withdraw" button in your dashboard or use the sidebar navigation to access the withdrawal page.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 2: Select Cryptocurrency</h3>
                <p>Currently, we only support Bitcoin (BTC) for withdrawals.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 3: Enter Withdrawal Details</h3>
                <p>Enter the amount you wish to withdraw and the destination address to receive your funds.</p>
                <div className="bg-dark-200 p-4 rounded-lg text-amber-400 text-sm">
                  <strong>Important:</strong> Always double-check your destination address. Blockchain transactions are irreversible, and funds sent to an incorrect address cannot be recovered.
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 4: Submit Withdrawal Request</h3>
                <p>Review your withdrawal details carefully, then submit your request.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 5: Admin Approval Process</h3>
                <p>All withdrawal requests must be approved by an administrator for security purposes. During this time, your withdrawal will show as "Pending" in your transaction history.</p>
                <p>The approval process typically takes 30-60 minutes during business hours.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Step 6: Receive Your Funds</h3>
                <p>Once approved, your withdrawal will be processed on the blockchain. Depending on network congestion, you should receive your funds within a few minutes to several hours.</p>
              </div>
              
              <div className="mt-6 p-4 bg-dark-200 rounded-lg border border-dark-100">
                <h4 className="font-semibold text-amber-400 mb-2">Withdrawal Fees:</h4>
                <ul className="space-y-2">
                  <li>
                    <strong>Bitcoin (BTC)</strong>: 0.0001 BTC per withdrawal
                  </li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">Fees are deducted from the withdrawal amount, not your account balance.</p>
              </div>
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Managing Your Profile</h2>
            
            <div className="bg-dark-100 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Accessing Your Profile</h3>
                <p>To access your profile settings, click on the "Profile" option in the sidebar navigation.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Updating Personal Information</h3>
                <p>From your profile page, you can update the following information:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>Country</li>
                  <li>Timezone</li>
                  <li>Bio Information</li>
                </ul>
                <p>After making changes, click the "Save Changes" button to update your profile.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Changing Your Password</h3>
                <p>To update your password:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Enter your current password</li>
                  <li>Enter your new password</li>
                  <li>Confirm your new password</li>
                  <li>Click "Change Password"</li>
                </ol>
                <div className="bg-dark-200 p-4 rounded-lg text-amber-400 text-sm">
                  <strong>Password Requirements:</strong> Your password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Profile Verification Status</h3>
                <p>Your profile page displays your current verification status:</p>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span><strong>Verified</strong>: Your account is fully verified</span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                    <span><strong>Pending</strong>: Your verification is in progress</span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span><strong>Unverified</strong>: Additional verification required</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Security Best Practices</h2>
            
            <div className="bg-dark-100 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Strong Password Guidelines</h3>
                <p>Follow these guidelines to create a strong password:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use at least 12 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                  <li>Avoid using the same password on multiple sites</li>
                  <li>Don't use easily guessable information (birthdays, names, etc.)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Account Security Tips</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Never share your password with anyone</li>
                  <li>Be wary of phishing attempts - we will never ask for your password via email</li>
                  <li>Always verify the website URL before entering your credentials</li>
                  <li>Log out when using public or shared computers</li>
                  <li>Keep your operating system and browsers updated</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary-400">Crypto Security Guidelines</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Always double-check addresses before sending crypto</li>
                  <li>Start with small test transactions when using a new address</li>
                  <li>Verify transaction details before confirming</li>
                  <li>Be cautious of unexpected withdrawal requests or suspicious activity</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-dark-200 rounded-lg border border-dark-100">
                <h4 className="font-semibold text-amber-400 mb-2">Contact Security Support:</h4>
                <p>If you notice any suspicious activity on your account, contact our security team immediately at:</p>
                <p className="text-primary-400">security@cryptopro.com</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Help & Support</h1>
          <p className="text-gray-400">Learn how to use CryptPro</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-dark-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Topics</h2>
          <nav className="space-y-2">
            <button
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'deposit' 
                  ? 'bg-primary-500/20 text-primary-500' 
                  : 'text-gray-400 hover:bg-dark-100 hover:text-white'
              }`}
              onClick={() => setActiveSection('deposit')}
            >
              Deposit Instructions
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'withdraw' 
                  ? 'bg-primary-500/20 text-primary-500' 
                  : 'text-gray-400 hover:bg-dark-100 hover:text-white'
              }`}
              onClick={() => setActiveSection('withdraw')}
            >
              Withdrawal Process
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'profile' 
                  ? 'bg-primary-500/20 text-primary-500' 
                  : 'text-gray-400 hover:bg-dark-100 hover:text-white'
              }`}
              onClick={() => setActiveSection('profile')}
            >
              Managing Your Profile
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'security' 
                  ? 'bg-primary-500/20 text-primary-500' 
                  : 'text-gray-400 hover:bg-dark-100 hover:text-white'
              }`}
              onClick={() => setActiveSection('security')}
            >
              Security Best Practices
            </button>
          </nav>
          
          <div className="mt-8 p-4 bg-dark-100 rounded-lg">
            <h3 className="font-semibold text-primary-400 mb-2">Need More Help?</h3>
            <p className="text-sm text-gray-400 mb-4">Our support team is available 24/7 to assist you with any questions or issues.</p>
            <Link 
              href="/dashboard/support" 
              className="block text-center py-2 px-4 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
        
        <div className="md:col-span-3 bg-dark-200 rounded-xl p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
