import { NextResponse } from 'next/server';

// Plan types based on the schema in PricingPlans.tsx component
interface PlanProps {
  name: string;
  roi: string;
  minDeposit: string;
  maxDeposit: string; 
  description: string;
  features?: string[];
}

// Function to get all investment plans
export async function GET() {
  try {
    const plans = {
      STARTER: {
        name: 'STARTER',
        roi: '15',
        minDeposit: '$500',
        maxDeposit: '$1,500',
        description: 'Essential plan for beginners'
      },
      PREMIER: {
        name: 'PREMIER',
        roi: '20',
        minDeposit: '$1,500',
        maxDeposit: '$3,000',
        description: 'Ideal for growing investors'
      },
      PREMIUM: {
        name: 'PREMIUM',
        roi: '25',
        minDeposit: '$3,100',
        maxDeposit: '$6,000',
        description: 'Strategic growth plan'
      },
      SILVER: {
        name: 'SILVER',
        roi: '30',
        minDeposit: '$5,000',
        maxDeposit: '$15,000',
        description: 'Advanced investment strategy'
      },
      GOLD: {
        name: 'GOLD',
        roi: '35',
        minDeposit: '$10,000',
        maxDeposit: '$30,000',
        description: 'Premium wealth building'
      },
      PLATINUM: {
        name: 'PLATINUM',
        roi: '40',
        minDeposit: '$40,000',
        maxDeposit: '$100,000',
        description: 'Ultimate investment experience'
      },
      NONE: {
        name: 'None',
        roi: '0',
        minDeposit: '$0',
        maxDeposit: '$0',
        description: 'No investment plan selected'
      }
    };

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error('Error fetching investment plans:', error);
    return NextResponse.json({ error: 'Failed to fetch investment plans' }, { status: 500 });
  }
}
