import React from 'react';
import { Scale, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="h-8 w-8" />
              <span className="text-xl font-bold">LegalMediate</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Professional legal mediation platform connecting clients with qualified Mediator 
              for dispute resolution services. Secure, confidential, and efficient.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-3" />
                <span>1-800-MEDIATE</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-3" />
                <span>contact@legalmediate.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-3" />
                <span>Legal District, Professional Plaza</span>
              </div>
            </div>
          </div>

          {/* Legal Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal Areas</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Family Law</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Business Disputes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contract Issues</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Employment Law</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Real Estate</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Personal Injury</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Find Mediator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal Consultation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Management</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 LegalMediate. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Legal Notice
              </a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-center text-xs text-gray-500">
              This platform connects clients with licensed attorneys. LegalMediate does not provide legal advice 
              and is not a law firm. All legal services are provided by independent licensed attorneys.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;