import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/Button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden bg-dark-300">
      {/* Background gradient effect */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-primary-800/20 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="gradient-text">Buy and trade cryptos</span>
              <br /> 
              <span className="text-white">like never before.</span>
            </h1>
            
            <p className="text-lg text-gray-300 max-w-lg">
              Experience next-generation crypto trading with powerful tools, real-time tracking, and secure wallet services. Take control of your financial future today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Features
                </Button>
              </Link>
            </div>
            
            {/* Removed company list section */}
          </div>
          
          <div className="relative lg:h-[600px] flex items-center justify-center mx-auto">
            <div className="w-full max-w-[500px] aspect-square relative mx-auto lg:mx-0">
              {/* App screenshot with enhanced visual appeal */}
              <div className="card w-full h-full bg-dark-200 border border-dark-100 rounded-3xl shadow-glow overflow-hidden p-6 transform hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white font-medium">Dashboard</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-dark-300 rounded-xl">
                    <div className="text-sm text-gray-400">Total Balance</div>
                    <div className="text-2xl font-bold text-white">$18,420.69</div>
                    <div className="text-sm text-green-500">+5.3% today</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white">Assets</div>
                      <div className="text-sm text-gray-400">Value</div>
                    </div>
                    
                    {[
                      { name: 'Bitcoin', symbol: 'BTC', value: '$103,440.21', change: '+2.8%' },
                      { name: 'Ethereum', symbol: 'ETH', value: '$2,245.10', change: '+1.9%' },
                    ].map((asset, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs">
                            {asset.symbol.substring(0, 1)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{asset.name}</div>
                            <div className="text-xs text-gray-400">{asset.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{asset.value}</div>
                          <div className="text-xs text-green-500">{asset.change}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
