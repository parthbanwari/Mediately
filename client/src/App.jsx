import React, { useState,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Auth from './components/auth';
import CaseSubmission from './components/CaseSubmission';
import ClientDashboard from './components/ClientDashboard';
import MediatorDashboard from './components/MediatorDashboard';
import MediatorProfileSetup from './components/MediatorProfileSetup';
import MediatorDirectory from './components/MediatorDirectory';
import SendCaseToMediator from './components/SendCaseToMediator';
import MessagingChat from './components/MessagingChat';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db,auth } from './firebase/firebase';
import { getUserInfo } from './firebase/auth';
import { signOut } from 'firebase/auth';


function App() {
  return (
    <>
    <Router>
      <AppContent />
    </Router>
    </>
  );
}

const AppContent = () => {
  const navigate = useNavigate(); // ✅ Move this here

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null
  });

  const [mediatorProfiles, setMediatorProfiles] = useState([]);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userInfo = await getUserInfo(firebaseUser.uid);
            const user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userInfo.name,
              type: userInfo.role,
              profileCompleted: userInfo.profileCompleted
            };

            setAuthState({ isAuthenticated: true, user });

            // Auto-redirect if already logged in and on "/auth"
            if (window.location.pathname === "/auth") {
              if (user.type === "mediator") {
                navigate(user.profileCompleted ? "/mediator-dashboard" : "/mediator-profile-setup");
              } else {
                navigate("/client-dashboard");
              }
            }
          } catch (err) {
            console.error("Failed to fetch user info:", err);
            setAuthState({ isAuthenticated: false, user: null });
          }
        } else {
          setAuthState({ isAuthenticated: false, user: null });
        }
      });

      return () => unsubscribe();
    }, [navigate]); // ✅ Now navigate is properly in the effect


    const handleLogin = (user) => {
      setAuthState({ isAuthenticated: true, user });

      // ✅ Navigate based on user role
      if (user.type === 'mediator') {
        if (user.profileCompleted) {
          navigate('/mediator-dashboard');
        } else {
          navigate('/mediator-profile-setup');
        }
      } else {
        navigate('/client-dashboard');
      }
    };


    const handleLogout = async () => {
      try {
        await signOut(auth); // Properly logs out Firebase user
        setAuthState({ isAuthenticated: false, user: null });
        navigate('/auth');  // Ensure the user is redirected to the login page after logout
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };



  const handleProfileSetupComplete = async (profileData) => {
    const updatedUser = {
      ...authState.user,
      profileCompleted: true,
      profileData: profileData
    };

    setAuthState({ isAuthenticated: true, user: updatedUser });

    try {
      await updateDoc(doc(db, "accounts", updatedUser.uid), {
        profileCompleted: true
      });
    } catch (error) {
      console.error("Failed to update accounts collection:", error);
    }

    setMediatorProfiles(prev => [...prev, {
      id: updatedUser.uid,
      name: updatedUser.name,
      email: updatedUser.email,
      ...profileData,
      rating: 5.0,
      reviews: 0,
      successfulCases: 0,
      availableToday: true
    }]);

    navigate('/mediator-dashboard');
  };

  return (
    <>
      <Header
        isAuthenticated={authState.isAuthenticated}
        user={authState.user}
        onLogout={handleLogout}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero
                  onGetStarted={() => navigate('/auth')}
                  onFindMediators={() => navigate('/mediators')}
                />
                <Features />
                <Footer />
              </>
            }
          />

          <Route
            path="/auth"
            element={<Auth onLogin={handleLogin} loginMode={true} />}
          />

          <Route
            path="/mediator-profile-setup"
            element={
              authState.user && authState.user.type === 'mediator' && !authState.user.profileCompleted ? (
                <MediatorProfileSetup user={authState.user} onComplete={handleProfileSetupComplete} />
              ) : (
                <Navigate to="/mediator-dashboard" />
              )
            }
          />

          <Route
            path="/client-dashboard"
            element={
              authState.user && authState.user.type === 'client' ? (
                <ClientDashboard user={authState.user} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />

          <Route path="/chat/:caseId" element={<MessagingChat />} />
          
          <Route
            path="/submit-case"
            element={
              authState.user && authState.user.type === 'client' ? (
                <CaseSubmission user={authState.user} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />

          <Route
            path="/mediator-dashboard"
            element={
              authState.user && authState.user.type === 'mediator' ? (
                <MediatorDashboard user={authState.user} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />

          <Route
            path="/mediators"
            element={
              <MediatorDirectory
                user={authState.user}
                mediatorProfiles={mediatorProfiles}
              />
            }
          />

          <Route
            path="/send-case"
            element={<SendCaseToMediator user={authState.user} />}
          />
        </Routes>
      </main>
    </>
  );
};

export default App;
