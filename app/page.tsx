import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import HeroSection from '@/components/landing/HeroSection';
import PricingPlans from '@/components/landing/PricingPlans';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import IllustrationSection from '@/components/landing/IllustrationSection';
import VideoSection from '@/components/landing/VideoSection';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-300">
      <Head>
        {/* Force favicon to be used site-wide regardless of caching */}
        <link rel="icon" href="/images/logo.png" type="image/png" />
      </Head>
      <Navbar transparent={true} />
      <main className="flex-grow">
        <HeroSection />
        <IllustrationSection />
        <PricingPlans />
        <VideoSection />
        <HowItWorksSection />
        <TestimonialsSection />
        {/* Links now use standard Next.js navigation with no external redirects */}
      </main>
      <Footer />
    </div>
  );
}
