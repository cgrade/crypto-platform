import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import HeroSection from '@/components/landing/HeroSection';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-300">
      <Navbar transparent={true} />
      <main className="flex-grow">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
