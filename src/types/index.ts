// Data Types for EstheticApp (Frontend)

export type SkinPhototype = 1 | 2 | 3 | 4 | 5 | 6; // Fitzpatrick Scale

export type AppointmentStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export type PaymentMethod = 'cash' | 'transfer' | 'card';

export type ProductCategory = 'cream' | 'gel' | 'supplement' | 'cabin_use' | 'other';

export interface Anamnesis {
  allergies: string;
  medicalHistory: string; // Background conditions, surgeries, medicines
  skinPhototype: SkinPhototype;
  consentSigned: boolean;
  consentDate?: string;
  contraindications: string[]; // e.g. Pregnancy, pacemaker
}

export interface Client {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  registrationDate: string;
  active: boolean;
  notes?: string;
  anamnesis?: Anamnesis;
  // Map of treatment type ID to available session credits (for session packs)
  sessionBalance: Record<string, number>;
}

export interface SessionParam {
  laserShots?: number;        // Disparos de láser
  powerJoules?: number;       // Joules de potencia
  vacuumLevel?: number;       // Niveles de vacío en vacuum
  peptoneVolumeCc?: number;   // Volumen de peptonas (cc)
  zonesTreated: string[];     // Zonas tratadas
}

export interface EvolutionaryRecord {
  id: string;
  clientId: string;
  appointmentId?: string;
  date: string;
  professionalId: string;
  treatmentTypeId: string;
  parameters: SessionParam;
  notes: string;
  beforePhotos: string[];     // URLs or base64 data for comparison
  afterPhotos: string[];      // URLs or base64 data for comparison
}

export interface TreatmentType {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  requiresMachineId?: string; // Links to Cabinet/Machine constraint
}

export interface CabinetMachine {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
  role: 'admin' | 'specialist';
  pin: string; // 4-digit PIN for fast terminal access
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  treatmentTypeId: string;
  cabinetId?: string;         // Machine/Cabinet booked
  dateTime: string;           // ISO format "2026-08-06T10:00:00"
  durationMin: number;
  status: AppointmentStatus;
  notes?: string;
  createdByProfessionalId?: string;
  updatedByProfessionalId?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: ProductCategory;
}

export interface PackOfSessions {
  id: string;
  name: string;
  treatmentTypeId: string;
  sessionCount: number;
  price: number;
}

export interface SaleItem {
  id: string;                 // product or package or single treatment ID
  name: string;
  type: 'product' | 'treatment' | 'pack';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  date: string;
  clientId?: string;          // Optional (anonymous sales)
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  professionalId: string;     // Professional who closed the sale (commissions)
}

export interface CashTransaction {
  id: string;
  time: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  saleId?: string;
}

export interface CashRegisterSession {
  id: string;
  openingTime: string;
  closingTime?: string;
  openedBy: string;
  closedBy?: string;
  openingAmount: number;
  closingAmountExpected?: number;
  closingAmountReal?: number;
  transactions: CashTransaction[];
  status: 'open' | 'closed';
}
