"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import Link from 'next/link';

interface PlanProps {
  name: string;
  description: string;
  price: string;
  features: string[];
  minDeposit: string;
  maxDeposit: string;
  returns: string;
  duration: string;
  recommended?: boolean;
}

const PlanCard: React.FC<PlanProps> = ({
  name,
  description,
  price,
  features,
  minDeposit,
  maxDeposit,
  returns,
  duration,
  recommended = false
}) => {
  return (
    <div className={`relative rounded-2xl p-1 ${recommended ? 'bg-gradient-to-r from-primary-500 to-primary-700' : 'bg-dark-100'}`}>
      <div className="rounded-xl bg-dark-200 p-6 h-full flex flex-col">
        {recommended && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
            Recommended
          </div>
        )}
        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-2 ${recommended ? 'text-primary-500' : 'text-white'}`}>
            {name}
          </h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-3xl font-bold text-white">{price}</span>
            <span className="text-gray-400 ml-1">{duration}</span>
          </div>
          <p className="text-green-500 text-sm font-medium">{returns} ROI</p>
        </div>
        <div className="flex-grow mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-dark-100 pb-2">
              <span className="text-gray-400">Min. Deposit</span>
              <span className="text-white font-medium">{minDeposit}</span>
            </div>
            <div className="flex items-center justify-between border-b border-dark-100 pb-2">
              <span className="text-gray-400">Max. Deposit</span>
              <span className="text-white font-medium">{maxDeposit}</span>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/register" className="w-full">
          <Button
            className={`w-full ${recommended ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
            variant={recommended ? 'default' : 'outline'}
          >
            Select Plan
          </Button>
        </Link>
      </div>
    </div>
  );
};

const PricingPlans: React.FC = () => {
  const plans: PlanProps[] = [
    {
      name: 'STARTER',
      description: 'Essential plan for beginners',
      price: 'STARTER',
      minDeposit: '$500',
      maxDeposit: '$1,500',
      returns: '15%',
      duration: '',
      features: [
        'Minimum Deposit: $500',
        'Maximum Deposit: $1,500',
        'Capital Return: End of Term',
        '24/7 Customer Support'
      ]
    },
    {
      name: 'PREMIER',
      description: 'Elevated returns for growing investors',
      price: 'PREMIER',
      minDeposit: '$1,500',
      maxDeposit: '$3,000',
      returns: '20%',
      duration: '',
      recommended: true,
      features: [
        'Minimum Deposit: $1,500',
        'Maximum Deposit: $3,000',
        'Capital Return: End of Term',
        '24/7 Customer Support'
      ]
    },
    {
      name: 'PREMIUM',
      description: 'Advanced strategy for serious traders',
      price: 'PREMIUM',
      minDeposit: '$3,100',
      maxDeposit: '$6,000',
      returns: '25%',
      duration: '',
      features: [
        'Minimum Deposit: $3,100',
        'Maximum Deposit: $6,000',
        'Capital Return: End of Term',
        '24/7 Customer Support'
      ]
    },
    {
      name: 'SILVER',
      description: 'High performance investment package',
      price: 'SILVER',
      minDeposit: '$5,000',
      maxDeposit: '$15,000',
      returns: '30%',
      duration: '',
      features: [
        'Minimum Deposit: $5,000',
        'Maximum Deposit: $15,000',
        'Capital Return: End of Term',
        '24/7 Customer Support'
      ]
    },
    {
      name: 'GOLD',
      description: 'Premium service for significant investments',
      price: 'GOLD',
      minDeposit: '$10,000',
      maxDeposit: '$30,000',
      returns: '35%',
      duration: '',
      features: [
        'Minimum Deposit: $10,000',
        'Maximum Deposit: $30,000',
        'Capital Return: End of Term',
        '24/7 Customer Support'
      ]
    },
    {
      name: 'PLATINUM',
      description: 'Elite tier for institutional investors',
      price: 'PLATINUM',
      minDeposit: '$40,000',
      maxDeposit: '$100,000',
      returns: '40%',
      duration: '',
      features: [
        'Minimum Deposit: $40,000',
        'Maximum Deposit: $100,000',
        'Capital Return: End of Term',
        '24/7 Customer Support'
      ]
    }
  ];

  const [currentPlan, setCurrentPlan] = useState(0);

  return (
    <section className="py-20 relative overflow-hidden bg-dark-300">
      {/* Background gradient effects */}
      <div className="absolute top-40 right-[30%] w-[300px] h-[300px] bg-primary-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-[20%] w-[400px] h-[400px] bg-primary-800/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Investment Plans</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Choose the perfect investment plan to maximize your crypto trading potential.
            Each plan is designed to meet your specific investment goals and risk tolerance.
          </p>
          {/* Visual cryptocurrency animation */}
          <div className="hidden md:flex justify-center items-center gap-8 mb-12">
            <div className="relative w-16 h-16 animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">₿</div>
            </div>
            <div className="relative w-14 h-14 animate-float animation-delay-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">Ξ</div>
            </div>
            <div className="relative w-12 h-12 animate-float animation-delay-600">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">₮</div>
            </div>
            <div className="relative w-14 h-14 animate-float animation-delay-900">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">◎</div>
            </div>
          </div>
        </div>
        
        {/* Mobile plan selector with arrow navigation */}
        <div className="md:hidden pb-6 relative">
          <div className="mx-6 overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentPlan * 100}%)` }}
            >
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-2"
                >
                  <PlanCard {...plan} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Arrow navigation */}
          <button
            onClick={() => setCurrentPlan(prev => Math.max(0, prev - 1))}
            className="absolute top-1/2 -translate-y-1/2 left-0 w-10 h-10 bg-dark-200/80 backdrop-blur-sm rounded-full border border-dark-100 flex items-center justify-center text-white shadow-lg z-10"
            aria-label="Previous plan"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPlan(prev => Math.min(plans.length - 1, prev + 1))}
            className="absolute top-1/2 -translate-y-1/2 right-0 w-10 h-10 bg-dark-200/80 backdrop-blur-sm rounded-full border border-dark-100 flex items-center justify-center text-white shadow-lg z-10"
            aria-label="Next plan"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Dot indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {plans.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPlan(index)}
                className={`h-2 rounded-full ${index === currentPlan ? 'w-6 bg-primary-500' : 'w-2 bg-dark-100'}`}
                aria-label={`Go to plan ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {plans.slice(0, 3).map((plan, index) => (
            <PlanCard key={index} {...plan} />
          ))}
        </div>
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mt-8">
          {plans.slice(3, 6).map((plan, index) => (
            <PlanCard key={index + 3} {...plan} />
          ))}
        </div>
        
        {/* Visual crypto market stats */}
        <div className="mt-16 bg-dark-200/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl font-bold gradient-text mb-2">$1.8T+</div>
              <div className="text-gray-300 text-sm">Total Market Cap</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-300 text-sm">Trading Available</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold gradient-text mb-2">500+</div>
              <div className="text-gray-300 text-sm">Active Investors</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-300 text-sm">Secure Platform</div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Not sure which plan is right for you?
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our investment advisors are ready to help you choose the best plan based on your investment
            goals and risk tolerance. Contact us today for a personalized consultation.
          </p>
          <Link href="/contact">
            <Button size="lg">
              Get Expert Advice
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;