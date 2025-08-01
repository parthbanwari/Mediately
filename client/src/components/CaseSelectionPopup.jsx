import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { X } from 'lucide-react';

const CaseSelectionPopup = ({ onClose, onSelect }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const userId = auth.currentUser?.uid;
        const q = query(collection(db, 'cases'), where('clientId', '==', userId));
        const snapshot = await getDocs(q);
        const caseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCases(caseList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative p-6 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Select a Case</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No cases found. Please create a case first from your dashboard.
          </div>
        ) : (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {cases.map((c) => (
              <li
                key={c.id}
                onClick={() => onSelect(c)} 
                className="p-4 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 cursor-pointer transition"
              >
                <h4 className="text-lg font-medium text-black">{c.title}</h4>
                <div className="text-sm text-gray-500 mt-1">{c.category}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Status: <span className="capitalize">{c.status || 'Pending'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Cancel Button */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseSelectionPopup;
