import React, { useState } from 'react';
import { Drug, DrugForm, DrugSchedule } from '../types';
import { CloseIcon, PillIcon } from './Icons';

interface DrugFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newDrug: Omit<Drug, 'id' | 'stock' | 'schedule'>) => Promise<void>;
}

const ALL_DRUG_FORMS = Object.values(DrugForm);

export const DrugFormModal: React.FC<DrugFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState<DrugForm>(ALL_DRUG_FORMS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setBrandName('');
    setGenericName('');
    setStrength('');
    setForm(ALL_DRUG_FORMS[0]);
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !genericName.trim() || !strength.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        brandName,
        genericName,
        strength,
        form,
      });
      handleClose();
    } catch (error) {
        // Error is alerted in App.tsx, so we just stop the loading state here.
        console.error("Submission failed", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <PillIcon className="w-6 h-6 mr-2 text-blue-600"/>
              Add New Drug
            </h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-6 h-6"/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-slate-700">Brand Name</label>
              <input
                type="text"
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Dilaudid"
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="genericName" className="block text-sm font-medium text-slate-700">Generic Name</label>
              <input
                type="text"
                id="genericName"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Hydromorphone HCl"
              />
            </div>

            <div>
              <label htmlFor="strength" className="block text-sm font-medium text-slate-700">Strength</label>
              <input
                type="text"
                id="strength"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., 2mg"
              />
            </div>

            <div>
              <label htmlFor="form" className="block text-sm font-medium text-slate-700">Form</label>
              <select
                id="form"
                value={form}
                onChange={(e) => setForm(e.target.value as DrugForm)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {ALL_DRUG_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Classifying & Adding...' : 'Add Drug'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};