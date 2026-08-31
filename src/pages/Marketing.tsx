import React, { useState, useMemo } from 'react';
import {
  Zap, MessageSquare, AlertTriangle,
  Gift, Calendar, Send, Edit3, X, CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Client } from '../types';

export const Marketing: React.FC = () => {
  const { clients, purchasedPacks, evolutionaryRecords, treatmentTypes, updateClient } = useStore();
  const [activeSegment, setActiveSegment] = useState<'inactive' | 'packs' | 'birthday'>('inactive');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');

  // Use real current date
  const TODAY = new Date();

  // Segmentation Logic
  const segmentedData = useMemo(() => {
    // 1. Inactive (+30 days)
    const inactive = clients.filter(client => {
      const records = evolutionaryRecords.filter(r => r.clientId === client.id);
      if (records.length === 0) return false;

      const lastDate = new Date(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date);
      const diffDays = Math.floor((TODAY.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 30;
    });

    // 2. Packs ending (1 session left)
    const packsEnding = purchasedPacks.filter(p =>
      p.estado === 'activo' && (p.totalSesiones - p.sesionesConsumidas) === 1
    ).map(p => ({
      ...p,
      client: clients.find(c => c.id === p.pacienteId)
    })).filter(p => p.client !== undefined);

    // 3. Birthdays (August)
    const currentMonth = TODAY.getMonth();
    const birthdays = clients.filter(c => {
      if (!c.birthDate) return false;
      const bMonth = new Date(c.birthDate).getMonth();
      return bMonth === currentMonth;
    });

    return { inactive, packsEnding, birthdays };
  }, [clients, purchasedPacks, evolutionaryRecords]);

  // Templates
  const getTemplate = (client: Client, segment: string) => {
    const name = client.firstName;
    const centro = "EsthetiKare";

    switch (segment) {
      case 'inactive':
        const lastRecord = evolutionaryRecords.filter(r => r.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const treat = treatmentTypes.find(t => t.id === lastRecord?.treatmentTypeId);
        return `¡Hola ${name}! 🌸 En ${centro} tenemos una promo especial para vos: 20% OFF para retomar tu tratamiento de ${treat?.name || 'estética'} este mes. ¡Escribinos para reservar tu turno!`;
      case 'packs':
        const pack = purchasedPacks.find(p => p.pacienteId === client.id && (p.totalSesiones - p.sesionesConsumidas) === 1);
        return `¡Hola ${name}! 🌸 En ${centro} tenemos una promo especial para vos: tu pack de ${pack?.nombreTratamiento || 'tratamiento'} está por terminar. ¡Aprovechá la renovación con precio congelado! Escribinos para reservar tu lugar.`;
      case 'birthday':
        return `¡Hola ${name}! 🌸 ¡Feliz cumpleaños! 🎂 En ${centro} tenemos un regalo especial para vos: una sesión de hidratación facial de regalo con tu próximo turno. ¡Te esperamos para festejar juntas!`;
      default:
        return `Hola ${name}! 🌸`;
    }
  };

  const handleOpenMessenger = (client: Client) => {
    setSelectedClient(client);
    setEditedMessage(getTemplate(client, activeSegment));
    setIsMessageModalOpen(true);
  };

  const handleSendWhatsApp = () => {
    if (!selectedClient) return;

    // Directive 2: Clean phone number (remove non-digits and ensure country prefix)
    let phone = selectedClient.phone.replace(/\D/g, '');
    if (!phone.startsWith('549') && !phone.startsWith('54')) {
      phone = '549' + phone; // Default to Argentina if missing
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(editedMessage)}`, '_blank');

    // Update tracking
    updateClient(selectedClient.id, { lastCommercialContact: TODAY.toISOString() });
    setIsMessageModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Metrics Header */}
      <div className="bg-gradient-to-r from-aesthetic-500 to-aesthetic-700 p-8 rounded-3xl text-white shadow-xl shadow-aesthetic-500/20 relative overflow-hidden">
        <Zap className="absolute right-[-20px] top-[-20px] w-48 h-48 text-white/10 rotate-12" />
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Motor de Reactivación</h1>
            <p className="text-aesthetic-100 font-bold mt-1 uppercase text-xs tracking-widest">Inteligencia Comercial & Fidelización</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Inactivos detectados</p>
              <h3 className="text-2xl font-black mt-1">{segmentedData.inactive.length}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Packs por vencer</p>
              <h3 className="text-2xl font-black mt-1">{segmentedData.packsEnding.length}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Cumpleaños (Agosto)</p>
              <h3 className="text-2xl font-black mt-1">{segmentedData.birthdays.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex bg-aesthetic-100/30 p-1.5 rounded-2xl border border-aesthetic-200/20 max-w-2xl mx-auto">
        {(['inactive', 'packs', 'birthday'] as const).map(segment => (
          <button
            key={segment}
            onClick={() => setActiveSegment(segment)}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === segment
                ? 'bg-white text-aesthetic-700 shadow-sm border border-aesthetic-200/30'
                : 'text-aesthetic-400 hover:text-aesthetic-600'
            }`}
          >
            {segment === 'inactive' ? 'Inactivos +30d' : segment === 'packs' ? 'Pack Final' : 'Cumpleaños'}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="glass-panel rounded-3xl shadow-sm border border-aesthetic-200/20 overflow-hidden">
        <div className="p-6 border-b border-aesthetic-200/10 bg-aesthetic-50/30 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#332724] uppercase tracking-wider flex items-center space-x-2">
                {activeSegment === 'inactive' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {activeSegment === 'packs' && <Zap className="w-5 h-5 text-aesthetic-500" />}
                {activeSegment === 'birthday' && <Gift className="w-5 h-5 text-rose-500" />}
                <span>
                    {activeSegment === 'inactive' && 'Pacientes que no asisten hace 30 días'}
                    {activeSegment === 'packs' && 'Pacientes con 1 sesión restante'}
                    {activeSegment === 'birthday' && 'Cumpleañeros del mes'}
                </span>
            </h2>
            <span className="text-xs font-bold text-aesthetic-500 px-3 py-1 bg-white rounded-full border border-aesthetic-100">
                {activeSegment === 'inactive' ? segmentedData.inactive.length : activeSegment === 'packs' ? segmentedData.packsEnding.length : segmentedData.birthdays.length} detectados
            </span>
        </div>

        <div className="divide-y divide-aesthetic-200/10 min-h-[400px]">
            {/* INACTIVE SEGMENT */}
            {activeSegment === 'inactive' && segmentedData.inactive.map(client => {
                const records = evolutionaryRecords.filter(r => r.clientId === client.id);
                const lastDate = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;
                return (
                    <div key={client.id} className="p-5 flex items-center justify-between hover:bg-aesthetic-100/10 transition-colors">
                        <div className="space-y-1">
                            <h4 className="font-black text-[#332724]">{client.firstName} {client.lastName}</h4>
                            <div className="flex items-center space-x-3 text-[10px] font-bold text-aesthetic-500 uppercase">
                                <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /> <span>Última vez: {lastDate}</span></span>
                                {client.lastCommercialContact && (
                                    <span className="flex items-center space-x-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> <span>Contactado: {client.lastCommercialContact.substring(0, 10)}</span></span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpenMessenger(client)}
                            className="flex items-center space-x-2 bg-aesthetic-100/50 hover:bg-aesthetic-500 hover:text-white text-aesthetic-600 px-4 py-2 rounded-xl text-xs font-black transition-all border border-aesthetic-200/30 cursor-pointer"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Reactivar</span>
                        </button>
                    </div>
                );
            })}

            {/* PACKS ENDING SEGMENT */}
            {activeSegment === 'packs' && segmentedData.packsEnding.map(item => (
                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-aesthetic-100/10 transition-colors">
                    <div className="space-y-1">
                        <h4 className="font-black text-[#332724]">{item.client?.firstName} {item.client?.lastName}</h4>
                        <div className="flex items-center space-x-3 text-[10px] font-bold text-aesthetic-500 uppercase">
                            <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">{item.nombreTratamiento}</span>
                            <span className="text-rose-500 font-black">Queda 1 sesión</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenMessenger(item.client!)}
                        className="flex items-center space-x-2 bg-aesthetic-100/50 hover:bg-aesthetic-500 hover:text-white text-aesthetic-600 px-4 py-2 rounded-xl text-xs font-black transition-all border border-aesthetic-200/30 cursor-pointer"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Ofrecer Renovación</span>
                    </button>
                </div>
            ))}

            {/* BIRTHDAYS SEGMENT */}
            {activeSegment === 'birthday' && segmentedData.birthdays.map(client => (
                <div key={client.id} className="p-5 flex items-center justify-between hover:bg-aesthetic-100/10 transition-colors">
                    <div className="space-y-1">
                        <h4 className="font-black text-[#332724]">{client.firstName} {client.lastName}</h4>
                        <div className="flex items-center space-x-3 text-[10px] font-bold text-aesthetic-500 uppercase">
                            <span className="flex items-center space-x-1"><Gift className="w-3 h-3" /> <span>Fecha: {client.birthDate}</span></span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenMessenger(client)}
                        className="flex items-center space-x-2 bg-aesthetic-100/50 hover:bg-rose-500 hover:text-white text-rose-600 px-4 py-2 rounded-xl text-xs font-black transition-all border border-rose-200/30 cursor-pointer"
                    >
                        <Gift className="w-4 h-4" />
                        <span>Saludar y Promo</span>
                    </button>
                </div>
            ))}

            {activeSegment === 'inactive' && segmentedData.inactive.length === 0 && (
                <div className="p-12 text-center text-aesthetic-400 space-y-2">
                    <CheckCircle2 className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-sm font-bold">¡Tu agenda está activa! No hay pacientes inactivos hoy.</p>
                </div>
            )}
        </div>
      </div>

      {/* Messenger Modal */}
      {isMessageModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#500732]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-aesthetic-200/20 animate-slide-in">
            <div className="p-6 border-b border-aesthetic-200/10 flex items-center justify-between bg-aesthetic-50/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-aesthetic-500 text-white shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#332724] uppercase tracking-wider">Generador de Mensaje</h3>
                  <p className="text-[10px] text-aesthetic-500 font-bold">{selectedClient.firstName} {selectedClient.lastName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="p-2 rounded-xl text-aesthetic-400 hover:bg-aesthetic-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-aesthetic-500 uppercase tracking-widest">Personalizar Mensaje</label>
                        <div className="flex items-center space-x-1 text-[9px] font-bold text-aesthetic-400">
                            <Edit3 className="w-3 h-3" />
                            <span>Editable</span>
                        </div>
                    </div>
                    <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-aesthetic-200/30 text-sm font-medium bg-[#faf6f7] text-[#332724] focus:outline-none focus:border-aesthetic-400 min-h-[140px] resize-none leading-relaxed"
                    />
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50 flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <p className="text-[10px] font-bold text-emerald-700 leading-tight">
                        Al enviar, se registrará la fecha actual como "Último Contacto Comercial" en la ficha del paciente para evitar duplicados.
                    </p>
                </div>

                <button
                    onClick={handleSendWhatsApp}
                    className="w-full flex items-center justify-center space-x-3 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer border-none"
                >
                    <Send className="w-5 h-5" />
                    <span>Enviar a WhatsApp</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
