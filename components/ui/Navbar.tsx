import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './Button';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  return (
    <header className={`w-full py-4 ${transparent ? 'absolute top-0 left-0 z-10' : 'bg-dark-200 border-b border-dark-100'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="CryptoPro Logo" 
                width={40} 
                height={40} 
                className="object-contain" 
                priority
                loading="eager"
                quality={90}
              />
            </div>
            <span className="text-white font-bold text-xl">CryptoPro</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white hover:text-primary-400 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-primary-400 transition-colors">
              About
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="default">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="default">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
