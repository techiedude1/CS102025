import React from 'react';
import { Drug, Transaction, TransactionType, HospitalUnit } from '../types';
import { ArrowUpIcon, ArrowDownIcon, SearchIcon } from './Icons';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { HOSPITAL_UNITS } from '../constants';

interface TransactionLogProps {
  transactions: Transaction[];
  allDrugs: Drug[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;

  selectedDrugFilters: string[];
  onDrugFilterChange: (selected: string[]) => void;
  
  dateRange: { start: string; end: string; };
  onDateRangeChange: (field: 'start' | 'end', value: string) => void;
  
  transactionTypeFilter: 'all' | 'ADD' | 'DISTRIBUTE';
  onTransactionTypeFilterChange: (type: 'all' | 'ADD' | 'DISTRIBUTE') => void;
  
  hospitalUnitFilter: 'all' | HospitalUnit;
  onHospitalUnitFilterChange: (unit: 'all' | HospitalUnit) => void;

  totalTransactions: number;
}


const TransactionEntry: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isAdd = transaction.type === TransactionType.ADD;
    const iconContainerClass = isAdd ? 'bg-green-100' : 'bg-blue-100';
    const iconClass = isAdd ? 'text-green-600' : 'text-blue-600';
    const quantityClass = isAdd ? 'text-green-600' : 'text-red-600';
    const quantityPrefix = isAdd ? '+' : '-';
    
    const transactionDetail = () => {
        if (isAdd) {
            let detail = `Stock added from ${transaction.source}`;
            if (transaction.invoiceNumber && transaction.invoiceNumber.trim()) {
                detail += ` (Invoice: ${transaction.invoiceNumber.trim()})`;
            }
            return detail;
        }
        return `Distributed to ${transaction.unit}`;
    };

    return (
        <li className="flex items-start space-x-4 py-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconContainerClass}`}>
                {isAdd ? <ArrowUpIcon className={`w-5 h-5 ${iconClass}`} /> : <ArrowDownIcon className={`w-5 h-5 ${iconClass}`} />}
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{transaction.drug.brandName} <span className="text-slate-500 font-normal">({transaction.drug.genericName})</span></p>
                    <p className={`text-sm font-bold ${quantityClass}`}>{quantityPrefix}{transaction.quantity}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500 mt-1">
                    <p>{transactionDetail()}</p>
                    <p>{transaction.timestamp.toLocaleTimeString()}</p>
                </div>
            </div>
        </li>
    );
};


export const TransactionLog: React.FC<TransactionLogProps> = ({
    transactions,
    allDrugs,
    searchTerm,
    onSearchTermChange,
    selectedDrugFilters,
    onDrugFilterChange,
    dateRange,
    onDateRangeChange,
    transactionTypeFilter,
    onTransactionTypeFilterChange,
    hospitalUnitFilter,
    onHospitalUnitFilterChange,
    totalTransactions
}) => {
    const groupedTransactions = transactions.reduce((acc, t) => {
        const dateKey = t.timestamp.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(t);
        return acc;
    }, {} as Record<string, Transaction[]>);

    const drugOptions = allDrugs.map(drug => ({
        value: drug.genericName,
        label: `${drug.brandName} (${drug.genericName})`
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
            <div className="border-b border-slate-200 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Transaction Log</h2>
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            aria-label="Search transactions"
                        />
                    </div>

                    <div>
                      <label htmlFor="drug-filter" className="block text-sm font-medium text-slate-700 mb-1">Filter by Drug(s)</label>
                      <MultiSelectDropdown
                        options={drugOptions}
                        selected={selectedDrugFilters}
                        onChange={onDrugFilterChange}
                        placeholder="Filter by All Drugs"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                id="start-date"
                                value={dateRange.start}
                                onChange={(e) => onDateRangeChange('start', e.target.value)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input
                                type="date"
                                id="end-date"
                                value={dateRange.end}
                                onChange={(e) => onDateRangeChange('end', e.target.value)}
                                min={dateRange.start}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                            <div className="flex rounded-md shadow-sm">
                                <button onClick={() => onTransactionTypeFilterChange('all')} className={`px-3 py-2 text-sm rounded-l-md border w-full ${transactionTypeFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>All</button>
                                <button onClick={() => onTransactionTypeFilterChange(TransactionType.ADD)} className={`px-3 py-2 text-sm border-t border-b w-full ${transactionTypeFilter === TransactionType.ADD ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>Add</button>
                                <button onClick={() => onTransactionTypeFilterChange(TransactionType.DISTRIBUTE)} className={`px-3 py-2 text-sm rounded-r-md border w-full ${transactionTypeFilter === TransactionType.DISTRIBUTE ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>Distribute</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="unit-filter" className="block text-sm font-medium text-slate-700 mb-1">Hospital Unit</label>
                            <select
                                id="unit-filter"
                                value={hospitalUnitFilter}
                                onChange={(e) => onHospitalUnitFilterChange(e.target.value as 'all' | HospitalUnit)}
                                disabled={transactionTypeFilter === TransactionType.ADD}
                                className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                            >
                                <option value="all">All Units</option>
                                {HOSPITAL_UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            {transactions.length === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-slate-500">
                      {totalTransactions === 0 ? 'No transactions yet.' : 'No matching transactions found.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-y-auto flex-grow -mr-6 pr-6">
                    {Object.keys(groupedTransactions).map(date => {
                        const dailyTransactions = groupedTransactions[date];
                        return (
                            <div key={date}>
                                <h3 className="text-sm font-semibold text-slate-500 bg-slate-100 my-2 p-2 rounded -ml-6 pl-6 sticky top-0">{date}</h3>
                                <ul className="divide-y divide-slate-200">
                                    {dailyTransactions.map(transaction => (
                                        <TransactionEntry key={transaction.id} transaction={transaction} />
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
