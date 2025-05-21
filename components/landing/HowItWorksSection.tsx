"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import Link from 'next/link';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, title, description, icon }) => {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <div className="mb-4 relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-100 border border-dark-50 flex items-center justify-center text-xs font-bold text-white">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

const HowItWorksSection: React.FC = () => {
  const steps: StepProps[] = [
    {
      number: 1,
      title: "Create an Account",
      description: "Register for free and complete your profile verification to start your investment journey with CryptPro.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      number: 2,
      title: "Choose an Investment Plan",
      description: "Select from our range of investment plans based on your investment goals and risk tolerance.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      number: 3,
      title: "Make a Deposit",
      description: "Fund your account with your preferred cryptocurrency to start your investment portfolio.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      number: 4,
      title: "Track Your Earnings",
      description: "Monitor your investment performance in real-time through your personalized dashboard.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      number: 5,
      title: "Withdraw Profits",
      description: "Request withdrawals at any time and receive your profits directly to your wallet.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      number: 6,
      title: "24/7 Support",
      description: "Get assistance anytime with our dedicated support team ready to help with any questions.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    }
  ];

  // Add state to track the current step
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <section className="py-20 bg-dark-400 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute bottom-0 right-[20%] w-[350px] h-[350px] bg-primary-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/4 left-[10%] w-[250px] h-[250px] bg-primary-700/10 rounded-full blur-3xl -z-10" />

      {/* Floating elements */}
      <div className="hidden lg:block absolute top-20 right-[5%] animate-float animation-delay-300">
        <div className="w-16 h-16 bg-dark-200/80 backdrop-blur-sm rounded-lg border border-primary-500/30 flex items-center justify-center shadow-glow">
          <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-40 left-[10%] animate-float animation-delay-600">
        <div className="w-14 h-14 bg-dark-200/80 backdrop-blur-sm rounded-lg border border-primary-500/30 flex items-center justify-center shadow-glow">
          <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Get started with CryptPro in just a few simple steps and begin your journey to
            financial growth through strategic crypto investments.
          </p>

          {/* Visual journey line */}
          <div className="hidden md:flex justify-center mb-8">
            <div className="relative h-2 bg-dark-300 rounded-full w-3/4 max-w-md">
              <div className="absolute left-0 top-0 h-full w-2/3 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"></div>
              <div className="absolute -top-1 left-0 w-4 h-4 bg-primary-500 rounded-full"></div>
              <div className="absolute -top-1 left-1/3 w-4 h-4 bg-primary-500 rounded-full"></div>
              <div className="absolute -top-1 left-2/3 w-4 h-4 bg-primary-500 rounded-full"></div>
              <div className="absolute -top-1 right-0 w-4 h-4 bg-dark-100 border-2 border-primary-500/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Mobile steps with arrow navigation */}
        <div className="md:hidden relative pb-8">
          <div className="mx-6 overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentStep * 100}%)` }}
            >
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="w-full flex-shrink-0 px-2"
                >
                  <div className="bg-dark-300/80 rounded-xl p-6 border border-dark-100">
                    <Step {...step} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow navigation */}
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className="absolute top-1/2 -translate-y-1/2 left-0 w-10 h-10 bg-dark-200/80 backdrop-blur-sm rounded-full border border-dark-100 flex items-center justify-center text-white shadow-lg z-10"
            aria-label="Previous step"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="absolute top-1/2 -translate-y-1/2 right-0 w-10 h-10 bg-dark-200/80 backdrop-blur-sm rounded-full border border-dark-100 flex items-center justify-center text-white shadow-lg z-10"
            aria-label="Next step"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full ${index === currentStep ? 'w-6 bg-primary-500' : 'w-2 bg-dark-100'}`}
                aria-label={`Go to step ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Desktop grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {steps.map((step) => (
            <Step key={step.number} {...step} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/register">
            <Button size="lg">
              Start Investing Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;