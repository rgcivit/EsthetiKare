import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Client, Appointment, EvolutionaryRecord, Product, 
  TreatmentType, CabinetMachine, Professional, PackOfSessions, 
  Sale, CashRegisterSession, AppointmentStatus, PaymentMethod,
  PurchasedPack, ServiceReport, PackStatus, MachineStatus, ServiceReportStatus
} from '../types';

interface StoreState {
  clients: Client[];
  appointments: Appointment[];
  evolutionaryRecords: EvolutionaryRecord[];
  products: Product[];
  treatmentTypes: TreatmentType[];
  cabinets: CabinetMachine[];
  professionals: Professional[];
  packs: PackOfSessions[];
  sales: Sale[];
  cashSessions: CashRegisterSession[];
  purchasedPacks: PurchasedPack[];
  serviceReports: ServiceReport[];

  // Authentication / Active Session
  currentUser: Professional | null;
  login: (pin: string) => { success: boolean; error?: string };
  logout: () => void;
  
  // Backup / Restore
  restoreState: (state: Partial<StoreState>) => void;
  
  // Clients CRUD
  addClient: (client: Omit<Client, 'id' | 'registrationDate' | 'sessionBalance'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  updateClientAnamnesis: (id: string, anamnesis: Client['anamnesis']) => void;

  // Purchased Packs CRUD
  addPurchasedPack: (pack: Omit<PurchasedPack, 'id'>) => void;
  updatePurchasedPack: (id: string, pack: Partial<PurchasedPack>) => void;
  deletePurchasedPack: (id: string) => void;
  consumeSession: (packId: string) => void;

  // Service Reports CRUD
  addServiceReport: (report: Omit<ServiceReport, 'id'>) => void;
  updateServiceReport: (id: string, report: Partial<ServiceReport>) => void;

  // Evolutionary records
  addEvolutionaryRecord: (record: Omit<EvolutionaryRecord, 'id'>) => void;
  updateEvolutionaryRecord: (id: string, record: Partial<EvolutionaryRecord>) => void;
  
  // Appointments CRUD with Overlap Detection
  addAppointment: (appointment: Omit<Appointment, 'id'>) => { success: boolean; error?: string };
  updateAppointment: (id: string, appointment: Partial<Appointment>) => { success: boolean; error?: string };
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  
  // Products CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustProductStock: (id: string, amount: number) => void;
  
  // Professionals CRUD
  addProfessional: (prof: Omit<Professional, 'id' | 'active'>) => void;
  updateProfessional: (id: string, prof: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
  
  // Sales & POS
  processSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  
  // Cash Register
  openCashRegister: (amount: number, openedBy: string) => void;
  closeCashRegister: (realAmount: number, closedBy: string) => void;
  addCashTransaction: (type: 'income' | 'expense', amount: number, description: string, paymentMethod: PaymentMethod) => void;
  
  // Utility checkers
  checkOverlap: (
    dateTimeStr: string, 
    durationMin: number, 
    professionalId: string, 
    cabinetId?: string, 
    excludeAppointmentId?: string
  ) => { overlap: boolean; reason?: string };
}

// Helper to calculate overlapping time intervals
const isOverlapping = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
  return start1 < end2 && start2 < end1;
};

// Initial MOCK DATA
const mockProfessionals: Professional[] = [
  { id: 'prof-1', name: 'Dra. Sofía Valenzuela', specialty: 'Dermatología Estética', active: true, role: 'specialist', pin: '1111' },
  { id: 'prof-2', name: 'Lic. Camila Ortega', specialty: 'Cosmiatría y Láser', active: true, role: 'admin', pin: '9999' },
  { id: 'prof-3', name: 'Enf. Marcos Delgado', specialty: 'Inyectología y Corporal', active: true, role: 'specialist', pin: '2222' },
];

const mockCabinets: CabinetMachine[] = [
  {
    id: 'cab-1',
    name: 'Gabinete 1 - Soprano Titanium',
    description: 'Depilación láser de última generación',
    active: true,
    modelo: 'Soprano Titanium Platinum',
    numeroSerie: 'SN-SOP-2024-001',
    horasUso: 450,
    ultimoServiceFecha: '2026-05-10',
    proximoServiceSugerido: '2026-11-10',
    estado: 'optimo' as MachineStatus
  },
  {
    id: 'cab-2',
    name: 'Gabinete 2 - Vacuum & Facial Premium',
    description: 'Tratamientos faciales, microdermoabrasión y vacuum',
    active: true,
    modelo: 'Body Health BHS 156',
    numeroSerie: 'SN-BHS-156-882',
    horasUso: 120,
    ultimoServiceFecha: '2026-06-15',
    proximoServiceSugerido: '2026-12-15',
    estado: 'optimo' as MachineStatus
  },
  {
    id: 'cab-3',
    name: 'Gabinete 3 - Consultorio Clínico',
    description: 'Inyectables y consultas generales',
    active: true,
    estado: 'optimo' as MachineStatus
  },
];

const mockTreatmentTypes: TreatmentType[] = [
  { id: 'treat-1', name: 'Depilación Soprano (Axilas)', description: 'Depilación definitiva láser Soprano Titanium', durationMin: 15, price: 3500, requiresMachineId: 'cab-1' },
  { id: 'treat-2', name: 'Depilación Soprano (Pierna Entera)', description: 'Depilación definitiva láser Soprano Titanium piernas completas', durationMin: 45, price: 8000, requiresMachineId: 'cab-1' },
  { id: 'treat-3', name: 'Limpieza Facial Profunda', description: 'Extracción, peeling ultrasónico e hidratación de alta gama', durationMin: 60, price: 5500, requiresMachineId: 'cab-2' },
  { id: 'treat-4', name: 'Tratamiento Vacuum Corporal', description: 'Modelado y reducción de celulitis mediante drenaje endermológico', durationMin: 40, price: 6500, requiresMachineId: 'cab-2' },
  { id: 'treat-5', name: 'Aplicación de Peptonas', description: 'Tratamiento regenerador muscular y de colágeno localizado', durationMin: 30, price: 12000, requiresMachineId: 'cab-3' },
];

const mockClients: Client[] = [
  {
    id: 'client-1',
    dni: '23456789A',
    firstName: 'Constanza',
    lastName: 'Gómez',
    phone: '+54 9 11 5543-9218',
    email: 'constanza.g@mail.com',
    birthDate: '1995-04-12',
    registrationDate: '2026-03-10',
    active: true,
    notes: 'Piel sensible, reporta molestia leve al calor alto.',
    anamnesis: {
      allergies: 'Ninguna conocida',
      medicalHistory: 'Hipotiroidismo controlado con levotiroxina.',
      skinPhototype: 2,
      consentSigned: true,
      consentDate: '2026-03-10',
      contraindications: []
    },
    sessionBalance: { 'treat-1': 3, 'treat-4': 0 } // Sold 3 sessions of laser
  },
  {
    id: 'client-2',
    dni: '34567890B',
    firstName: 'Valentina',
    lastName: 'Rojas',
    phone: '+54 9 11 3211-5498',
    email: 'valen_rojas@mail.com',
    birthDate: '1989-11-23',
    registrationDate: '2026-05-18',
    active: true,
    anamnesis: {
      allergies: 'Alergia al látex',
      medicalHistory: 'Sin antecedentes relevantes.',
      skinPhototype: 4,
      consentSigned: true,
      consentDate: '2026-05-18',
      contraindications: []
    },
    sessionBalance: { 'treat-3': 1 }
  },
  {
    id: 'client-3',
    dni: '45678901C',
    firstName: 'Juana',
    lastName: 'Martínez',
    phone: '+54 9 11 6789-1122',
    email: 'juana.martinez@gmail.com',
    birthDate: '2001-08-04',
    registrationDate: '2026-07-22',
    active: true,
    sessionBalance: {}
  }
];

const mockEvolutionaryRecords: EvolutionaryRecord[] = [
  {
    id: 'rec-1',
    clientId: 'client-1',
    appointmentId: 'appt-1',
    date: '2026-07-15',
    professionalId: 'prof-2',
    treatmentTypeId: 'treat-1',
    parameters: {
      laserShots: 120,
      powerJoules: 14,
      zonesTreated: ['Axila Derecha', 'Axila Izquierda']
    },
    notes: 'Sesión Nro 1 de Soprano. Excelente tolerancia al tratamiento. Nivel de molestia bajo.',
    beforePhotos: ['https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400'],
    afterPhotos: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400']
  },
  {
    id: 'rec-2',
    clientId: 'client-2',
    appointmentId: 'appt-2',
    date: '2026-07-20',
    professionalId: 'prof-2',
    treatmentTypeId: 'treat-3',
    parameters: {
      zonesTreated: ['Rostro completo']
    },
    notes: 'Limpieza profunda con microdermoabrasión. Piel con eritema leve post-extracción. Se aplica máscara descongestiva.',
    beforePhotos: ['https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400'],
    afterPhotos: ['https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400']
  }
];

// Seed appointments on August 6, 2026 (for proper visualization)
const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    clientId: 'client-1',
    professionalId: 'prof-2',
    treatmentTypeId: 'treat-1',
    cabinetId: 'cab-1',
    dateTime: '2026-08-06T09:00:00',
    durationMin: 15,
    status: 'completed',
    notes: 'Controlar potencia en axila izquierda.'
  },
  {
    id: 'appt-2',
    clientId: 'client-2',
    professionalId: 'prof-2',
    treatmentTypeId: 'treat-3',
    cabinetId: 'cab-2',
    dateTime: '2026-08-06T10:30:00',
    durationMin: 60,
    status: 'in-progress',
  },
  {
    id: 'appt-3',
    clientId: 'client-3',
    professionalId: 'prof-3',
    treatmentTypeId: 'treat-5',
    cabinetId: 'cab-3',
    dateTime: '2026-08-06T14:00:00',
    durationMin: 30,
    status: 'confirmed',
    notes: 'Primera sesión de peptonas en glúteos.'
  },
  {
    id: 'appt-4',
    clientId: 'client-1',
    professionalId: 'prof-1',
    treatmentTypeId: 'treat-2',
    cabinetId: 'cab-1',
    dateTime: '2026-08-06T15:30:00',
    durationMin: 45,
    status: 'pending'
  }
];

const mockProducts: Product[] = [
  { id: 'prod-1', code: 'PROD-AHA-45', name: 'Crema Hidratante con Ácido Hialurónico', description: 'Crema regeneradora facial profunda, ideal post peeling', price: 4500, cost: 2200, stock: 18, minStock: 5, category: 'cream' },
  { id: 'prod-2', code: 'PROD-GEL-NEU', name: 'Gel Conductor Neutro (Bidón 5L)', description: 'Gel neutro para aparatología y radiofrecuencia', price: 6500, cost: 3000, stock: 4, minStock: 2, category: 'cabin_use' },
  { id: 'prod-3', code: 'PROD-COL-HID', name: 'Suplemento Colágeno Hidrolizado', description: 'Suplemento dietario bebible sabor frutos del bosque', price: 8000, cost: 4200, stock: 12, minStock: 5, category: 'supplement' },
  { id: 'prod-4', code: 'PROD-GEL-CRIO', name: 'Gel Criógeno Modelador', description: 'Tratamiento corporal reductor efecto frío', price: 5200, cost: 2400, stock: 1, minStock: 3, category: 'gel' } // Low stock test
];

const mockPacks: PackOfSessions[] = [
  { id: 'pack-1', name: 'Pack Depilación Láser (Axilas) x6', treatmentTypeId: 'treat-1', sessionCount: 6, price: 18000 },
  { id: 'pack-2', name: 'Pack Tratamiento Vacuum Corporal x6', treatmentTypeId: 'treat-4', sessionCount: 6, price: 34000 }
];

const mockSales: Sale[] = [
  {
    id: 'sale-1',
    date: '2026-08-05T18:30:00',
    clientId: 'client-1',
    items: [
      { id: 'prod-1', name: 'Crema Hidratante con Ácido Hialurónico', type: 'product', quantity: 1, unitPrice: 4500, totalPrice: 4500 },
      { id: 'pack-1', name: 'Pack Depilación Láser (Axilas) x6', type: 'pack', quantity: 1, unitPrice: 18000, totalPrice: 18000 }
    ],
    total: 22500,
    paymentMethod: 'transfer',
    professionalId: 'prof-2'
  },
  {
    id: 'sale-2',
    date: '2026-08-06T10:00:00',
    clientId: 'client-2',
    items: [
      { id: 'prod-3', name: 'Suplemento Colágeno Hidrolizado', type: 'product', quantity: 2, unitPrice: 8000, totalPrice: 16000 }
    ],
    total: 16000,
    paymentMethod: 'cash',
    professionalId: 'prof-1'
  }
];

const mockCashSessions: CashRegisterSession[] = [
  {
    id: 'cash-session-1',
    openingTime: '2026-08-06T08:00:00',
    openedBy: 'Camila Ortega',
    openingAmount: 15000,
    status: 'open',
    transactions: [
      {
        id: 'trans-1',
        time: '2026-08-06T10:05:00',
        type: 'income',
        amount: 16000,
        description: 'Venta Prod. - Colágeno Hidrolizado x2 (María Rojas)',
        paymentMethod: 'cash',
        saleId: 'sale-2'
      },
      {
        id: 'trans-2',
        time: '2026-08-06T11:15:00',
        type: 'expense',
        amount: 3200,
        description: 'Compra insumos: Cafetería y servilletas de papel',
        paymentMethod: 'cash'
      }
    ]
  }
];

export const useStore = create<StoreState>()(persist((set, get) => ({
  clients: mockClients,
  appointments: mockAppointments,
  evolutionaryRecords: mockEvolutionaryRecords,
  products: mockProducts,
  treatmentTypes: mockTreatmentTypes,
  cabinets: mockCabinets,
  professionals: mockProfessionals,
  packs: mockPacks,
  sales: mockSales,
  cashSessions: mockCashSessions,
  purchasedPacks: [],
  serviceReports: [],

  // Authentication / Active Session
  currentUser: null,
  login: (pin) => {
    const matched = get().professionals.find((p) => p.active && p.pin === pin);
    if (matched) {
      set({ currentUser: matched });
      return { success: true };
    }
    return { success: false, error: 'Código de acceso PIN incorrecto o especialista suspendido.' };
  },
  logout: () => {
    set({ currentUser: null });
  },

  // Restore State Utility
  restoreState: (stateToRestore: Partial<StoreState>) => {
    set((state) => ({ ...state, ...stateToRestore }));
  },

  // Checking overlap for Scheduling Security
  checkOverlap: (dateTimeStr, durationMin, professionalId, cabinetId, excludeAppointmentId) => {
    const start2 = new Date(dateTimeStr);
    const end2 = new Date(start2.getTime() + durationMin * 60 * 1000);
    const appointments = get().appointments;

    for (const app of appointments) {
      if (app.id === excludeAppointmentId) continue;
      // Skip cancelled or no-show appointments
      if (app.status === 'cancelled' || app.status === 'no-show') continue;

      const start1 = new Date(app.dateTime);
      const end1 = new Date(start1.getTime() + app.durationMin * 60 * 1000);

      if (isOverlapping(start1, end1, start2, end2)) {
        // Professional overlap
        if (app.professionalId === professionalId) {
          const prof = get().professionals.find(p => p.id === professionalId);
          return { 
            overlap: true, 
            reason: `El profesional ${prof?.name || ''} ya tiene un turno reservado en ese horario (${app.dateTime.substring(11, 16)} - ${new Date(start1.getTime() + app.durationMin * 60 * 1000).toISOString().substring(11, 16)}).` 
          };
        }

        // Cabinet/Machine overlap
        if (cabinetId && app.cabinetId === cabinetId) {
          const cab = get().cabinets.find(c => c.id === cabinetId);
          return { 
            overlap: true, 
            reason: `La cabina/aparatología '${cab?.name || ''}' ya se encuentra ocupada en ese horario.` 
          };
        }
      }
    }

    return { overlap: false };
  },

  // Clients CRUD
  addClient: (clientData) => {
    const newId = `client-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      registrationDate: new Date().toISOString().split('T')[0],
      sessionBalance: {}
    };
    
    set((state) => ({
      clients: [...state.clients, newClient]
    }));
    return newClient;
  },

  updateClient: (id, updatedFields) => {
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    }));
  },

  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id)
    }));
  },

  updateClientAnamnesis: (id, anamnesis) => {
    set((state) => ({
      clients: state.clients.map((c) => 
        c.id === id ? { 
          ...c, 
          anamnesis: anamnesis ? { ...anamnesis, consentDate: anamnesis.consentSigned ? new Date().toISOString().split('T')[0] : undefined } : undefined 
        } : c
      )
    }));
  },

  // Purchased Packs CRUD
  addPurchasedPack: (pack) => {
    const newPack: PurchasedPack = { ...pack, id: `pack-purchased-${Date.now()}` };
    set((state) => ({
      purchasedPacks: [...state.purchasedPacks, newPack]
    }));
  },

  updatePurchasedPack: (id, updatedFields) => {
    set((state) => ({
      purchasedPacks: state.purchasedPacks.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    }));
  },

  deletePurchasedPack: (id) => {
    set((state) => ({
      purchasedPacks: state.purchasedPacks.filter((p) => p.id !== id)
    }));
  },

  consumeSession: (packId) => {
    set((state) => {
      const pack = state.purchasedPacks.find(p => p.id === packId);
      if (!pack || pack.sesionesConsumidas >= pack.totalSesiones) return {};

      const newConsumidas = pack.sesionesConsumidas + 1;
      const newEstado = (newConsumidas >= pack.totalSesiones ? 'completado' : 'activo') as PackStatus;

      const updatedPacks = state.purchasedPacks.map(p =>
        p.id === packId ? { ...p, sesionesConsumidas: newConsumidas, estado: newEstado } : p
      );

      // Also update client session balance for backward compatibility
      const updatedClients = state.clients.map(c => {
        if (c.id === pack.pacienteId) {
          const currentBalance = c.sessionBalance[pack.treatmentTypeId] || 0;
          return {
            ...c,
            sessionBalance: { ...c.sessionBalance, [pack.treatmentTypeId]: Math.max(0, currentBalance - 1) }
          };
        }
        return c;
      });

      return { purchasedPacks: updatedPacks, clients: updatedClients };
    });
  },

  // Service Reports CRUD
  addServiceReport: (report) => {
    const newReport: ServiceReport = { ...report, id: `report-${Date.now()}` };
    set((state) => ({
      serviceReports: [...state.serviceReports, newReport]
    }));
  },

  updateServiceReport: (id, updatedFields) => {
    set((state) => ({
      serviceReports: state.serviceReports.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    }));
  },

  // Evolutionary records (Before/After)
  addEvolutionaryRecord: (record) => {
    const newId = `rec-${Date.now()}`;
    set((state) => ({
      evolutionaryRecords: [...state.evolutionaryRecords, { ...record, id: newId }]
    }));
  },

  updateEvolutionaryRecord: (id, updatedRecord) => {
    set((state) => ({
      evolutionaryRecords: state.evolutionaryRecords.map((r) => r.id === id ? { ...r, ...updatedRecord } : r)
    }));
  },

  // Appointments CRUD with scheduling rules
  addAppointment: (apptData) => {
    const check = get().checkOverlap(apptData.dateTime, apptData.durationMin, apptData.professionalId, apptData.cabinetId);
    if (check.overlap) {
      return { success: false, error: check.reason };
    }

    const newAppt: Appointment = {
      ...apptData,
      id: `appt-${Date.now()}`,
      createdByProfessionalId: get().currentUser?.id
    };

    set((state) => ({
      appointments: [...state.appointments, newAppt]
    }));
    return { success: true };
  },

  updateAppointment: (id, apptData) => {
    const current = get().appointments.find(a => a.id === id);
    if (!current) return { success: false, error: "Turno no encontrado." };

    const dateTime = apptData.dateTime || current.dateTime;
    const durationMin = apptData.durationMin || current.durationMin;
    const professionalId = apptData.professionalId || current.professionalId;
    const cabinetId = apptData.cabinetId !== undefined ? apptData.cabinetId : current.cabinetId;

    const check = get().checkOverlap(dateTime, durationMin, professionalId, cabinetId, id);
    if (check.overlap) {
      return { success: false, error: check.reason };
    }

    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...apptData, updatedByProfessionalId: get().currentUser?.id } : a))
    }));

    return { success: true };
  },

  deleteAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id)
    }));
  },

  updateAppointmentStatus: (id, status) => {
    set((state) => {
      const appointments = state.appointments.map((a) => (a.id === id ? { ...a, status } : a));
      
      // Auto session deduction logic on completion
      if (status === 'completed') {
        const appt = state.appointments.find((a) => a.id === id);
        if (appt && appt.clientId) {
          const client = state.clients.find((c) => c.id === appt.clientId);
          if (client) {
            const currentBalance = client.sessionBalance[appt.treatmentTypeId] || 0;
            if (currentBalance > 0) {
              // Decrement credits
              return {
                appointments,
                clients: state.clients.map((c) => 
                  c.id === client.id 
                    ? { 
                        ...c, 
                        sessionBalance: { 
                          ...c.sessionBalance, 
                          [appt.treatmentTypeId]: currentBalance - 1 
                        } 
                      } 
                    : c
                )
              };
            }
          }
        }
      }

      return { appointments };
    });
  },

  // Products
  addProduct: (p) => {
    set((state) => ({
      products: [...state.products, { ...p, id: `prod-${Date.now()}` }]
    }));
  },

  updateProduct: (id, updatedFields) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id)
    }));
  },

  adjustProductStock: (id, amount) => {
    set((state) => ({
      products: state.products.map((p) => 
        p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p
      )
    }));
  },

  // Professionals CRUD
  addProfessional: (prof) => {
    const newProf = {
      ...prof,
      id: `prof-${Date.now()}`,
      active: true
    };
    set((state) => ({
      professionals: [...state.professionals, newProf]
    }));
  },

  updateProfessional: (id, updatedFields) => {
    set((state) => {
      const professionals = state.professionals.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      const currentUser = state.currentUser && state.currentUser.id === id
        ? { ...state.currentUser, ...updatedFields }
        : state.currentUser;
      return { professionals, currentUser };
    });
  },

  deleteProfessional: (id) => {
    set((state) => ({
      professionals: state.professionals.filter((p) => p.id !== id)
    }));
  },

  // Sales Processor
  processSale: (saleData) => {
    const saleId = `sale-${Date.now()}`;
    const newSale: Sale = {
      ...saleData,
      id: saleId,
      date: new Date().toISOString()
    };

    set((state) => {
      // 1. Discount stock of sold items if they are products
      const updatedProducts = state.products.map((p) => {
        const saleItem = saleData.items.find((item) => item.id === p.id && item.type === 'product');
        if (saleItem) {
          return { ...p, stock: Math.max(0, p.stock - saleItem.quantity) };
        }
        return p;
      });

      // 2. Increment session balance and create PurchasedPack if they purchased session packs
      const newPurchasedPacks: PurchasedPack[] = [];
      const updatedClients = state.clients.map((c) => {
        if (c.id === saleData.clientId) {
          const updatedBalance = { ...c.sessionBalance };
          
          saleData.items.forEach((item) => {
            if (item.type === 'pack') {
              const packTemplate = state.packs.find((p) => p.id === item.id);
              if (packTemplate) {
                const current = updatedBalance[packTemplate.treatmentTypeId] || 0;
                updatedBalance[packTemplate.treatmentTypeId] = current + (packTemplate.sessionCount * item.quantity);

                // Create technical PurchasedPack records
                for (let i = 0; i < item.quantity; i++) {
                  newPurchasedPacks.push({
                    id: `pack-purchased-${Date.now()}-${i}`,
                    pacienteId: c.id,
                    treatmentTypeId: packTemplate.treatmentTypeId,
                    nombreTratamiento: packTemplate.name,
                    totalSesiones: packTemplate.sessionCount,
                    sesionesConsumidas: 0,
                    estado: 'activo' as PackStatus,
                    fechaCompra: new Date().toISOString(),
                    // Sugerimos equipo si el tipo de tratamiento lo requiere
                    equipoId: packTemplate.treatmentTypeId.includes('laser') ? 'cab-1' : undefined
                  });
                }
              }
            }
          });

          return { ...c, sessionBalance: updatedBalance };
        }
        return c;
      });

      // 3. Add transaction to Cash Register if a cash register session is open
      const activeRegister = state.cashSessions.find((s) => s.status === 'open');
      const updatedCashSessions = state.cashSessions.map((session) => {
        if (session.id === activeRegister?.id) {
          const newTrans = {
            id: `trans-${Date.now()}`,
            time: new Date().toISOString(),
            type: 'income' as const,
            amount: saleData.total,
            description: `Venta POS - ${saleData.items.map(i => `${i.name} x${i.quantity}`).join(', ')}`,
            paymentMethod: saleData.paymentMethod,
            saleId
          };
          return {
            ...session,
            transactions: [...session.transactions, newTrans]
          };
        }
        return session;
      });

      return {
        sales: [...state.sales, newSale],
        products: updatedProducts,
        clients: updatedClients,
        cashSessions: updatedCashSessions,
        purchasedPacks: [...state.purchasedPacks, ...newPurchasedPacks]
      };
    });
  },

  // Cash Register Sessions
  openCashRegister: (amount, openedBy) => {
    const newSession: CashRegisterSession = {
      id: `cash-session-${Date.now()}`,
      openingTime: new Date().toISOString(),
      openedBy,
      openingAmount: amount,
      status: 'open',
      transactions: []
    };
    set((state) => ({
      cashSessions: [...state.cashSessions, newSession]
    }));
  },

  closeCashRegister: (realAmount, closedBy) => {
    set((state) => ({
      cashSessions: state.cashSessions.map((session) => {
        if (session.status === 'open') {
          // Calculate expected amount
          const cashIn = session.transactions
            .filter(t => t.type === 'income' && t.paymentMethod === 'cash')
            .reduce((sum, t) => sum + t.amount, 0);
          const cashOut = session.transactions
            .filter(t => t.type === 'expense' && t.paymentMethod === 'cash')
            .reduce((sum, t) => sum + t.amount, 0);
          const expected = session.openingAmount + cashIn - cashOut;

          return {
            ...session,
            closingTime: new Date().toISOString(),
            closedBy,
            closingAmountExpected: expected,
            closingAmountReal: realAmount,
            status: 'closed'
          };
        }
        return session;
      })
    }));
  },

  addCashTransaction: (type, amount, description, paymentMethod) => {
    set((state) => {
      const active = state.cashSessions.find(s => s.status === 'open');
      if (!active) return {};

      const newTrans = {
        id: `trans-${Date.now()}`,
        time: new Date().toISOString(),
        type: type === 'income' ? 'income' as const : 'expense' as const,
        amount,
        description,
        paymentMethod
      };

      return {
        cashSessions: state.cashSessions.map((session) => {
          if (session.id === active.id) {
            return {
              ...session,
              transactions: [...session.transactions, newTrans]
            };
          }
          return session;
        })
      };
    });
  },
}), {
  name: 'estheticapp-storage',
}));
