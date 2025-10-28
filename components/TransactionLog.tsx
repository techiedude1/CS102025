import React from 'react';
import { Drug, Transaction, TransactionType } from '../types';
import { ArrowUpIcon, ArrowDownIcon, SearchIcon } from './Icons';

interface TransactionLogProps {
  transactions: Transaction[];
  allDrugs: Drug[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedDrugFilter: string;
  onDrugFilterChange: (drugName: string) => void;
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
    selectedDrugFilter,
    onDrugFilterChange,
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
                        <label htmlFor="drug-filter" className="sr-only">Filter by Drug</label>
                        <select
                            id="drug-filter"
                            value={selectedDrugFilter}
                            onChange={(e) => onDrugFilterChange(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">Filter by All Drugs</option>
                            {allDrugs.map(drug => (
                                <option key={drug.id} value={drug.genericName}>{drug.brandName} ({drug.genericName})</option>
                            ))}
                        </select>
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
                    {/* FIX: Use Object.keys to iterate over grouped transactions to avoid type inference issues with Object.entries where the value type could be inferred as 'unknown'. */}
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