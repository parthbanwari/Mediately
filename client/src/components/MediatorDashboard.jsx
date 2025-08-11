  import React, { useState, useEffect } from 'react';
  import { Users, FileText, Calendar, MessageSquare, Clock, CheckCircle, User, Star, MapPin, Phone, Mail, Edit, Check, X } from 'lucide-react';
  import { doc,setDoc,getDoc,updateDoc,collection,query,where,getDocs} from 'firebase/firestore';
  import { db } from '../firebase/firebase'
  import CaseDetail from './CaseDetail';

  const MediatorDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('requests');
    const [profile, setProfile] = useState(null);
    const [editProfile, setEditProfile] = useState(null); 
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [caseRequests, setCaseRequests] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showCaseDetails, setShowCaseDetails] = useState(false);
    const [activeCases, setActiveCases] = useState([]);

    const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'mediators', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        console.log("No profile found for this mediator.");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

    useEffect(() => {
      const fetchMediatorCases = async () => {
        try {
          const casesRef = collection(db, 'cases');
          const q = query(casesRef, where('mediatorId', '==', user.uid));
          const snapshot = await getDocs(q);

          const enrichedCases = await Promise.all(snapshot.docs.map(async docSnap => {
            const caseData = { id: docSnap.id, ...docSnap.data() };

            // Fetch client name
            if (caseData.clientId) {
              const clientDoc = await getDoc(doc(db, 'accounts', caseData.clientId));
              if (clientDoc.exists()) {
                const clientInfo = clientDoc.data();
                caseData.clientName = clientInfo.Name || clientInfo.name || 'Unknown Client';
              } else {
                caseData.clientName = 'Unknown Client';
              }
            } else {
              caseData.clientName = 'Unknown Client';
            }


            // Add fallbacks for progress, startDate, nextMeeting
            caseData.startDate = caseData.startDate?.toDate?.().toLocaleDateString() || 'N/A';
            caseData.nextMeeting = caseData.nextMeeting?.toDate?.().toLocaleString() || 'N/A';


            return caseData;
          }));

          const pending = enrichedCases.filter(c => c.status === 'pending');
          const active = enrichedCases.filter(c => c.status === 'accepted');

          setCaseRequests(pending);
          setActiveCases(active);
        } catch (err) {
          console.error("Error fetching cases:", err);
        }
      };
       fetchProfile();
       fetchMediatorCases();
    },[]);
    

    const stats = {
      totalCases: 45,
      activeCases: activeCases.length,
      completedCases: 28,
      pendingRequests: caseRequests.filter(req => req.status === 'pending').length
    };

    const handleAcceptCase = async (caseId) => {
      try {
        // Get the mediator's profile (name) to assign to the case
        const mediatorRef = doc(db, 'mediators', user.uid);
        const mediatorSnap = await getDoc(mediatorRef);
        if (!mediatorSnap.exists()) throw new Error("Mediator profile not found");

        const mediatorData = mediatorSnap.data();

        // Update the case document with mediator info
        const caseRef = doc(db, 'cases', caseId);
        await updateDoc(caseRef, {
          status: 'accepted',
          assignedMediator: mediatorData.name, // or mediatorData.Name
          mediatorId: user.uid,
          startDate: new Date()
        });

        // ✅ Update matching caseAssignments doc too
        const assignmentQuery = query(
          collection(db, 'caseAssignments'),
          where('caseId', '==', caseId),
          where('mediatorId', '==', user.uid)
        );
        const snapshot = await getDocs(assignmentQuery);
        snapshot.forEach(docSnap => {
          updateDoc(doc(db, 'caseAssignments', docSnap.id), {
            status: 'accepted'
          });
        });

        // Update local state
        setCaseRequests(prev => prev.filter(req => req.id !== caseId));
        const acceptedCase = caseRequests.find(req => req.id === caseId);
        if (acceptedCase) {
          setActiveCases(prev => [
            ...prev,
            {
              ...acceptedCase,
              status: 'accepted',
              assignedMediator: mediatorData.name,
              mediatorId: user.uid
            }
          ]);
        }
      } catch (err) {
        console.error("Error accepting case:", err);
      }
    };



    const handleRejectCase = async (caseId) => {
      try {
        const caseRef = doc(db, 'cases', caseId);
        await updateDoc(caseRef, { status: 'rejected' });

        setCaseRequests(prev => prev.filter(req => req.id !== caseId));
      } catch (err) {
        console.error("Error rejecting case:", err);
      }
    };

    const handleSaveProfile = async () => {
      try {
        await updateDoc(doc(db, 'mediators', user.uid), editProfile);
        setProfile(editProfile);
        setIsEditingProfile(false);
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile. Try again.");
      }
    };

    const handleCancelEdit = () => {
      setEditProfile(profile);
      setIsEditingProfile(false);
    };

    const renderCaseRequests = () => (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-black">Case Requests</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {caseRequests.filter(req => req.status === 'pending').map(request => (
            <div key={request.id} className={`bg-white border-l-4 border border-gray-200 rounded-lg p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-black mb-2">{request.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{request.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{request.category}</span>
                    <span>Client: {request.clientName}</span>
                    <span>Submitted: {request.submittedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleAcceptCase(request.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept Case
                </button>
                <button
                  onClick={() => handleRejectCase(request.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedCase(request);
                    setShowCaseDetails(true);
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {caseRequests.filter(req => req.status === 'pending').length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No pending requests</h3>
            <p className="text-gray-600">New case requests will appear here</p>
          </div>
        )}
      </div>
    );

    const renderProfile = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-black">My Profile</h3>
          {!isEditingProfile && (
            <button
              onClick={() => {
                setEditProfile(profile);  // <- This is important
                setIsEditingProfile(true);
              }}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center text-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white border rounded-lg p-6">
          {isEditingProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Name</label>
                  <input
                    type="text"
                    value={editProfile.name}
                    onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Specialty</label>
                  <input
                    type="text"
                    value={editProfile.specialty}
                    onChange={(e) => setEditProfile({...editProfile, specialty: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={editProfile.experience}
                    onChange={(e) => setEditProfile({...editProfile, experience: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={editProfile.hourlyRate}
                    onChange={(e) => setEditProfile({...editProfile, hourlyRate: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Location</label>
                  <input
                    type="text"
                    value={editProfile.location}
                    onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="text"
                    value={editProfile.phone}
                    onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-black mb-2">{profile.name}</h4>
                  <p className="text-lg text-gray-600 mb-2">{profile.specialty}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {profile.experience} years experience
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      ₹{profile.hourlyRate}/hour
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-black mb-3">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {profile.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {profile.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-black mb-3">Languages</h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map(lang => (
                      <span key={lang} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-black mb-3">About</h5>
                <p className="text-gray-600">{profile.bio}</p>
              </div>

              <div>
                <h5 className="font-semibold text-black mb-3">Education & Certifications</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{profile.education}</p>
                  {profile.certifications.map(cert => (
                    <p key={cert}>• {cert}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    const renderActiveCases = () => (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-black">Active Cases</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {activeCases.map(caseItem => (
            <div key={caseItem.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-black">{caseItem.title}</h4>
                  <p className="text-gray-600">Client: {caseItem.clientName}</p>
                  <p className="text-sm text-gray-500">Started: {caseItem.startDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Next meeting:</p>
                  <p className="font-medium text-black">{caseItem.nextMeeting}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{caseItem.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${caseItem.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedCase(caseItem);
                    setShowCaseDetails(true);
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  View Details
                </button>

                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message Client
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Meeting
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeCases.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No active cases</h3>
            <p className="text-gray-600">Accepted cases will appear here</p>
          </div>
        )}
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              Mediator Dashboard
            </h1>
              
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="bg-black p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-black">{stats.totalCases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Cases</p>
                  <p className="text-2xl font-bold text-black">{stats.activeCases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-black">{stats.completedCases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="bg-yellow-600 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-black">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg border mb-8">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'requests'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  Case Requests
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'active'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  Active Cases
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  My Profile
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'requests' && renderCaseRequests()}
              {activeTab === 'active' && renderActiveCases()}
              {activeTab === 'profile' && renderProfile()}
            </div>
          </div>
        </div>
        {showCaseDetails && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Case Details</h2>
              <button
                onClick={() => {
                  setSelectedCase(null);
                  setShowCaseDetails(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <CaseDetail
                caseData={selectedCase}
                viewAsMediator={true}
                onBack={() => {
                  setSelectedCase(null);
                  setShowCaseDetails(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      </div>
    );
  };

  export default MediatorDashboard;