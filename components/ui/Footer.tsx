import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-300 border-t border-dark-200 pt-10 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center mb-8">
          {/* Centered Logo */}
          <Link href="/" className="flex items-center gap-3 mb-6">
            <div className="relative w-12 h-12 overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="CryptoPro Logo" 
                width={48} 
                height={48} 
                className="object-contain"
                priority
                loading="eager"
                quality={90}
              />
            </div>
            <span className="text-white font-bold text-2xl">CryptoPro</span>
          </Link>
          
          <p className="text-gray-400 text-center max-w-lg mb-6">
            CryptoPro is the next generation crypto trading platform with advanced portfolio management, real-time tracking, and secure transactions.
          </p>
        </div>
        
        <div className="border-t border-dark-200 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CryptoPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
