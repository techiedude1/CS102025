import { Drug, DrugForm, HospitalUnit, StockSource, DrugSchedule } from './types';

export const INITIAL_DRUGS: Drug[] = [
  { id: 1, brandName: 'Duramorph', genericName: 'Morphine Sulfate', strength: '10mg', form: DrugForm.Injection, stock: 0, schedule: DrugSchedule.CII },
  { id: 2, brandName: 'Sublimaze', genericName: 'Fentanyl Citrate', strength: '50mcg/mL', form: DrugForm.Injection, stock: 0, schedule: DrugSchedule.CII },
  { id: 3, brandName: 'Roxicodone', genericName: 'Oxycodone HCl', strength: '5mg', form: DrugForm.Tablet, stock: 0, schedule: DrugSchedule.CII },
  { id: 4, brandName: 'Dilaudid', genericName: 'Hydromorphone HCl', strength: '2mg', form: DrugForm.Tablet, stock: 0, schedule: DrugSchedule.CII },
  { id: 5, brandName: 'Valium', genericName: 'Diazepam', strength: '5mg/mL', form: DrugForm.Injection, stock: 0, schedule: DrugSchedule.CIV },
  { id: 6, brandName: 'Ativan', genericName: 'Lorazepam', strength: '1mg', form: DrugForm.Tablet, stock: 0, schedule: DrugSchedule.CIV },
  { id: 7, brandName: 'Duragesic', genericName: 'Fentanyl Patch', strength: '25mcg/hr', form: DrugForm.Patch, stock: 0, schedule: DrugSchedule.CII },
];

export const HOSPITAL_UNITS: HospitalUnit[] = [
  HospitalUnit.U1NS,
  HospitalUnit.U2NS,
  HospitalUnit.U2EW,
  HospitalUnit.U3EW,
  HospitalUnit.U4EW,
];

export const STOCK_SOURCES: StockSource[] = [
  StockSource.WHOLESALER,
  StockSource.UNIT,
];

export const DRUG_SCHEDULES: DrugSchedule[] = [
    DrugSchedule.CII,
    DrugSchedule.CIII,
    DrugSchedule.CIV,
    DrugSchedule.CV,
];

export const LOW_STOCK_THRESHOLD = 50;