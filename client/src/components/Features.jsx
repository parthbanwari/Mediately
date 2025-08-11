import React from 'react';
import { Video, Calendar, MessageSquare, Shield, Clock, Users, FileText, Scale } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Video,
      title: 'Video Meetings',
      description: 'Secure video calls with Mediator from anywhere. High-quality, encrypted sessions for your privacy.'
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments that work for you. Choose video calls or in-person meetings.'
    },
    {
      icon: MessageSquare,
      title: 'Secure Messaging',
      description: 'Private communication with your Mediator. Share documents and get updates safely.'
    },
    {
      icon: Shield,
      title: 'Complete Privacy',
      description: 'All conversations are confidential. Your information is protected and secure.'
    },
    {
      icon: FileText,
      title: 'Document Sharing',
      description: 'Upload and share legal documents easily. Keep everything organized in one place.'
    },
    {
      icon: Users,
      title: 'Expert Mediators',
      description: 'Access qualified Mediators specializing in different areas of law and mediation.'
    },
    {
      icon: Clock,
      title: 'Fast Resolution',
      description: 'Resolve disputes faster than traditional court processes. Save time and money.'
    },
    {
      icon: Scale,
      title: 'Fair Mediation',
      description: 'Professional mediation services to help both parties reach fair agreements.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple steps to resolve your legal disputes with professional help
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Process Steps */}
        <div className="bg-black rounded-2xl p-8 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Simple Process</h3>
            <p className="text-gray-300">Get help in three easy steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Submit Your Case</h4>
              <p className="text-gray-300">
                Tell us about your dispute. Upload any relevant documents and describe what happened.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Choose a Mediator</h4>
              <p className="text-gray-300">
                Browse qualified Mediators who specialize in your type of case. Read reviews and compare.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Start Mediation</h4>
              <p className="text-gray-300">
                Meet with your Mediator via video or in person. Work together to resolve your dispute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;