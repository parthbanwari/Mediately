import React, { useState, useEffect} from 'react';
import { Search, Filter, Star, MapPin, Clock, Video, Calendar, MessageSquare } from 'lucide-react';
import { collection,query,where,getDocs, doc, getDoc} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate,useLocation } from 'react-router-dom';
import CaseSelectionPopup from './CaseSelectionPopup';

const MediatorDirectory = ({ user, onScheduleMeeting }) => {
  const [mediators, setMediators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCasePopup, setShowCasePopup] = useState(false);
  const [selectedMediator, setSelectedMediator] = useState(null);
  const [userCases, setUserCases] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  
  const specialties = [
    'Family Law',
    'Business Law',
    'Contract Disputes',
    'Employment Law',
    'Real Estate',
    'Personal Injury',
    'Intellectual Property',
    'Consumer Rights'
  ];

  useEffect(() => {
    const fetchMediators = async () => {
      try {
        const q = query(
          collection(db, 'accounts'),
          where('role', '==', 'mediator'),
          where('profileCompleted', '==', true)
        );
        const snapshot = await getDocs(q);
        const mediatorList = [];

        for (const docSnap of snapshot.docs) {
          const accountData = docSnap.data();
          const profileDocRef = doc(db, 'mediators', docSnap.id);
          const profileDocSnap = await getDoc(profileDocRef);

          if (profileDocSnap.exists()) {
            const profileData = profileDocSnap.data();
            mediatorList.push({
              id: docSnap.id,
              ...accountData,
              ...profileData
            });
          }
        }

        setMediators(mediatorList);
      } catch (error) {
        console.error('Error fetching mediators:', error);
      } finally {
        setLoading(false); // <- Important!
      }
    };

    fetchMediators();
  }, []);


  useEffect(() => {
    const fetchCases = async () => {
      try {
        const userId = user?.uid;
        if (!userId) return;

        // Get all cases for the user
        const caseQuery = query(collection(db, 'cases'), where('clientId', '==', userId));
        const caseSnapshot = await getDocs(caseQuery);

        const allCases = caseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filteredCases = [];

        for (const caseItem of allCases) {
          const assignmentQuery = query(
            collection(db, 'caseAssignments'),
            where('caseId', '==', caseItem.id),
            where('status', '==', 'accepted')
          );

          const assignmentSnap = await getDocs(assignmentQuery);

          if (assignmentSnap.empty) {
            filteredCases.push(caseItem);
          }
        }

        setUserCases(filteredCases);
      } catch (err) {
        console.error("Failed to fetch user cases:", err);
      }
    };

    fetchCases();
  }, [user?.uid]);



  // Combine default mediators with user-created profiles
  const allMediators = mediators;

  const filteredMediators = allMediators.filter(mediator => {
    const matchesSearch = mediator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mediator.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || mediator.specialty === selectedSpecialty;
    const matchesLocation = !selectedLocation || mediator.location.includes(selectedLocation);
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-lg font-medium">Loading mediator directory</span>
        </div>
        <p className="text-sm text-gray-500">Please wait while we load the page</p>
      </div>
    );
  }
  


  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Find a Mediator
          </h1>
          <p className="text-xl text-gray-600">Connect with qualified mediators for your legal needs</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search mediators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
            </div>
            
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Location..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors"
            />
            
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-black">{filteredMediators.length}</span> mediator{filteredMediators.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Mediator Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMediators.map(mediator => (
            <div key={mediator.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-white">
                    {mediator.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-black">{mediator.name}</h3>
                      <p className="text-gray-600">{mediator.specialty}</p>
                    </div>
                    {mediator.availableToday && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Available Today
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium text-black">{mediator.rating}</span>
                      <span className="ml-1">({mediator.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{mediator.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{mediator.experience} years</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4">
                    {mediator.bio}
                  </p>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="grid grid-cols-2 text-center text-sm border border-gray-200 rounded-lg overflow-hidden">
                      {/*<div>
                        <div className="font-semibold text-black">{mediator.successfulCases}</div>
                        <div className="text-gray-600">Cases Won</div>
                      </div>*/}
                      <div className="bg-gray-50 p-3">
                        <div className="font-semibold text-black">₹{mediator.hourlyRate}</div>
                        <div className="text-gray-600">Per Hour</div>
                      </div>
                      <div className="bg-gray-50 p-3 border-l border-gray-200">
                        <div className="font-semibold text-black">₹{mediator.consultationFee}</div>
                        <div className="text-gray-600">Consultation</div>
                      </div>
                      {/*<div>
                        <div className="font-semibold text-black">{mediator.rating}</div>
                        <div className="text-gray-600">Rating</div>
                      </div>*/}
                    </div>
                  </div>

                  {/* Meeting Types */}
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      {mediator.acceptsVideoMeetings && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Video</span>
                      )}
                      {mediator.acceptsPhoneMeetings && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Phone</span>
                      )}
                      {mediator.acceptsInPersonMeetings && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">In-Person</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (location.state?.caseData) {
                          // If caseData was passed, proceed directly
                          navigate('/send-case', {
                            state: {
                              mediator,
                              caseData: location.state.caseData
                            }
                          });
                        } else {
                          // Else open popup for case selection
                          setSelectedMediator(mediator);
                          setShowCasePopup(true);
                        }
                      }}
                      className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Send Case
                    </button>


                    <button
                      onClick={() => {
                        alert('Consultation feature coming soon!');
                      }}
                      className="flex-1 border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Consultation
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMediators.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">No mediators found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
        
        {showCasePopup && (
          <CaseSelectionPopup
            cases={userCases}
            onClose={() => {
              setShowCasePopup(false);
              setSelectedMediator(null);
            }}
            onSelect={(selectedCase) => {
              setShowCasePopup(false);
              navigate('/send-case', {
                state: {
                  caseData: selectedCase,
                  mediator: selectedMediator
                }
              });
            }}
          />
        )}

      </div>
    </div>
  );
};

export default MediatorDirectory;