import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Drug, Transaction, HospitalUnit, TransactionType, ModalAction, StockSource, DrugSchedule } from './types';
import { INITIAL_DRUGS } from './constants';
import { InventoryItem } from './components/InventoryItem';
import { ActionModal } from './components/ActionModal';
import { TransactionLog } from './components/TransactionLog';
import { PharmacyIcon, PillIcon } from './components/Icons';
import { DrugFormModal } from './components/DrugFormModal';

type SortByType = 'brandName' | 'genericName';
type ScheduleFilterType = 'all' | 'CII' | 'C345';

const mapScheduleStringToEnum = (scheduleStr: string | undefined): DrugSchedule | null => {
  if (!scheduleStr) return null;
  const cleanStr = scheduleStr.trim().toUpperCase();
  switch (cleanStr) {
    case 'II': return DrugSchedule.CII;
    case 'III': return DrugSchedule.CIII;
    case 'IV': return DrugSchedule.CIV;
    case 'V': return DrugSchedule.CV;
    default: return null;
  }
};

const formatGenericName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function App() {
  const [drugs, setDrugs] = useState<Drug[]>(() =>
    INITIAL_DRUGS.map(drug => ({
        ...drug,
        brandName: drug.brandName.toUpperCase(),
        genericName: formatGenericName(drug.genericName)
    }))
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDrugFormModalOpen, setIsDrugFormModalOpen] = useState(false);

  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);

  // Transaction Log Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrugFilters, setSelectedDrugFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'ADD' | 'DISTRIBUTE'>('all');
  const [hospitalUnitFilter, setHospitalUnitFilter] = useState<'all' | HospitalUnit>('all');
  
  // Inventory Filter States
  const [sortBy, setSortBy] = useState<SortByType>('brandName');
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilterType>('all');

  const handleOpenActionModal = (drug: Drug, action: ModalAction) => {
    setSelectedDrug(drug);
    setModalAction(action);
    setIsActionModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedDrug(null);
    setModalAction(null);
  };
  
  const handleAddDrug = async (newDrugData: Omit<Drug, 'id' | 'stock' | 'schedule'>) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `For the drug "${newDrugData.brandName} (${newDrugData.genericName})", provide its US DEA schedule, the formatted brand name, and the formatted generic name.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.STRING,
                description: 'The US DEA controlled substance schedule as a Roman numeral (II, III, IV, or V). If not controlled, respond with "N/A".'
              },
              formattedBrandName: {
                type: Type.STRING,
                description: 'The brand name, formatted in ALL CAPS.'
              },
              formattedGenericName: {
                type: Type.STRING,
                description: 'The generic name, formatted with proper medical capitalization.'
              }
            },
            required: ['schedule', 'formattedBrandName', 'formattedGenericName']
          }
        }
      });

      const result = JSON.parse(response.text);
      const schedule = mapScheduleStringToEnum(result.schedule);

      if (!schedule) {
        alert(`Could not automatically classify the drug schedule. Gemini responded: "${result.schedule}". Please check the drug name and try again.`);
        throw new Error("Classification failed");
      }

      const newDrug: Drug = {
        ...newDrugData,
        id: Date.now(),
        stock: 0,
        brandName: result.formattedBrandName,
        genericName: result.formattedGenericName,
        schedule,
      };
      setDrugs(prev => [...prev, newDrug]);
    } catch (error) {
      console.error("Error classifying and formatting drug:", error);
      alert("An error occurred while trying to classify and format the drug. Please check the console and try again.");
      throw error; // Re-throw to be caught by the modal's submission handler
    }
  };

  const handleDeleteDrug = (drugId: number) => {
    setDrugs(prev => prev.filter(drug => drug.id !== drugId));
    // Optional: Also remove related transactions if desired
    // setTransactions(prev => prev.filter(t => t.drug.genericName !== drugs.find(d=>d.id === drugId)?.genericName));
  };


  const handleTransactionSubmit = (drugId: number, quantity: number, unit?: HospitalUnit, source?: StockSource, invoiceNumber?: string) => {
    const drugIndex = drugs.findIndex(d => d.id === drugId);
    if (drugIndex === -1) return;

    const updatedDrugs = [...drugs];
    const drug = updatedDrugs[drugIndex];
    const actionType = unit ? TransactionType.DISTRIBUTE : TransactionType.ADD;

    const newStock = actionType === TransactionType.ADD ? drug.stock + quantity : drug.stock - quantity;
    updatedDrugs[drugIndex] = { ...drug, stock: newStock };

    const newTransaction: Transaction = {
      id: new Date().toISOString() + Math.random(),
      drug: { brandName: drug.brandName, genericName: drug.genericName, strength: drug.strength, form: drug.form },
      type: actionType,
      quantity,
      unit,
      source,
      invoiceNumber,
      timestamp: new Date()
    };
    
    setDrugs(updatedDrugs);
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const filteredTransactions = useMemo(() => {
    let results = transactions;

    // Drug filter
    if (selectedDrugFilters.length > 0) {
      results = results.filter(t => selectedDrugFilters.includes(t.drug.genericName));
    }
    
    // Date range filter
    if (dateRange.start) {
        results = results.filter(t => t.timestamp.toISOString().split('T')[0] >= dateRange.start);
    }
    if (dateRange.end) {
        results = results.filter(t => t.timestamp.toISOString().split('T')[0] <= dateRange.end);
    }

    // Transaction type filter
    if (transactionTypeFilter !== 'all') {
      results = results.filter(t => t.type === transactionTypeFilter);
    }

    // Hospital unit filter
    if (hospitalUnitFilter !== 'all') {
      results = results.filter(t => t.unit === hospitalUnitFilter);
    }

    // Search term filter
    const query = searchTerm.toLowerCase();
    if (query) {
      results = results.filter(t =>
        t.drug.brandName.toLowerCase().includes(query) ||
        t.drug.genericName.toLowerCase().includes(query) ||
        t.drug.strength.toLowerCase().includes(query) ||
        (t.source && t.source.toLowerCase().includes(query)) ||
        (t.unit && t.unit.toLowerCase().includes(query)) ||
        (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(query))
      );
    }

    return results;
  }, [transactions, selectedDrugFilters, dateRange, transactionTypeFilter, hospitalUnitFilter, searchTerm]);

  const displayedDrugs = useMemo(() => {
    return [...drugs]
      .filter(drug => {
        if (scheduleFilter === 'all') return true;
        if (scheduleFilter === 'CII') return drug.schedule === DrugSchedule.CII;
        if (scheduleFilter === 'C345') return [DrugSchedule.CIII, DrugSchedule.CIV, DrugSchedule.CV].includes(drug.schedule);
        return true;
      })
      .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [drugs, sortBy, scheduleFilter]);

  return (
    <>
      <div className="min-h-screen text-slate-800">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-3">
            <PharmacyIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Controlled Substance Inventory</h1>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inventory Section */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Pharmacy Stock</h2>
                 <button
                    onClick={() => setIsDrugFormModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PillIcon className="w-5 h-5 mr-2 -ml-1" />
                    Add New Drug
                  </button>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortByType)}
                    className="text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="brandName">Brand Name</option>
                    <option value="genericName">Generic Name</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-600">Filter Schedule:</span>
                  <div className="flex rounded-md shadow-sm">
                     <button onClick={() => setScheduleFilter('all')} className={`px-3 py-1 text-sm rounded-l-md border ${scheduleFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>All</button>
                     <button onClick={() => setScheduleFilter('CII')} className={`px-3 py-1 text-sm border-t border-b ${scheduleFilter === 'CII' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>II</button>
                     <button onClick={() => setScheduleFilter('C345')} className={`px-3 py-1 text-sm rounded-r-md border ${scheduleFilter === 'C345' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>III, IV, V</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedDrugs.map(drug => (
                  <InventoryItem key={drug.id} drug={drug} onAction={handleOpenActionModal} onDelete={handleDeleteDrug} />
                ))}
              </div>
            </div>

            {/* Transaction Log Section */}
            <div className="lg:col-span-1 h-[calc(100vh-12rem)]">
                <TransactionLog
                  transactions={filteredTransactions}
                  allDrugs={drugs}
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  selectedDrugFilters={selectedDrugFilters}
                  onDrugFilterChange={setSelectedDrugFilters}
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  transactionTypeFilter={transactionTypeFilter}
                  onTransactionTypeFilterChange={setTransactionTypeFilter}
                  hospitalUnitFilter={hospitalUnitFilter}
                  onHospitalUnitFilterChange={setHospitalUnitFilter}
                  totalTransactions={transactions.length}
                />
            </div>
          </div>
        </main>
      </div>

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        drug={selectedDrug}
        action={modalAction}
        onSubmit={handleTransactionSubmit}
      />
      
      <DrugFormModal
        isOpen={isDrugFormModalOpen}
        onClose={() => setIsDrugFormModalOpen(false)}
        onSubmit={handleAddDrug}
      />
    </>
  );
}

export default App;
