import React from 'react';
import { ArrowRight, Scale, Users, Clock, Shield } from 'lucide-react';

const Hero = ({ onGetStarted, onFindMediators }) => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="flex justify-center mb-8">
              <div className="w-21 h-24 rounded-full overflow-hidden">
                <img
                  src="/logo.png"
                  alt="LegalMediate Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            </div>

          
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Resolve Legal Disputes
            <span className="block text-gray-600">Simply & Efficiently</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect with qualified mediators for mediation services. 
            Schedule video calls or in-person meetings to resolve your disputes quickly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onGetStarted}
              className="bg-black text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors flex items-center"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={onFindMediators}
              className="border-2 border-black text-black px-8 py-4 rounded-lg text-lg font-medium hover:bg-black hover:text-white transition-colors"
            >
              Browse Mediators
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Users className="h-8 w-8 text-black mx-auto" />
              </div>
              <div className="text-2xl font-bold text-black mb-1">500+</div>
              <div className="text-sm text-gray-600">Mediators</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Scale className="h-8 w-8 text-black mx-auto" />
              </div>
              <div className="text-2xl font-bold text-black mb-1">2,000+</div>
              <div className="text-sm text-gray-600">Cases Resolved</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Clock className="h-8 w-8 text-black mx-auto" />
              </div>
              <div className="text-2xl font-bold text-black mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Shield className="h-8 w-8 text-black mx-auto" />
              </div>
              <div className="text-2xl font-bold text-black mb-1">100%</div>
              <div className="text-sm text-gray-600">Secure</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;