import React from 'react';
import Image from 'next/image';
import { Button } from '../ui/Button';
import Link from 'next/link';

const IllustrationSection: React.FC = () => {
  return (
    <section className="py-20 bg-dark-300 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute bottom-0 left-[30%] w-[400px] h-[400px] bg-primary-600/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                <span className="gradient-text">Cryptocurrency</span>
                <br />
                <span className="text-white">The Future of Finance</span>
              </h2>
              
              <p className="text-gray-300 text-lg">
                The global economy is rapidly evolving, and cryptocurrency is at the forefront 
                of this financial revolution. Our platform provides you with the tools and 
                expertise to capitalize on this opportunity.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary-500 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-200">Blockchain technology provides unparalleled security and transparency</span>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary-500 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-200">Digital assets offer protection against inflation and currency devaluation</span>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary-500 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-200">Our expert trading strategies maximize your investment potential</span>
                </div>
              </div>
              
              <div className="pt-6">
                <Link href="/register">
                  <Button size="lg" className="mr-4">
                    Start Investing Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact an Expert
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* 3D Bitcoin Illustration */}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="w-72 h-72 md:w-96 md:h-96 relative animate-float">
                  <div className="w-full h-full bg-dark-200/50 backdrop-blur-sm rounded-full shadow-glow border border-primary-500/30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl font-bold text-primary-500">₿</div>
                  </div>
                  
                  {/* Orbiting elements */}
                  <div className="absolute w-full h-full animate-spin-slow">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-12 h-12 bg-dark-200/70 backdrop-blur-sm rounded-full border border-primary-500/30 flex items-center justify-center text-primary-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                      <div className="w-12 h-12 bg-dark-200/70 backdrop-blur-sm rounded-full border border-primary-500/30 flex items-center justify-center text-blue-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <div className="w-12 h-12 bg-dark-200/70 backdrop-blur-sm rounded-full border border-primary-500/30 flex items-center justify-center text-green-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-12 h-12 bg-dark-200/70 backdrop-blur-sm rounded-full border border-primary-500/30 flex items-center justify-center text-yellow-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow effects */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 rounded-full filter blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-500/20 rounded-full filter blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IllustrationSection;
