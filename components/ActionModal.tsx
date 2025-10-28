

import React, { useState, useEffect } from 'react';
import { Drug, HospitalUnit, ModalAction, StockSource, TransactionType } from '../types';
import { HOSPITAL_UNITS, STOCK_SOURCES } from '../constants';
import { CloseIcon } from './Icons';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  drug: Drug | null;
  action: ModalAction | null;
  onSubmit: (drugId: number, quantity: number, unit?: HospitalUnit, source?: StockSource, invoiceNumber?: string) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, drug, action, onSubmit }) => {
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<HospitalUnit>(HOSPITAL_UNITS[0]);
  const [source, setSource] = useState<StockSource>(STOCK_SOURCES[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setError('');
      setUnit(HOSPITAL_UNITS[0]);
      setSource(STOCK_SOURCES[0]);
      setInvoiceNumber('');
    }
  }, [isOpen]);
  
  if (!isOpen || !drug || !action) {
    return null;
  }

  const isDistribute = action === TransactionType.DISTRIBUTE;
  const title = isDistribute ? 'Distribute Medication' : 'Add Stock';
  const buttonLabel = isDistribute ? 'Distribute' : 'Add to Stock';
  const buttonClass = isDistribute ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numQuantity = parseInt(quantity, 10);

    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    if (isDistribute && numQuantity > drug.stock) {
      setError(`Cannot distribute more than the available stock of ${drug.stock}.`);
      return;
    }
    
    onSubmit(drug.id, numQuantity, isDistribute ? unit : undefined, !isDistribute ? source : undefined, !isDistribute ? invoiceNumber : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-6 h-6"/>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-md mb-6 border border-slate-200">
            {/* FIX: Property 'name' does not exist on type 'Drug'. Changed to 'brandName'. */}
            <p className="font-semibold text-slate-700">{drug.brandName}</p>
            <p className="text-sm text-slate-500">{drug.strength} - {drug.form}</p>
            <p className="text-sm text-slate-500 mt-2">Current Stock: <span className="font-bold">{drug.stock}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter quantity"
                min="1"
                autoFocus
              />
            </div>

            {!isDistribute && (
              <>
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-slate-700">Source</label>
                  <select
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value as StockSource)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {STOCK_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="invoice" className="block text-sm font-medium text-slate-700">Invoice # (Optional)</label>
                  <input
                    type="text"
                    id="invoice"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., INV-12345"
                  />
                </div>
              </>
            )}

            {isDistribute && (
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-slate-700">Distribute To</label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as HospitalUnit)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {HOSPITAL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            )}
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white ${buttonClass} border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {buttonLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};