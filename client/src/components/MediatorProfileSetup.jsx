import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, MapPin, IndianRupeeIcon, Clock, Award, BookOpen, Globe, Phone, Mail, Video, MessageSquare, Calendar } from 'lucide-react';
import { db } from '../firebase/firebase';
import { doc,setDoc,updateDoc } from 'firebase/firestore';

const MediatorProfileSetup = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Basic Information
    specialty: '',
    experience: '',
    location: '',
    bio: '',
    
    // Contact & Rates
    phone: '',
    hourlyRate: '',
    consultationFee: '',
    
    // Professional Background
    education: [''],
    certifications: [''],
    specializations: [''],
    languages: ['English'],
    
    // Meeting Preferences
    acceptsVideoMeetings: true,
    acceptsPhoneMeetings: true,
    acceptsInPersonMeetings: false,
    
    // Availability
    availability: {
      monday: { available: true, hours: '9:00 AM - 5:00 PM' },
      tuesday: { available: true, hours: '9:00 AM - 5:00 PM' },
      wednesday: { available: true, hours: '9:00 AM - 5:00 PM' },
      thursday: { available: true, hours: '9:00 AM - 5:00 PM' },
      friday: { available: true, hours: '9:00 AM - 5:00 PM' },
      saturday: { available: false, hours: '' },
      sunday: { available: false, hours: '' }
    }
  });

  const specialties = [
    'Family Law',
    'Business Law',
    'Employment Law',
    'Contract Disputes',
    'Real Estate',
    'Personal Injury',
    'Intellectual Property',
    'Consumer Rights',
    'Criminal Law',
    'Immigration Law'
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setProfileData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user || !user.uid) {
      console.error("User not defined or UID missing");
      return;
    }

    const mediatorRef = doc(db, 'mediators', user.uid);
    const accountRef = doc(db, 'accounts', user.uid);  // 👈 add this

    try {
      // Save mediator profile
      await setDoc(mediatorRef, {
        ...profileData,
        profileCompleted: true,
        uid: user.uid,
        name: user.name || '',
        email: user.email || '',
        type: 'mediator',
      });

      // ✅ Update 'profileCompleted' in accounts collection
      await updateDoc(accountRef, {
        profileCompleted: true,
      });

      console.log('Profile saved and profileCompleted updated.');
      onComplete(profileData);  // ⬅️ move to mediator dashboard
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };



  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Basic Information</h2>
        <p className="text-gray-600">Tell us about your professional background</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">Primary Specialty *</label>
          <select
            value={profileData.specialty}
            onChange={(e) => handleInputChange('specialty', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
            required
          >
            <option value="">Select your main area of expertise</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">Years of Experience *</label>
          <input
            type="number"
            value={profileData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
            placeholder="e.g., 8"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">Location *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
              placeholder="City, State"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">Professional Bio *</label>
          <textarea
            rows={4}
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black resize-none"
            placeholder="Describe your experience, approach, and what makes you unique as a mediator..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">This will be shown to potential clients</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Contact & Rates</h2>
        <p className="text-gray-600">Set your contact information and pricing</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Hourly Rate (₹) *</label>
            <div className="relative">
              <IndianRupeeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={profileData.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                placeholder="250"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Consultation Fee (₹) *</label>
            <div className="relative">
              <IndianRupeeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={profileData.consultationFee}
                onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                placeholder="150"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-3">Meeting Preferences *</label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profileData.acceptsVideoMeetings}
                onChange={(e) => handleInputChange('acceptsVideoMeetings', e.target.checked)}
                className="mr-3"
              />
              <Video className="h-5 w-5 mr-2" />
              <span>Accept video meetings</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profileData.acceptsPhoneMeetings}
                onChange={(e) => handleInputChange('acceptsPhoneMeetings', e.target.checked)}
                className="mr-3"
              />
              <Phone className="h-5 w-5 mr-2" />
              <span>Accept phone meetings</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profileData.acceptsInPersonMeetings}
                onChange={(e) => handleInputChange('acceptsInPersonMeetings', e.target.checked)}
                className="mr-3"
              />
              <Calendar className="h-5 w-5 mr-2" />
              <span>Accept in-person meetings</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Professional Background</h2>
        <p className="text-gray-600">Add your credentials and expertise</p>
      </div>

      <div className="space-y-6">
        {/* Education */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-black">Education *</label>
            <button
              type="button"
              onClick={() => addArrayItem('education')}
              className="text-black hover:underline text-sm"
            >
              + Add Education
            </button>
          </div>
          <div className="space-y-2">
            {profileData.education.map((edu, index) => (
              <div key={index} className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={edu}
                  onChange={(e) => handleArrayChange('education', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., JD from Harvard Law School (2015)"
                />
                {profileData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('education', index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-black">Certifications</label>
            <button
              type="button"
              onClick={() => addArrayItem('certifications')}
              className="text-black hover:underline text-sm"
            >
              + Add Certification
            </button>
          </div>
          <div className="space-y-2">
            {profileData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => handleArrayChange('certifications', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Certified Mediator - American Arbitration Association"
                />
                {profileData.certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('certifications', index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-black">Areas of Specialization</label>
            <button
              type="button"
              onClick={() => addArrayItem('specializations')}
              className="text-black hover:underline text-sm"
            >
              + Add Specialization
            </button>
          </div>
          <div className="space-y-2">
            {profileData.specializations.map((spec, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => handleArrayChange('specializations', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Divorce Mediation"
                />
                {profileData.specializations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('specializations', index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Languages Spoken</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={profileData.languages.join(', ')}
              onChange={(e) => handleInputChange('languages', e.target.value.split(', ').filter(lang => lang.trim()))}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
              placeholder="English, Spanish, French..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Review Your Profile</h2>
        <p className="text-gray-600">Make sure everything looks good before completing setup</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        {/* Basic Info Preview */}
        <div>
          <h4 className="font-semibold text-black mb-3">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Specialty:</span>
              <span className="ml-2 font-medium">{profileData.specialty}</span>
            </div>
            <div>
              <span className="text-gray-600">Experience:</span>
              <span className="ml-2 font-medium">{profileData.experience} years</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 font-medium">{profileData.location}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{profileData.phone}</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-gray-600">Bio:</span>
            <p className="mt-1 text-sm">{profileData.bio}</p>
          </div>
        </div>

        {/* Rates Preview */}
        <div>
          <h4 className="font-semibold text-black mb-3">Rates & Meetings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Hourly Rate:</span>
              <span className="ml-2 font-medium">₹{profileData.hourlyRate}</span>
            </div>
            <div>
              <span className="text-gray-600">Consultation Fee:</span>
              <span className="ml-2 font-medium">₹{profileData.consultationFee}</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-gray-600">Meeting Types:</span>
            <div className="flex space-x-2 mt-1">
              {profileData.acceptsVideoMeetings && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Video</span>
              )}
              {profileData.acceptsPhoneMeetings && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Phone</span>
              )}
              {profileData.acceptsInPersonMeetings && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">In-Person</span>
              )}
            </div>
          </div>
        </div>

        {/* Credentials Preview */}
        <div>
          <h4 className="font-semibold text-black mb-3">Professional Background</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Education:</span>
              <ul className="mt-1 space-y-1">
                {profileData.education.filter(edu => edu.trim()).map((edu, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {edu}
                  </li>
                ))}
              </ul>
            </div>
            
            {profileData.certifications.filter(cert => cert.trim()).length > 0 && (
              <div>
                <span className="text-gray-600">Certifications:</span>
                <ul className="mt-1 space-y-1">
                  {profileData.certifications.filter(cert => cert.trim()).map((cert, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profileData.specializations.filter(spec => spec.trim()).length > 0 && (
              <div>
                <span className="text-gray-600">Specializations:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profileData.specializations.filter(spec => spec.trim()).map((spec, index) => (
                    <span key={index} className="bg-black text-white px-2 py-1 rounded text-xs">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-gray-600">Languages:</span>
              <span className="ml-2">{profileData.languages.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profileData.specialty && profileData.experience && profileData.location && profileData.bio;
      case 2:
        return profileData.phone && profileData.hourlyRate && profileData.consultationFee;
      case 3:
        return profileData.education.some(edu => edu.trim());
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-black">Complete Your Profile</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border rounded-lg p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                  isStepValid()
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                Complete Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediatorProfileSetup;