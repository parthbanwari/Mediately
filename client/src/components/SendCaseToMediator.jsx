  import React, { useState,useEffect } from 'react';
  import { ArrowLeft, Send, User, FileText, Clock, AlertCircle, MessageSquare, Calendar, Star, MapPin, Phone, Mail } from 'lucide-react';
  import { useNavigate,useLocation } from 'react-router-dom';
  import { collection,query,where,getDocs,addDoc,doc,updateDoc } from 'firebase/firestore';
  import { db,auth } from '../firebase/firebase';


  const SendCaseToMediator = () => {
    const [message, setMessage] = useState('');
    const [preferredMeetingType, setPreferredMeetingType] = useState('video');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { caseData, mediator } = location.state || {};
    const [availableCases, setAvailableCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const selectedCase = caseData || availableCases.find(c => c.id === selectedCaseId);


    const formatDate = (date) => {
      if (!date) return '';
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
      }
      if (typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      }
      return '';
    };



    useEffect(() => {
      if (!selectedCase && mediator) {
        const fetchCases = async () => {
          try {
            const userId = auth.currentUser?.uid;
            const q = query(collection(db, 'cases'), where('clientId', '==', userId));
            const snapshot = await getDocs(q);
            const caseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAvailableCases(caseList);
          } catch (err) {
            console.error("Error fetching cases", err);
          }
        };

        fetchCases();
      } else if (!mediator) {
        navigate('/client-dashboard');
      }
    }, []);
    if (!selectedCase) {
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Loading case data or please select a case...
        </div>
      );
    }

    const handleSend = async () => {
      if (!message.trim()) {
        alert('Please write a message to the mediator');
        return;
      }
      if (!selectedCase || !mediator) {
        alert('Missing case or mediator information.');
        return;
      }


      setIsSubmitting(true);

      try {
        const sendData = {
          caseId: selectedCase.id,
          mediatorId: mediator?.id,
          clientId: auth.currentUser.uid,
          message: message.trim(),
          preferredMeetingType,
          status: 'pending',
          sentAt: new Date()
        };

        await addDoc(collection(db, 'caseAssignments'), sendData); // ✅ Save it to Firestore
        const caseRef = doc(db, 'cases', selectedCase.id);
        await updateDoc(caseRef, {
          mediatorId: mediator.id,
          sentToMediator: true,
          status: 'pending' // or 'pending' if that’s what your flow prefers
        });

        navigate('/chat', {
          state: {
            caseId: selectedCase.id,
            clientId: auth.currentUser.uid,
            mediatorId: mediator.id
          }
        });


      } catch (err) {
        console.error('Failed to send case:', err);
        alert('Something went wrong. Please try again.');

      } finally {
        setIsSubmitting(false);
      }
    };


    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Dashboard
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-l font-bold text-black">Send Case to Mediator</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🧠 Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-black">Case Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-black text-lg">{selectedCase?.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedCase?.category}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{selectedCase?.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Created: {formatDate(selectedCase?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Message to Mediator */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-black">Message to Mediator</h3>
                <span className="text-red-500">*</span>
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-black resize-none"
                placeholder="Write a detailed message to the mediator about your case. Include any specific concerns, questions, or requirements you have..."
              />
              <p className="text-sm text-gray-500 mt-2">
                This message will help the mediator understand your case better and provide more targeted assistance.
              </p>
            </div>
            {/* Case Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Case Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Case ID:</span>
                  <span className="font-medium text-black">#{selectedCase?.id?.slice(0, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-black">{selectedCase?.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-black">{formatDate(selectedCase?.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-black capitalize">{selectedCase?.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📦 Sidebar */}
          <div className="space-y-6">
            {/* Selected Mediator */}
            {mediator ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-black">Selected Mediator</h3>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-black">{mediator.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{mediator.specialty}</p>
                  
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{mediator.rating}</span>
                    <span className="text-sm text-gray-500">({mediator.reviews} reviews)</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {mediator.location}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      {mediator.experience} years experience
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium text-black">₹{mediator.hourlyRate}/hour</div>
                      <div className="text-gray-600">Consultation: ₹{mediator.consultationFee}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-black mb-2">No Mediator Selected</h3>
                  <p className="text-sm text-gray-600">Choose a mediator from the directory first</p>
                </div>
              </div>
            )}

            {/* Send Case */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Send Case</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Mediator will review your case</li>
                    <li>• You'll get a response within 24 hours</li>
                    <li>• If accepted, you can schedule a consultation</li>
                  </ul>
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSubmitting || !message.trim() || (!caseData && !selectedCaseId)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting || !message.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Case to Mediator
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

    );
    };

  export default SendCaseToMediator;