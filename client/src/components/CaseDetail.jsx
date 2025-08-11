import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Edit3, Calendar, User, Tag, AlertCircle, Clock, FileText, MessageSquare } from 'lucide-react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';


const CaseDetail = ({ caseData, onBack, onSave, onSendToMediator, viewAsMediator }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({ ...caseData });
  const [clientInfo, setClientInfo] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchClientInfo = async () => {
      if (viewAsMediator && editableData.clientId) {
        try {
          const db = getFirestore();
          const clientRef = doc(db, 'accounts', editableData.clientId); // or 'users' if that's where you store client info
          const clientSnap = await getDoc(clientRef);

          if (clientSnap.exists()) {
            setClientInfo(clientSnap.data());
          }
        } catch (error) {
          console.error('Failed to fetch client info:', error);
        }
      }
    };

    fetchClientInfo();
  }, [editableData.clientId, viewAsMediator]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const db = getFirestore();

    try {
      await updateDoc(doc(db, 'cases', editableData.id), editableData);
      onSave(editableData);  // This will update state in ClientDashboard
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  };

  const handleSendMessage = () => {
    const caseId = editableData.id || editableData.caseId || "missing_case_id";

    const currentUserObject = {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName || "User"
    }

    navigate(`/chat/${caseId}`, {
      state: {
        caseData: editableData,
        user: currentUserObject,  
        mediator: editableData.assignedMediator || null, // replace this with full mediator object if available
      },
    });
  };


  const handleCancel = () => {
    setEditableData({ ...caseData });
    setIsEditing(false);
  };

  const handleSendToMediator = async () => {
    try {
      const db = getFirestore();
      const caseRef = doc(db, 'cases', caseData.id);

      await updateDoc(caseRef, {
        sentToMediator: true,
        status: 'under_review'
      });

      // Reflect changes in local state too
      const updated = {
        ...editableData,
        sentToMediator: true,
        status: 'under_review'
      };
      setEditableData(updated);
      onSave(updated); // Notify parent
      setIsEditing(false);
    } catch (error) {
      console.error("Error sending to mediator:", error);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-black">
              {isEditing ? (
                <input
                  name="title"
                  value={editableData.title}
                  onChange={handleChange}
                  className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-black outline-none"
                />
              ) : (
                editableData.title
              )}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(editableData.status)}`}>
              {editableData.status.charAt(0).toUpperCase() + editableData.status.slice(1)}
            </span>
          </div>

          {!viewAsMediator && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Case
            </button>
          )}
        </div>

        {/* Case Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Category</span>
            </div>
            {isEditing ? (
              <select
                name="category"
                value={editableData.category}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="Family Law">Family Law</option>
                <option value="Business Law">Business Law</option>
                <option value="Employment Law">Employment Law</option>
                <option value="Contract Disputes">Contract Disputes</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Personal Injury">Personal Injury</option>
              </select>
            ) : (
              <p className="font-semibold text-black">{editableData.category}</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Created</span>
            </div>
            <p className="font-semibold text-black">
              {editableData.createdAt?.toDate ? editableData.createdAt.toDate().toLocaleDateString() : editableData.createdAt}
            </p>

          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3 Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-black">Case Description</h3>
            </div>
            {isEditing ? (
              <textarea
                name="description"
                value={editableData.description}
                onChange={handleChange}
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-black resize-none"
                placeholder="Provide detailed information about your case..."
              />
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {editableData.description}
                </p>
              </div>
            )}
          </div>


          {/* Timeline (only for clients) */}
            {!viewAsMediator && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-black">Case Timeline</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-black">Case Created</p>
                      <p className="text-sm text-gray-600">
                        {editableData.createdAt?.toDate
                          ? editableData.createdAt.toDate().toLocaleDateString()
                          : editableData.createdAt}
                      </p>
                    </div>
                  </div>
                  {editableData.sentToMediator && (
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-black">Sent to Mediator</p>
                        <p className="text-sm text-gray-600">Awaiting mediator response</p>
                      </div>
                    </div>
                  )}
                  {editableData.assignedMediator && (
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-black">Mediator Assigned</p>
                        <p className="text-sm text-gray-600">Assigned to {editableData.assignedMediator}</p>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          )}
          {/* Case Statistics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Case Info</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Case ID:</span>
                  <span className="font-medium text-black">#{editableData.id.slice(0, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-black">{editableData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-black">{editableData.category}</span>
                </div>
              </div>
            </div>
        </div>


        {/* Sidebar */} 
        < div className="space-y-6">
            {/* Assigned Person Box */}
            {viewAsMediator && clientInfo ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-black">Assigned Client</h3>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-black">{clientInfo?.name || clientInfo?.Name || "Client"}</h4>
                  <p className="text-sm text-gray-600 mb-4">Client</p>
                  <div className="space-y-2">
                    <button
                      onClick={handleSendMessage}
                      className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Send Message
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Meeting
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              editableData.assignedMediator && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-black">Assigned Mediator</h3>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-black">{editableData.assignedMediator}</h4>
                    <p className="text-sm text-gray-600 mb-4">Legal Mediator</p>
                    <div className="space-y-2">
                      <button
                        onClick={handleSendMessage}
                        className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send Message
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule Meeting
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}


            {/* Case Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Case Actions</h3>

              <div className="space-y-3">
                {!viewAsMediator && !editableData.sentToMediator && (editableData.status === 'pending' || editableData.status === 'submitted') && (
                  <button
                    onClick={() =>
                      navigate('/send-case', {
                        state: { caseData: editableData }
                      })
                    }
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send to Mediator
                  </button>
                )}


                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Download Case Summary
                </button>

                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Add Documents
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-black transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          {isEditing && !viewAsMediator && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

export default CaseDetail;