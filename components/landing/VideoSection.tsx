import React from 'react';

const VideoSection: React.FC = () => {
  return (
    <section className="py-20 bg-dark-400 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute top-0 right-[20%] w-[350px] h-[350px] bg-primary-700/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Why Bitcoin is the Future</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Learn how cryptocurrency is revolutionizing the global economy and why 
            now is the perfect time to invest in digital assets.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-glow border border-dark-100">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/s4g1XFU8Gto?rel=0" 
              title="What is Bitcoin? Bitcoin Explained Simply for Dummies"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
          
          {/* Mobile cards with arrow navigation */}
          <div className="mt-8 md:hidden relative">
            <div className="mx-6 overflow-hidden">
              <div id="video-cards-slider" className="flex transition-transform duration-300 ease-in-out">
                <div className="w-full flex-shrink-0 px-2">
                  <div className="bg-dark-200/50 backdrop-blur-sm rounded-xl p-6 h-full">
                    <div className="text-center">
                      <div className="text-primary-500 font-medium mb-2">Benefits</div>
                      <h4 className="text-white text-lg font-medium mb-2">Financial Freedom</h4>
                      <p className="text-gray-300 text-sm">Bitcoin offers decentralized control, protection against inflation, and borderless transactions.</p>
                    </div>
                  </div>
                </div>
                <div className="w-full flex-shrink-0 px-2">
                  <div className="bg-dark-200/50 backdrop-blur-sm rounded-xl p-6 h-full">
                    <div className="text-center">
                      <div className="text-primary-500 font-medium mb-2">Security</div>
                      <h4 className="text-white text-lg font-medium mb-2">Blockchain Technology</h4>
                      <p className="text-gray-300 text-sm">Advanced cryptography and distributed ledger technology ensure maximum security and transparency.</p>
                    </div>
                  </div>
                </div>
                <div className="w-full flex-shrink-0 px-2">
                  <div className="bg-dark-200/50 backdrop-blur-sm rounded-xl p-6 h-full">
                    <div className="text-center">
                      <div className="text-primary-500 font-medium mb-2">Opportunity</div>
                      <h4 className="text-white text-lg font-medium mb-2">Limited Supply</h4>
                      <p className="text-gray-300 text-sm">With only 21 million coins ever to be created, Bitcoin's scarcity drives long-term value growth.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arrow navigation */}
            <button 
              id="prev-card"
              className="absolute top-1/2 -translate-y-1/2 left-0 w-10 h-10 bg-dark-200/80 backdrop-blur-sm rounded-full border border-dark-100 flex items-center justify-center text-white shadow-lg z-10"
              aria-label="Previous card"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              id="next-card"
              className="absolute top-1/2 -translate-y-1/2 right-0 w-10 h-10 bg-dark-200/80 backdrop-blur-sm rounded-full border border-dark-100 flex items-center justify-center text-white shadow-lg z-10"
              aria-label="Next card"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Dot indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              <button data-index="0" className="h-2 rounded-full video-indicator w-6 bg-primary-500" aria-label="Go to card 1"></button>
              <button data-index="1" className="h-2 rounded-full video-indicator w-2 bg-dark-100" aria-label="Go to card 2"></button>
              <button data-index="2" className="h-2 rounded-full video-indicator w-2 bg-dark-100" aria-label="Go to card 3"></button>
            </div>
            
            {/* Client-side script for arrow navigation */}
            <script dangerouslySetInnerHTML={{ __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const slider = document.getElementById('video-cards-slider');
                const prevButton = document.getElementById('prev-card');
                const nextButton = document.getElementById('next-card');
                const dots = document.querySelectorAll('.video-indicator');
                let currentIndex = 0;
                const totalItems = 3;
                
                function updateSlider() {
                  slider.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
                  
                  // Update dots
                  dots.forEach((dot, index) => {
                    if (index === currentIndex) {
                      dot.classList.add('w-6', 'bg-primary-500');
                      dot.classList.remove('w-2', 'bg-dark-100');
                    } else {
                      dot.classList.remove('w-6', 'bg-primary-500');
                      dot.classList.add('w-2', 'bg-dark-100');
                    }
                  });
                }
                
                prevButton.addEventListener('click', function() {
                  currentIndex = Math.max(0, currentIndex - 1);
                  updateSlider();
                });
                
                nextButton.addEventListener('click', function() {
                  currentIndex = Math.min(totalItems - 1, currentIndex + 1);
                  updateSlider();
                });
                
                dots.forEach((dot, index) => {
                  dot.addEventListener('click', function() {
                    currentIndex = index;
                    updateSlider();
                  });
                });
              });
            ` }} />
          </div>
          
          {/* Desktop layout */}
          <div className="mt-8 hidden md:flex flex-col md:flex-row gap-6 justify-center md:justify-between">
            <div className="bg-dark-200/50 backdrop-blur-sm rounded-xl p-4 flex-1">
              <div className="text-center md:text-left">
                <div className="text-primary-500 font-medium mb-2">Benefits</div>
                <h4 className="text-white text-lg font-medium mb-2">Financial Freedom</h4>
                <p className="text-gray-300 text-sm">Bitcoin offers decentralized control, protection against inflation, and borderless transactions.</p>
              </div>
            </div>
            <div className="bg-dark-200/50 backdrop-blur-sm rounded-xl p-4 flex-1">
              <div className="text-center md:text-left">
                <div className="text-primary-500 font-medium mb-2">Security</div>
                <h4 className="text-white text-lg font-medium mb-2">Blockchain Technology</h4>
                <p className="text-gray-300 text-sm">Advanced cryptography and distributed ledger technology ensure maximum security and transparency.</p>
              </div>
            </div>
            <div className="bg-dark-200/50 backdrop-blur-sm rounded-xl p-4 flex-1">
              <div className="text-center md:text-left">
                <div className="text-primary-500 font-medium mb-2">Opportunity</div>
                <h4 className="text-white text-lg font-medium mb-2">Limited Supply</h4>
                <p className="text-gray-300 text-sm">With only 21 million coins ever to be created, Bitcoin's scarcity drives long-term value growth.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
