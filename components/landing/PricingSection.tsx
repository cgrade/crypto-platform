import React from 'react';
import { Button } from '../ui/Button';
import Link from 'next/link';

interface PriceCardProps {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price, features, isPopular = false }) => {
  return (
    <div className={`card overflow-hidden ${isPopular ? 'border-primary-500 relative' : 'border-dark-100'}`}>
      {isPopular && (
        <div className="absolute top-0 left-0 w-full bg-primary-500 text-white text-xs font-medium py-1 text-center">
          MOST POPULAR
        </div>
      )}
      <div className={`p-6 ${isPopular ? 'pt-8' : ''}`}>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <div className="flex items-end gap-1 mb-6">
          <span className="text-3xl font-bold text-white">{price}</span>
          {price !== 'Free' && <span className="text-gray-400 pb-1">/month</span>}
        </div>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Link href="/register">
          <Button 
            variant={isPopular ? 'default' : 'outline'} 
            className="w-full"
          >
            {isPopular ? 'Start Now' : 'Get Started'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

const PricingSection: React.FC = () => {
  const plans = [
    {
      title: 'Basic',
      price: 'Free',
      features: [
        'Account creation',
        'Portfolio tracking',
        'Basic market data',
        'Limited transactions',
        'Email support'
      ]
    },
    {
      title: 'Pro',
      price: '$29',
      features: [
        'All Basic features',
        'Advanced portfolio analytics',
        'Real-time market data',
        'Unlimited transactions',
        'Priority support',
        'Trading charts'
      ],
      isPopular: true
    },
    {
      title: 'Enterprise',
      price: '$99',
      features: [
        'All Pro features',
        'Custom reporting',
        'API access',
        'Multiple portfolios',
        'Dedicated account manager',
        'Advanced security features',
        'White-label options'
      ]
    }
  ];

  return (
    <section className="py-20 bg-dark-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Pricing</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for your trading needs, from casual investors to professional traders.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PriceCard
              key={index}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              isPopular={plan.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
