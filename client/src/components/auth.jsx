import React, { useState,useEffect } from 'react';
import { User, Mail, Lock, ArrowRight, X, Scale, Phone, Globe } from 'lucide-react';
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  getUserInfo,
  doSignInWithGoogle,
} from '../firebase/auth';
import { setDoc,doc } from 'firebase/firestore';
import { db,auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { setPersistence,browserLocalPersistence,browserSessionPersistence } from 'firebase/auth';
import { useSearchParams } from 'react-router-dom';

const Auth = ({ onLogin, onCancel, loginMode = true }) => {
  const [isLogin, setIsLogin] = useState(loginMode);
  const [userType, setUserType] = useState('client');
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      let userCredential;

      if (isLogin) {
        // Login flow
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        userCredential = await doSignInWithEmailAndPassword(formData.email, formData.password);
        const userInfo = await getUserInfo(userCredential.user.uid);
        
        const user = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userInfo.name,
          type: userInfo.role,
          profileCompleted: userInfo.profileCompleted,
        };

        onLogin(user);
      } else {
        // Signup flow
        userCredential = await doCreateUserWithEmailAndPassword(
          formData.email,
          formData.password,
          formData.name,
          userType
        );

        const { uid, email } = userCredential.user;

        // ✅ Create a doc in Firestore with the same UID
        await setDoc(doc(db, 'accounts', uid), {
          uid,
          name: formData.name,
          email,
          role: userType,
          profileCompleted: false,
        });

        const user = {
          uid,
          email,
          name: formData.name,
          type: userType,
          profileCompleted: false,
        };

        onLogin(user);
      }

    } catch (error) {
      alert("Authentication Error: " + error.message);
    }
  };


  const handleGoogleLogin = async () => {
    try {
      const userCredential = await doSignInWithGoogle();
      const userInfo = await getUserInfo(userCredential.user.uid);

      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userInfo.name,
        type: userInfo.role,
        profileCompleted: userInfo.profileCompleted
      };

      onLogin(user);
    } catch (err) {
      alert("Google login failed: " + err.message);
    }
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1" />
              <div className="bg-black p-3 rounded-full">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 flex justify-end">
                <button onClick={onCancel} className="text-gray-400 hover:text-black transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-black">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? 'Access your legal mediation dashboard'
                : 'Join our legal mediation platform'}
            </p>
          </div>

          {/* User Type Selection (Only during signup) */}
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                {['client', 'mediator'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      userType === type ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {type === 'client' ? <User className="h-5 w-5 mx-auto mb-2" /> : <Scale className="h-5 w-5 mx-auto mb-2" />}
                    <div className="font-medium capitalize">{type}</div>
                    <div className="text-xs text-gray-500">
                      {type === 'client' ? 'Need legal help' : 'Provide legal services'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 flex justify-center items-center"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            {isLogin && (
              <label className="inline-flex items-center cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden peer"
                />
                <span className="w-4 h-4 inline-block border border-gray-400 rounded-sm peer-checked:bg-gray-900 peer-checked:text-white flex items-center justify-center text-sm" />
                <span className="ml-2 text-gray-700">Remember me</span>
              </label>
            )}
          </form>

          {/* Divider & Alt Auth */}
          <div className="my-4 text-center text-gray-400 text-sm">or</div>
          <div className="space-y-2">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-50"
            >
              <Globe className="h-5 w-5 mr-2 text-black" /> Continue with Google
            </button>
            <button
              onClick={() => alert('Phone login coming soon')}
              className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-50"
            >
              <Phone className="h-5 w-5 mr-2 text-black" /> Continue with Phone Number
            </button>
          </div>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => navigate(`/auth?mode=${isLogin ? 'signup' : 'signin'}`)}
                className="ml-2 text-black hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
