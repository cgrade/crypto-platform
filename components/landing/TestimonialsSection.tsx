import React from 'react';
import Image from 'next/image';

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  imageUrl?: string;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ content, author, role, imageUrl }) => {
  return (
    <div className="bg-dark-200 rounded-2xl p-6 border border-dark-100 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:border-primary-500/30">
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      <p className="text-gray-300 mb-6 italic">{content}</p>
      
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
            {imageUrl ? (
              <Image src={imageUrl} alt={author} width={40} height={40} className="rounded-full" />
            ) : (
              author.charAt(0)
            )}
          </div>
        </div>
        <div>
          <h4 className="text-white font-medium">{author}</h4>
          <p className="text-gray-400 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials: TestimonialProps[] = [
    {
      content: "The Standard Plan has completely transformed my trading experience. The weekly returns are consistent, and the tools provided have helped me make smarter investment decisions.",
      author: "Alex Morgan",
      role: "Day Trader, 2 years with CryptPro"
    },
    {
      content: "As a beginner in crypto trading, the Starter Plan was perfect for me. The customer support team guided me through the entire process, and I have already seen significant returns.",
      author: "Maria Chen",
      role: "New Investor, 6 months with CryptPro"
    },
    {
      content: "The Premium Plan offers exceptional value. The dedicated account manager and real-time market alerts have helped me maximize my portfolio growth beyond my expectations.",
      author: "David Williams",
      role: "Professional Investor, 1.5 years with CryptPro"
    },
    {
      content: "I was skeptical at first, but after seeing consistent weekly returns with the Elite Plan, I'm convinced this is the best platform for serious crypto investors.",
      author: "Samantha Lee",
      role: "Institutional Investor, 3 years with CryptPro"
    }
  ];

  return (
    <section className="py-20 bg-dark-300 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-[40%] w-[400px] h-[400px] bg-primary-700/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-[15%] w-[300px] h-[300px] bg-primary-600/10 rounded-full blur-3xl -z-10" />
      
      {/* Visual elements */}
      <div className="absolute left-[5%] top-[20%] hidden lg:block">
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-32 h-32 border-2 border-primary-500/30 rounded-full animate-pulse-slow"></div>
          <div className="w-28 h-28 bg-dark-200/50 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-14 h-14 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="absolute right-[5%] bottom-[20%] hidden lg:block">
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-24 h-24 border-2 border-primary-500/30 rounded-full animate-pulse-slow animation-delay-300"></div>
          <div className="w-20 h-20 bg-dark-200/50 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">What Our Investors Say</span>
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Discover how our investment plans have helped traders around the world 
            achieve their financial goals through strategic crypto investments.
          </p>
          
          {/* Visual rating indicator */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-white font-medium">4.9/5</span>
            <span className="ml-1 text-gray-400 text-sm">(500+ reviews)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
        

      </div>
    </section>
  );
};

export default TestimonialsSection;
