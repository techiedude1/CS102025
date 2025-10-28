export enum DrugForm {
  Tablet = 'Tablet',
  Injection = 'Injection',
  Liquid = 'Liquid',
  Patch = 'Patch',
}

export enum HospitalUnit {
  U1NS = '1NS',
  U2NS = '2NS',
  U2EW = '2EW',
  U3EW = '3EW',
  U4EW = '4EW',
}

export enum StockSource {
  WHOLESALER = 'Wholesaler',
  UNIT = 'Unit',
}

export enum DrugSchedule {
    CII = 'II',
    CIII = 'III',
    CIV = 'IV',
    CV = 'V'
}

export interface Drug {
  id: number;
  brandName: string;
  genericName: string;
  schedule: DrugSchedule;
  strength: string;
  form: DrugForm;
  stock: number;
}

export enum TransactionType {
  ADD = 'ADD',
  DISTRIBUTE = 'DISTRIBUTE',
}

export interface Transaction {
  id: string;
  drug: Omit<Drug, 'stock' | 'id' | 'schedule'>;
  type: TransactionType;
  quantity: number;
  unit?: HospitalUnit;
  source?: StockSource;
  invoiceNumber?: string;
  timestamp: Date;
}

export type ModalAction = TransactionType.ADD | TransactionType.DISTRIBUTE;