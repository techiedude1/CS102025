import React from 'react';
import { Drug, TransactionType } from '../types';
import { LOW_STOCK_THRESHOLD } from '../constants';
import { PlusIcon, MinusIcon, TrashIcon } from './Icons';

interface InventoryItemProps {
  drug: Drug;
  onAction: (drug: Drug, action: TransactionType) => void;
  onDelete: (drugId: number) => void;
}

const getStockColor = (stock: number) => {
  if (stock < LOW_STOCK_THRESHOLD) return 'bg-red-100 text-red-800 border-red-500';
  if (stock < LOW_STOCK_THRESHOLD * 2) return 'bg-yellow-100 text-yellow-800 border-yellow-500';
  return 'bg-green-100 text-green-800 border-green-500';
};

export const InventoryItem: React.FC<InventoryItemProps> = ({ drug, onAction, onDelete }) => {
  const stockColorClasses = getStockColor(drug.stock);

  const handleDelete = () => {
    const password = window.prompt(`To delete ${drug.brandName} (${drug.genericName}), please enter the password:`);
    if (password === null) {
      // User clicked cancel
      return;
    }
    if (password === 'askrph') {
      onDelete(drug.id);
    } else {
      window.alert('Incorrect password. Deletion cancelled.');
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-shadow hover:shadow-lg">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-slate-800">{drug.brandName}</h3>
           <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                C-{drug.schedule}
            </span>
            <button
                onClick={handleDelete}
                className="text-slate-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full p-1"
                aria-label={`Delete ${drug.brandName}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-600">{drug.genericName}</p>
        <p className="text-sm text-slate-500">{drug.strength} &middot; {drug.form}</p>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-slate-500">In Stock</p>
          <p className={`text-3xl font-bold ${stockColorClasses.split(' ')[1]}`}>{drug.stock}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onAction(drug, TransactionType.ADD)}
            className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
            aria-label={`Add stock for ${drug.brandName}`}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => onAction(drug, TransactionType.DISTRIBUTE)}
            className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            aria-label={`Distribute ${drug.brandName}`}
          >
            <MinusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};