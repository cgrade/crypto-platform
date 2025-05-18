"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function SupportPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setFormMessage({
        type: 'error',
        text: 'Please fill in all required fields'
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormMessage(null);
    
    try {
      // Simulating API request with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real application, you would send the support request to your backend
      // const response = await fetch('/api/support-tickets', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     userId: session?.user?.id,
      //     ...formData,
      //   }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to submit support request');
      // }
      
      // Success case
      setFormMessage({
        type: 'success',
        text: 'Your support request has been submitted. Our team will get back to you shortly.'
      });
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        priority: 'medium'
      });
      
    } catch (error) {
      console.error('Error submitting support request:', error);
      setFormMessage({
        type: 'error',
        text: 'An error occurred while submitting your request. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: 'How do I deposit funds into my account?',
      answer: 'To deposit funds, go to the "Deposit" page from your dashboard sidebar. Follow the instructions to complete your deposit using your preferred cryptocurrency.'
    },
    {
      question: 'What cryptocurrencies does CryptPro support?',
      answer: 'Currently, CryptPro only supports Bitcoin (BTC). We\'re working to add support for more cryptocurrencies in the future.'
    },
    {
      question: 'How long do withdrawals take to process?',
      answer: 'Withdrawal processing times vary depending on the cryptocurrency network congestion. Most withdrawals are processed within 1-2 hours, but may take up to 24 hours during peak times.'
    },
    {
      question: 'Is my data secure on CryptPro?',
      answer: 'Absolutely. We employ industry-leading security measures including encryption, two-factor authentication, and regular security audits to ensure your data and assets remain secure.'
    },
    {
      question: 'How can I change my password?',
      answer: 'You can change your password in the Profile Settings page. Look for the "Security" section where you\'ll find the password change option.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-gray-400">Get help with your CryptPro account</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-dark-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-dark-100">
              <h2 className="text-lg font-semibold">Contact Support</h2>
            </div>
            <div className="p-6">
              {formMessage && (
                <div className={`p-4 mb-6 rounded-lg ${
                  formMessage.type === 'success' 
                    ? 'bg-green-900/30 border border-green-800 text-green-400' 
                    : 'bg-red-900/30 border border-red-800 text-red-400'
                }`}>
                  {formMessage.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className="input w-full"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="input w-full"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="low">Low - General question</option>
                    <option value="medium">Medium - Account issue</option>
                    <option value="high">High - Deposit/Withdraw problem</option>
                    <option value="urgent">Urgent - Security concern</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="input w-full"
                    placeholder="Please describe your issue in detail"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t border-dark-100">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Alternative Support Channels</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-4 bg-dark-100 rounded-lg">
                    <div className="font-medium mb-1">Email Support</div>
                    <a href="mailto:support@cryptpro.online" className="text-primary-400 hover:text-primary-300 text-sm">
                      support@cryptpro.online
                    </a>
                  </div>
                  <div className="flex-1 p-4 bg-dark-100 rounded-lg">
                    <div className="font-medium mb-1">Working Hours</div>
                    <p className="text-sm text-gray-400">Monday to Friday: 9am - 5pm</p>
                    <p className="text-sm text-gray-400">Weekend: 10am - 2pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="lg:col-span-1">
          <div className="bg-dark-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-dark-100">
              <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="pb-5 border-b border-dark-100 last:border-0 last:pb-0">
                    <h3 className="text-sm font-medium text-white mb-2">{item.question}</h3>
                    <p className="text-sm text-gray-400">{item.answer}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-dark-100">
                <p className="text-sm text-gray-400 mb-3">
                  Can't find what you're looking for? Please submit a support request using the form.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
