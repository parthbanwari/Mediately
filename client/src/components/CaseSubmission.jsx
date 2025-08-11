import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Calendar } from 'lucide-react';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CaseSubmission = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    preferredMeetingTypes: [],
    documents: []
  });
  const navigate = useNavigate();


  const categories = [
    'Family Law',
    'Business Disputes',
    'Contract Issues',
    'Employment Problems',
    'Real Estate',
    'Personal Injury',
    'Intellectual Property',
    'Consumer Rights',
    'Landlord-Tenant',
    'Insurance Claims',
    'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const toggleMeetingType = (type) => {
    setFormData(prev => {
      const current = prev.preferredMeetingTypes;
      return {
        ...prev,
        preferredMeetingTypes: current.includes(type)
          ? current.filter(t => t !== type)
          : [...current, type]
      };
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const db = getFirestore();
      const caseRef = collection(db, 'cases');

      const newCase = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        meetingTypes: formData.preferredMeetingTypes,
        documents: formData.documents.map(doc => doc.name), // just metadata
        status: 'submitted',
        createdAt: Timestamp.now(),
        clientId: user.uid,
      };

      await addDoc(caseRef, newCase);

      alert('Case submitted successfully! We will match you with a qualified mediator shortly.');
      navigate('/client-dashboard')
    } catch (err) {
      console.error('Error submitting case:', err);
      alert('Something went wrong while submitting the case.');
    }
  };


  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      documents: [...formData.documents, ...files]
    });
  };

  const removeDocument = (index) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      documents: newDocuments
    });
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/client-dashboard')}
            className="flex items-center text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">
            Submit New Case
          </h1>
          <p className="text-gray-600">Tell us about your legal issue and we'll match you with the right mediator</p>
        </div>

        <div className="bg-white border rounded-lg">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Case Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
                Case Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Brief description of your legal issue"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-black mb-2">
                Legal Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                placeholder="Please provide detailed information about your legal issue, including what happened, when it occurred, and what outcome you're seeking..."
              />
              <p className="text-sm text-gray-500 mt-1">
                The more details you provide, the better we can match you with the right mediator.
              </p>
            </div>

            {/* Preferred Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Preferred Meeting Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'video', label: 'Video Call', description: 'Online meeting' },
                  { value: 'phone', label: 'Phone Call', description: 'Voice only' },
                  { value: 'in-person', label: 'In Person', description: 'Face to face' }
                ].map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="checkbox"
                      name="preferredMeetingTypes"
                      value={option.value}
                      checked={formData.preferredMeetingTypes.includes(option.value)}
                      onChange={() => toggleMeetingType(option.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border rounded-lg text-center transition-all ${
                      formData.preferredMeetingTypes.includes(option.value)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <Calendar className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Supporting Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Upload contracts, emails, photos, or other relevant documents
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-black hover:underline font-medium">
                      Choose files
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-sm text-gray-500">
                    PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>

              {/* Uploaded Files */}
              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-black">Uploaded files:</p>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="submit"
                className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Submit Case
              </button>
              <button
                type="button"
                onClick={() => navigate('/client-dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaseSubmission;