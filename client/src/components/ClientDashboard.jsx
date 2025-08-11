  import React, { useState, useEffect } from 'react';
  import { Plus, FileText, Clock, CheckCircle, AlertCircle, Calendar, MessageSquare, Send, Eye, X } from 'lucide-react';
  import CaseSubmission from './CaseSubmission';
  import CaseDetail from './CaseDetail';
  import { getFirestore,query,collection,onSnapshot,where,doc,updateDoc } from 'firebase/firestore';
  import { toast } from 'react-toastify';
  import { useNavigate } from 'react-router-dom';

  const ClientDashboard = ({ user  }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedCase, setSelectedCase] = useState(null);
    const [cases, setCases] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      const db = getFirestore();
      const q = query(collection(db, 'cases'), where('clientId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const caseList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCases(caseList);
      });

      return () => unsubscribe();
    }, [user.uid]);

    const handleCaseSubmitted = () => {
        setActiveView('dashboard'); // Just navigate back
      };

      const handleSendToMediator = async (caseId) => {
        try {
          const db = getFirestore();
          const caseRef = doc(db, 'cases', caseId);

          await updateDoc(caseRef, {
            sentToMediator: true,
            status: 'under_review'
          });

          const caseToSend = cases.find(c => c.id === caseId);

          if (caseToSend) {
            setCases(prev =>
              prev.map(c =>
                c.id === caseId
                  ? { ...c, sentToMediator: true, status: 'under_review' }
                  : c
              )
            );

            // Navigate to the mediator directory and pass case data via state
            navigate('/mediators', {
              state: {
                from: 'send-case',
                caseData: caseToSend
              }
            });
          }
        } catch (error) {
          console.error('Error sending case to mediator:', error);
        }
      };

    const handleViewDetails = (caseItem) => {
      setSelectedCase(caseItem);
    };

    const handleCaseSave = (updatedCase) => {
      setCases(cases.map(caseItem => 
        caseItem.id === updatedCase.id ? updatedCase : caseItem
      ));
      setSelectedCase(null);
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'accepted':
          return 'bg-green-50 text-green-700 border-green-200';
        case 'pending':
          return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'under_review':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'completed':
          return 'bg-gray-50 text-gray-700 border-gray-200';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'active':
          return <CheckCircle className="h-4 w-4" />;
        case 'pending':
          return <AlertCircle className="h-4 w-4" />;
        case 'under_review':
          return <Clock className="h-4 w-4" />;
        case 'completed':
          return <CheckCircle className="h-4 w-4" />;
        default:
          return <Clock className="h-4 w-4" />;
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'under_review':
          return 'Under Review';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    };



    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Welcome back, {user.name}
                </h1>
                <p className="text-gray-600 mt-2">Manage your legal cases and track progress</p>
              </div>
              <button
                onClick={() => navigate('/submit-case')}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Case
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-black p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Cases</p>
                  <p className="text-2xl font-bold text-black">{cases.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-black">
                    {cases.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Under Review</p>
                  <p className="text-2xl font-bold text-black">
                    {cases.filter(c => c.status === 'under_review').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-black">
                    {cases.filter(c => c.status === 'active' || c.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cases Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-black">My Cases</h3>
              <p className="text-gray-600 mt-1">Track and manage your legal cases</p>
            </div>

            <div className="p-6">
              {cases.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {cases.map(caseItem => (
                    <div 
                      key={caseItem.id} 
                      className="relative border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-black">{caseItem.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)} flex items-center gap-1`}>
                              {getStatusIcon(caseItem.status)}
                              {getStatusText(caseItem.status)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{caseItem.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">{caseItem.category}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {/* FIXED TIMESTAMP HERE */}
                              {caseItem.createdAt?.seconds
                                ? new Date(caseItem.createdAt.seconds * 1000).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {caseItem.status === 'accepted' && caseItem.assignedMediator && (
                            <div className="absolute top-4 right-4 text-right">
                              <p className="text-sm text-gray-600 font-medium">Mediator:</p>
                              <p className="text-black font-semibold">{caseItem.assignedMediator}</p>
                            </div>
                          )}

                          {caseItem.status === 'under_review' && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                              Sent to Mediator
                            </span>
                          )}

                          {caseItem.status === 'rejected' && (
                            <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                              Rejected by Mediator
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleViewDetails(caseItem)}
                          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        
                        {(caseItem.status === 'under_review' ||caseItem.status === 'submitted' || caseItem.status === 'rejected') && (
                          <button 
                            onClick={() => handleSendToMediator(caseItem.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Send to Mediator
                          </button>
                        )}
                        
                        {(caseItem.status === 'accepted' || caseItem.status === 'active') && caseItem.assignedMediator && (
                          <>
                            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Message Mediator
                            </button>
                            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Schedule Meeting
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No cases yet</h3>
                  <p className="text-gray-600 mb-6">Submit your first case to get started with legal mediation</p>
                  <button
                    onClick={() => navigate('/submit-case')}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Submit Your First Case
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Case Detail Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-black">Case Details</h2>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <CaseDetail
                  caseData={selectedCase}
                  onBack={() => setSelectedCase(null)}
                  onSave={handleCaseSave}
                  onSendToMediator={handleSendToMediator}
                  viewAsMediator={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default ClientDashboard;