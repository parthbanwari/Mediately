import React, { useState } from 'react';
import { Scale, Menu, User, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isAuthenticated, user, currentView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="LegalMediate Logo"
                className="h-13 w-11 object-contain rounded-full"
              />
              <span className="text-xl font-bold">LegalMediate</span>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'home' 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/mediators')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'mediators' 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Find Mediators
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate(user?.type === 'mediator' ? '/mediator-dashboard' : '/client-dashboard')}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'dashboard' 
                    ? 'text-white border-b-2 border-white pb-1' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-semibold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/auth?mode=signin', { loginMode: true })}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/auth?mode=signup', { loginMode: false })}
                  className="border border-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:text-black transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  navigate('/home');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate('/mediators');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Find Mediators
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
              )}
              <div className="pt-4 border-t border-gray-700">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-black" />
                      </div>
                      <span className="text-sm text-white">{user?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/auth?mode=signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;