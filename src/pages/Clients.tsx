import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, Search, FileText, Camera, ChevronRight, 
  Save, Shield, Users, CheckCircle, AlertTriangle, X
} from 'lucide-react';
import type { SkinPhototype, EvolutionaryRecord } from '../types';

export const Clients: React.FC = () => {
  const { 
    clients, addClient, 
    updateClientAnamnesis, evolutionaryRecords, addEvolutionaryRecord,
    treatmentTypes, professionals,
    purchasedPacks, consumeSession
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'anamnesis' | 'evolution'>('info');
  const [comparisonRecord, setComparisonRecord] = useState<EvolutionaryRecord | null>(null);

  // New client form state
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    birthDate: '',
    notes: '',
    active: true
  });

  // New clinical record parameters
  const [newRecord, setNewRecord] = useState({
    professionalId: professionals[0]?.id || '',
    treatmentTypeId: treatmentTypes[0]?.id || '',
    laserShots: '',
    powerJoules: '',
    vacuumLevel: '',
    peptoneVolumeCc: '',
    zonesTreated: '',
    notes: '',
    beforePhoto: '',
    afterPhoto: ''
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientRecords = evolutionaryRecords.filter(r => r.clientId === selectedClientId);

  const filteredClients = clients.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dni.includes(searchTerm) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleConsumeSession = (packId: string) => {
    const pack = purchasedPacks.find(p => p.id === packId);
    if (!pack || !selectedClient) return;

    if (pack.sesionesConsumidas >= pack.totalSesiones) {
      alert("Este pack ya no tiene sesiones disponibles.");
      return;
    }

    if (confirm(`¿Confirmas el descuento de 1 sesión de ${pack.nombreTratamiento}?`)) {
      consumeSession(packId);

      const remaining = pack.totalSesiones - (pack.sesionesConsumidas + 1);
      const sessionNum = pack.sesionesConsumidas + 1;

      if (confirm("¿Deseas enviar el comprobante de sesión por WhatsApp?")) {
        const message = `Hola ${selectedClient.firstName}, se registró la sesión N° ${sessionNum} de tu tratamiento ${pack.nombreTratamiento}. Te quedan ${remaining} sesiones disponibles. ¡Nos vemos la próxima!`;
        window.open(`https://wa.me/${selectedClient.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      }
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.firstName || !newClient.lastName || !newClient.dni) {
      alert("Por favor complete nombre, apellido y DNI.");
      return;
    }
    const created = addClient(newClient);
    setIsAddingClient(false);
    setSelectedClientId(created.id);
    setNewClient({
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      email: '',
      birthDate: '',
      notes: '',
      active: true
    });
  };

  const handleSaveAnamnesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    const anamnesis = {
      allergies: formData.get('allergies') as string,
      medicalHistory: formData.get('medicalHistory') as string,
      skinPhototype: parseInt(formData.get('skinPhototype') as string) as SkinPhototype,
      consentSigned: formData.get('consentSigned') === 'on',
      contraindications: (formData.get('contraindications') as string).split(',').map(s => s.trim()).filter(Boolean)
    };

    updateClientAnamnesis(selectedClient.id, anamnesis);
    alert("Ficha clínica de anamnesis actualizada con éxito.");
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    addEvolutionaryRecord({
      clientId: selectedClient.id,
      date: new Date().toISOString().split('T')[0],
      professionalId: newRecord.professionalId,
      treatmentTypeId: newRecord.treatmentTypeId,
      parameters: {
        laserShots: newRecord.laserShots ? parseInt(newRecord.laserShots) : undefined,
        powerJoules: newRecord.powerJoules ? parseFloat(newRecord.powerJoules) : undefined,
        vacuumLevel: newRecord.vacuumLevel ? parseInt(newRecord.vacuumLevel) : undefined,
        peptoneVolumeCc: newRecord.peptoneVolumeCc ? parseFloat(newRecord.peptoneVolumeCc) : undefined,
        zonesTreated: newRecord.zonesTreated.split(',').map(z => z.trim()).filter(Boolean)
      },
      notes: newRecord.notes,
      beforePhotos: newRecord.beforePhoto ? [newRecord.beforePhoto] : ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'],
      afterPhotos: newRecord.afterPhoto ? [newRecord.afterPhoto] : ['https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400']
    });

    setIsAddingRecord(false);
    setNewRecord({
      professionalId: professionals[0]?.id || '',
      treatmentTypeId: treatmentTypes[0]?.id || '',
      laserShots: '',
      powerJoules: '',
      vacuumLevel: '',
      peptoneVolumeCc: '',
      zonesTreated: '',
      notes: '',
      beforePhoto: '',
      afterPhoto: ''
    });
    alert("Sesión evolutiva registrada correctamente.");
  };

  // Fitzpatrick Phototype descriptions & color previews
  const fitzpatrickData = [
    { value: 1, label: 'Fototipo I', desc: 'Piel muy clara, siempre se quema, nunca se broncea', color: 'bg-[#FFF3E3] border-[#ecd2b8]' },
    { value: 2, label: 'Fototipo II', desc: 'Piel clara, suele quemarse, bronceado mínimo', color: 'bg-[#FFE8D6] border-[#d8b598]' },
    { value: 3, label: 'Fototipo III', desc: 'Piel intermedia, quemaduras moderadas, bronceado gradual', color: 'bg-[#F2D1B3] border-[#c09d78]' },
    { value: 4, label: 'Fototipo IV', desc: 'Piel morena clara, se quema mínimamente, buen bronceado', color: 'bg-[#D4A373] border-[#a07141]' },
    { value: 5, label: 'Fototipo V', desc: 'Piel morena oscura, raramente se quema, bronceado rápido', color: 'bg-[#8F5B34] border-[#693e20] text-white' },
    { value: 6, label: 'Fototipo VI', desc: 'Piel negra, nunca se quema, bronceado profundo', color: 'bg-[#402A1C] border-[#22130a] text-white' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* 1. Clients List Panel */}
      <div className="glass-panel rounded-2xl shadow-sm overflow-hidden flex flex-col h-[700px]">
        {/* Search and Title */}
        <div className="p-6 border-b border-aesthetic-200/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#332724]">Clientes ({clients.length})</h2>
            <button 
              onClick={() => setIsAddingClient(true)}
              className="p-2 rounded-xl bg-aesthetic-500 text-white hover:bg-aesthetic-600 transition-colors shadow-sm cursor-pointer"
              title="Registrar Cliente"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-aesthetic-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, apellido, DNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-aesthetic-400 focus:border-transparent transition-all bg-white/50 text-[#332724]"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-aesthetic-200/10">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              onClick={() => {
                setSelectedClientId(client.id);
                setIsAddingClient(false);
                setIsAddingRecord(false);
              }}
              className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                selectedClientId === client.id ? 'bg-aesthetic-100/50 border-r-4 border-aesthetic-500' : 'hover:bg-aesthetic-100/10'
              }`}
            >
              <div className="min-w-0 pr-4">
                <p className="font-bold text-[#332724] truncate">
                  {client.firstName} {client.lastName}
                </p>
                <p className="text-xs text-aesthetic-600 mt-0.5">DNI: {client.dni}</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className={`w-2.5 h-2.5 rounded-full ${client.active ? 'bg-emerald-500 animate-pulse' : 'bg-aesthetic-300'}`}></span>
                <ChevronRight className="w-4 h-4 text-aesthetic-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Client Details/Forms Area (Takes 2/3 of grid) */}
      <div className="lg:col-span-2">
        {isAddingClient ? (
          /* Create Client Panel */
          <div className="glass-panel rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-bold text-[#332724]">Registrar Nuevo Cliente</h3>
            <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">Nombre *</label>
                <input 
                  type="text" 
                  value={newClient.firstName}
                  onChange={e => setNewClient({...newClient, firstName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-aesthetic-400 bg-white/50 text-[#332724]" 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">Apellido *</label>
                <input 
                  type="text" 
                  value={newClient.lastName}
                  onChange={e => setNewClient({...newClient, lastName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 bg-white/50 text-[#332724]" 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">DNI *</label>
                <input 
                  type="text" 
                  value={newClient.dni}
                  onChange={e => setNewClient({...newClient, dni: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 bg-white/50 text-[#332724]" 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">Teléfono</label>
                <input 
                  type="tel" 
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 bg-white/50 text-[#332724]" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">Email</label>
                <input 
                  type="email" 
                  value={newClient.email}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 bg-white/50 text-[#332724]" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={newClient.birthDate}
                  onChange={e => setNewClient({...newClient, birthDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 bg-white/50 text-[#332724]" 
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">Notas de Preferencia o Cuidados Especiales</label>
                <textarea 
                  value={newClient.notes}
                  onChange={e => setNewClient({...newClient, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 bg-white/50 text-[#332724]" 
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end space-x-3 pt-4 border-t border-aesthetic-200/10">
                <button 
                  type="button"
                  onClick={() => setIsAddingClient(false)}
                  className="px-5 py-2.5 rounded-xl border border-aesthetic-200/30 text-aesthetic-700 font-bold text-xs hover:bg-aesthetic-100/50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-aesthetic-500 text-white font-bold text-xs hover:bg-aesthetic-600 transition-colors shadow-sm cursor-pointer"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        ) : isAddingRecord ? (
          /* Create Evolutionary Record */
          <div className="glass-panel rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-bold text-[#332724]">Registrar Sesión de Tratamiento ({selectedClient?.firstName} {selectedClient?.lastName})</h3>
            <form onSubmit={handleCreateRecord} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Tratamiento Realizado</label>
                  <select 
                    value={newRecord.treatmentTypeId}
                    onChange={e => setNewRecord({...newRecord, treatmentTypeId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                  >
                    {treatmentTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Profesional a Cargo</label>
                  <select 
                    value={newRecord.professionalId}
                    onChange={e => setNewRecord({...newRecord, professionalId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                  >
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parametric Fields depending on Treatment types */}
              <div className="bg-sage-100/30 p-5 rounded-2xl border border-sage-200/20 space-y-4">
                <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-sage-400"></span>
                  <span>Parámetros de Cabina</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-sage-700">Disparos Láser</label>
                    <input 
                      type="number" 
                      placeholder="Ej. 120"
                      value={newRecord.laserShots}
                      onChange={e => setNewRecord({...newRecord, laserShots: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-sage-200/20 text-xs focus:outline-none bg-white/70 text-[#332724]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-sage-700">Potencia (Joules)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ej. 14.5"
                      value={newRecord.powerJoules}
                      onChange={e => setNewRecord({...newRecord, powerJoules: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-sage-200/20 text-xs focus:outline-none bg-white/70 text-[#332724]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-sage-700">Vacío (Vacuum)</label>
                    <input 
                      type="number" 
                      placeholder="Ej. 3"
                      value={newRecord.vacuumLevel}
                      onChange={e => setNewRecord({...newRecord, vacuumLevel: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-sage-200/20 text-xs focus:outline-none bg-white/70 text-[#332724]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-sage-700">Peptonas (cc)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ej. 10.0"
                      value={newRecord.peptoneVolumeCc}
                      onChange={e => setNewRecord({...newRecord, peptoneVolumeCc: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-sage-200/20 text-xs focus:outline-none bg-white/70 text-[#332724]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sage-800">Zonas Tratadas *</label>
                  <input 
                    type="text" 
                    placeholder="Separadas por coma (ej. Abdomen, Flancos)"
                    value={newRecord.zonesTreated}
                    onChange={e => setNewRecord({...newRecord, zonesTreated: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-sage-200/20 text-xs focus:outline-none bg-white/70 text-[#332724]"
                    required
                  />
                </div>
              </div>

              {/* Photos placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Imagen Antes (URL)</label>
                  <input 
                    type="text" 
                    placeholder="http://url-de-foto.jpg"
                    value={newRecord.beforePhoto}
                    onChange={e => setNewRecord({...newRecord, beforePhoto: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-xs focus:outline-none bg-white/50 text-[#332724]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Imagen Después (URL)</label>
                  <input 
                    type="text" 
                    placeholder="http://url-de-foto.jpg"
                    value={newRecord.afterPhoto}
                    onChange={e => setNewRecord({...newRecord, afterPhoto: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-xs focus:outline-none bg-white/50 text-[#332724]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-aesthetic-700">Notas de Evolución y Observaciones</label>
                <textarea 
                  rows={3}
                  value={newRecord.notes}
                  onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white/50 text-[#332724]"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-aesthetic-200/10">
                <button 
                  type="button"
                  onClick={() => setIsAddingRecord(false)}
                  className="px-5 py-2.5 rounded-xl border border-aesthetic-200/30 text-aesthetic-700 font-bold text-xs hover:bg-aesthetic-100/50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-aesthetic-500 text-white font-bold text-xs hover:bg-aesthetic-600 transition-colors shadow-sm"
                >
                  Registrar Sesión
                </button>
              </div>
            </form>
          </div>
        ) : selectedClient ? (
          /* Client Details and Tabs */
          <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
            {/* Header Header */}
            <div className="p-6 bg-aesthetic-100/20 border-b border-aesthetic-200/20 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-xl font-bold text-[#332724]">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h3>
                <p className="text-xs text-aesthetic-600 mt-1">DNI: {selectedClient.dni} • Cel: {selectedClient.phone || 'No registra'}</p>
              </div>
              <div className="flex items-center space-x-2.5 self-start sm:self-auto">
                <button 
                  onClick={() => setIsAddingRecord(true)}
                  className="inline-flex items-center space-x-1.5 bg-aesthetic-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-aesthetic-600 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Nueva Sesión</span>
                </button>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-aesthetic-200/20 bg-aesthetic-100/10">
              {(['info', 'anamnesis', 'evolution'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-xs font-extrabold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'border-aesthetic-500 text-aesthetic-800 bg-white/40'
                      : 'border-transparent text-aesthetic-500 hover:text-aesthetic-800'
                  }`}
                >
                  {tab === 'info' ? 'General' : tab === 'anamnesis' ? 'Ficha Médica' : 'Evolución / Fotos'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* General details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-bold text-[#332724]">{selectedClient.email || 'Sin correo electrónico'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">F. Nacimiento</p>
                      <p className="text-sm font-bold text-[#332724]">{selectedClient.birthDate || 'No registrada'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">F. de Registro</p>
                      <p className="text-sm font-bold text-[#332724]">{selectedClient.registrationDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">Estado Ficha</p>
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedClient.anamnesis?.consentSigned ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        {selectedClient.anamnesis?.consentSigned ? 'Consentimiento Firmado' : 'Pendiente Firma'}
                      </span>
                    </div>
                  </div>

                  {/* Session Balances / Roadmap of Purchased Packs */}
                  <div className="bg-aesthetic-100/20 rounded-2xl p-5 border border-aesthetic-200/20 space-y-4">
                    <h4 className="text-xs font-bold text-[#332724] uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-aesthetic-400"></span>
                      <span>Roadmap de Sesiones y Packs</span>
                    </h4>

                    {purchasedPacks.filter(p => p.pacienteId === selectedClient.id).length === 0 ? (
                      <p className="text-xs text-aesthetic-500/80 font-medium text-center py-4 bg-white/50 rounded-xl">No hay packs de sesiones activos para este cliente.</p>
                    ) : (
                      <div className="space-y-4">
                        {purchasedPacks
                          .filter(p => p.pacienteId === selectedClient.id)
                          .map((pack) => {
                            const remaining = pack.totalSesiones - pack.sesionesConsumidas;
                            return (
                              <div key={pack.id} className="bg-white/70 p-4 rounded-xl border border-aesthetic-200/10 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0 pr-2">
                                    <h5 className="text-xs font-black text-[#332724] uppercase truncate">{pack.nombreTratamiento}</h5>
                                    <p className="text-[10px] text-aesthetic-500 font-bold uppercase tracking-tighter">
                                      {pack.estado === 'activo' ? 'En Curso' : 'Completado'} • {pack.sesionesConsumidas}/{pack.totalSesiones} Sesiones
                                    </p>
                                  </div>
                                  {pack.estado === 'activo' && (
                                    <button
                                      onClick={() => handleConsumeSession(pack.id)}
                                      className="flex items-center space-x-1 bg-aesthetic-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-aesthetic-600 transition-all cursor-pointer shadow-sm border-none"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>Descontar Sesión</span>
                                    </button>
                                  )}
                                </div>

                                {/* Visual Roadmap (Dots/Checkboxes) */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {Array.from({ length: pack.totalSesiones }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                        i < pack.sesionesConsumidas
                                          ? 'bg-aesthetic-500 border-aesthetic-600 text-white shadow-inner'
                                          : 'bg-[#faf6f7] border-aesthetic-200 text-aesthetic-300'
                                      }`}
                                    >
                                      {i < pack.sesionesConsumidas ? (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      ) : (
                                        <span className="text-[10px] font-bold">{i + 1}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {remaining === 1 && pack.estado === 'activo' && (
                                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-center space-x-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-600 uppercase">¡Última sesión disponible!</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* General Notes */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide">Observaciones Internas</p>
                    <p className="text-sm text-aesthetic-800 italic bg-aesthetic-100/10 p-3.5 rounded-xl border border-aesthetic-200/20">
                      "{selectedClient.notes || 'Sin observaciones.'}"
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'anamnesis' && (
                /* Clinical Medical History / Anamnesis Form */
                <form onSubmit={handleSaveAnamnesis} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-aesthetic-700 flex items-center space-x-1">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>Alergias Conocidas</span>
                      </label>
                      <input 
                        type="text" 
                        name="allergies"
                        defaultValue={selectedClient.anamnesis?.allergies || ''}
                        placeholder="Alimentos, anestesia, metales, etc."
                        className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white/50 text-[#332724]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-aesthetic-700">Contraindicaciones Clínicas</label>
                      <input 
                        type="text" 
                        name="contraindications"
                        defaultValue={selectedClient.anamnesis?.contraindications?.join(', ') || ''}
                        placeholder="Ej. Marcapasos, Embarazo, Diabetes"
                        className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white/50 text-[#332724]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-aesthetic-700">Historial Médico y Medicamentos</label>
                    <textarea 
                      name="medicalHistory"
                      defaultValue={selectedClient.anamnesis?.medicalHistory || ''}
                      rows={3}
                      placeholder="Antecedentes médicos relevantes, tratamientos actuales..."
                      className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white/50 text-[#332724]"
                    />
                  </div>

                  {/* Fitzpatrick Phototype interactive visual grid */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-aesthetic-800 uppercase tracking-wider">Fototipo Cutáneo (Fitzpatrick)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {fitzpatrickData.map((f) => (
                        <label 
                          key={f.value}
                          className={`p-3 rounded-xl border flex flex-col items-start cursor-pointer transition-all ${
                            selectedClient.anamnesis?.skinPhototype === f.value 
                              ? 'ring-2 ring-aesthetic-500 border-transparent bg-white shadow-sm' 
                              : 'hover:border-aesthetic-300 border-aesthetic-200/40 bg-white/30'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              name="skinPhototype"
                              value={f.value}
                              defaultChecked={selectedClient.anamnesis?.skinPhototype === f.value}
                              className="accent-aesthetic-500"
                            />
                            <span className="text-xs font-bold text-aesthetic-800">{f.label}</span>
                            <span className={`w-3.5 h-3.5 rounded-full border ${f.color}`}></span>
                          </div>
                          <p className="text-[10px] text-aesthetic-600 mt-1 leading-tight">{f.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Informed Consent Confirmation & Signature */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-aesthetic-200/10 bg-aesthetic-100/10 flex items-center justify-between">
                      <div className="flex items-center space-x-3 pr-4">
                        <Shield className="w-5 h-5 text-aesthetic-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[#332724]">Firma de Consentimiento Informado</p>
                          <p className="text-[10px] text-aesthetic-500 leading-tight">El cliente comprende y asume los cuidados post tratamiento.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="consentSigned"
                          defaultChecked={selectedClient.anamnesis?.consentSigned || false}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-aesthetic-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-aesthetic-500"></div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-aesthetic-500 uppercase tracking-widest">Firma Digital del Paciente</label>
                      <div className="h-32 w-full rounded-2xl border-2 border-dashed border-aesthetic-200 bg-[#faf6f7] flex items-center justify-center relative group overflow-hidden">
                        {selectedClient.anamnesis?.consentSigned ? (
                           <div className="flex flex-col items-center space-y-1">
                              <CheckCircle className="w-8 h-8 text-emerald-500/30" />
                              <span className="text-[10px] font-bold text-emerald-600/50 uppercase">Firmado Digitalmente</span>
                           </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-1 text-aesthetic-300 group-hover:text-aesthetic-400 transition-colors">
                            <Plus className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Tocar para firmar en pantalla</span>
                          </div>
                        )}
                        <canvas className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair"></canvas>
                      </div>
                      <p className="text-[9px] text-aesthetic-400 text-center font-bold italic">
                        Al firmar, el paciente acepta los términos y condiciones del servicio RGCivit Esthetic.
                      </p>
                    </div>
                  </div>

                  {/* Submission buttons */}
                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="inline-flex items-center space-x-2 bg-[#332724] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-black cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Ficha Médica</span>
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'evolution' && (
                /* Evolutionary Clinical follow-up list and comparison galleries */
                <div className="space-y-8">
                  {clientRecords.length === 0 ? (
                    <div className="p-8 text-center text-aesthetic-500/70 flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-aesthetic-200 mb-2" />
                      <p className="text-sm font-bold">No hay registros de evolución cargados aún.</p>
                      <p className="text-xs mt-1">Haga click en "Nueva Sesión" para documentar el primer tratamiento.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {clientRecords.map((record) => {
                        const treat = treatmentTypes.find(t => t.id === record.treatmentTypeId);
                        const prof = professionals.find(p => p.id === record.professionalId);
                        
                        return (
                          <div key={record.id} className="p-5 rounded-2xl border border-aesthetic-200/10 bg-white/40 shadow-sm space-y-4">
                            {/* Record header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-aesthetic-200/10">
                              <div>
                                <h4 className="font-extrabold text-[#332724]">{treat?.name || 'Tratamiento'}</h4>
                                <p className="text-[10px] text-aesthetic-500 mt-0.5">Atendido por {prof?.name || 'Profesional'} el {record.date}</p>
                              </div>
                            </div>

                            {/* Session Telemetry parameters if present */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                              {record.parameters.laserShots !== undefined && (
                                <div className="bg-white/70 px-3.5 py-2 rounded-xl border border-aesthetic-200/10">
                                  <p className="text-[9px] text-aesthetic-500 font-bold uppercase">Disparos Láser</p>
                                  <p className="text-sm font-black text-aesthetic-800">{record.parameters.laserShots}</p>
                                </div>
                              )}
                              {record.parameters.powerJoules !== undefined && (
                                <div className="bg-white/70 px-3.5 py-2 rounded-xl border border-aesthetic-200/10">
                                  <p className="text-[9px] text-aesthetic-500 font-bold uppercase">Potencia (J)</p>
                                  <p className="text-sm font-black text-aesthetic-800">{record.parameters.powerJoules} J</p>
                                </div>
                              )}
                              {record.parameters.vacuumLevel !== undefined && (
                                <div className="bg-white/70 px-3.5 py-2 rounded-xl border border-aesthetic-200/10">
                                  <p className="text-[9px] text-aesthetic-500 font-bold uppercase">Nivel Vacío</p>
                                  <p className="text-sm font-black text-aesthetic-800">{record.parameters.vacuumLevel} mmHg</p>
                                </div>
                              )}
                              {record.parameters.peptoneVolumeCc !== undefined && (
                                <div className="bg-white/70 px-3.5 py-2 rounded-xl border border-aesthetic-200/10">
                                  <p className="text-[9px] text-aesthetic-500 font-bold uppercase">Peptonas</p>
                                  <p className="text-sm font-black text-aesthetic-800">{record.parameters.peptoneVolumeCc} cc</p>
                                </div>
                              )}
                            </div>

                            {/* Treated Zones */}
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] font-bold text-aesthetic-500 uppercase">Zonas:</span>
                              {record.parameters.zonesTreated.map(z => (
                                <span key={z} className="text-[10px] font-bold bg-white/80 border border-aesthetic-200/20 px-2.5 py-0.5 rounded-full text-aesthetic-800">
                                  {z}
                                </span>
                              ))}
                            </div>

                            {/* Before/After Gallery */}
                            <div className="grid grid-cols-2 gap-4 group cursor-pointer" onClick={() => setComparisonRecord(record)}>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-aesthetic-500 uppercase">Antes</span>
                                <div className="h-40 rounded-xl overflow-hidden border border-aesthetic-200/10 relative bg-[#f7f4f0]">
                                  <img 
                                    src={record.beforePhotos[0]} 
                                    alt="Antes" 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                    <Search className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-aesthetic-600 uppercase">Después</span>
                                <div className="h-40 rounded-xl overflow-hidden border border-aesthetic-300 relative bg-[#f7f4f0]">
                                  <img 
                                    src={record.afterPhotos[0]} 
                                    alt="Después" 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                    <Search className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Evolutionary Notes */}
                            <div className="text-xs text-aesthetic-700 leading-relaxed pt-2">
                              <span className="font-extrabold text-[#332724]">Observación en Cabina: </span> 
                              {record.notes}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl shadow-sm p-12 text-center text-aesthetic-400 h-[600px] flex flex-col items-center justify-center">
            <Users className="w-16 h-16 text-aesthetic-200 mb-3" />
            <h3 className="text-lg font-bold text-aesthetic-700">Ningún Cliente Seleccionado</h3>
            <p className="text-xs mt-1">Seleccione un cliente de la lista de la izquierda para acceder a su ficha clínica.</p>
          </div>
        )}
      </div>
      {/* Photo Comparison Modal */}
      {comparisonRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#500732]/90 backdrop-blur-md">
          <div className="w-full max-w-5xl bg-[#faf6f7] rounded-3xl overflow-hidden shadow-2xl animate-slide-in">
            <div className="p-6 border-b border-aesthetic-200/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#332724] uppercase tracking-wider">Comparador Evolutivo</h3>
                <p className="text-[10px] text-aesthetic-500 font-bold">Sesión del {comparisonRecord.date}</p>
              </div>
              <button
                onClick={() => setComparisonRecord(null)}
                className="p-2 rounded-xl text-aesthetic-400 hover:bg-aesthetic-100 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
              <div className="flex flex-col space-y-2">
                <span className="text-[10px] font-black text-aesthetic-500 uppercase tracking-widest text-center">Antes</span>
                <div className="flex-1 rounded-2xl overflow-hidden border-2 border-aesthetic-200 shadow-inner">
                  <img src={comparisonRecord.beforePhotos[0]} className="w-full h-full object-contain bg-black/5" alt="Antes full" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-[10px] font-black text-aesthetic-500 uppercase tracking-widest text-center">Después</span>
                <div className="flex-1 rounded-2xl overflow-hidden border-2 border-aesthetic-500 shadow-md">
                  <img src={comparisonRecord.afterPhotos[0]} className="w-full h-full object-contain bg-black/5" alt="Después full" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-aesthetic-100/30 flex justify-center">
               <button
                 onClick={() => setComparisonRecord(null)}
                 className="px-8 py-3 bg-[#332724] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg"
               >
                 Cerrar Comparador
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
