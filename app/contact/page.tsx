import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-300">
      <Navbar transparent={false} />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="bg-dark-200 p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-white">Send us a message</h2>
                
                <form className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full bg-dark-100 border border-dark-50 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full bg-dark-100 border border-dark-50 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="w-full bg-dark-100 border border-dark-50 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full bg-dark-100 border border-dark-50 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tell us what we can help you with..."
                      required
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-dark-200 p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-6 text-white">Contact Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-primary-500 font-medium mb-1">Email</h3>
                    <p className="text-white">support@cryptpro.online</p>
                  </div>
                  
                  <div>
                    <h3 className="text-primary-500 font-medium mb-1">Working Hours</h3>
                    <p className="text-white">Monday to Friday: 9am - 5pm</p>
                    <p className="text-white">Saturday: 10am - 2pm</p>
                    <p className="text-white">Sunday: Closed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-200 p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-white">FAQ</h2>
                <p className="text-gray-300 mb-4">
                  Have questions? Check our frequently asked questions for quick answers.
                </p>
                <Button variant="outline" className="w-full">
                  View FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
