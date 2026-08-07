import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Calendar as CalendarIcon, Filter, Plus, 
  Clock, AlertCircle, Info 
} from 'lucide-react';
import type { AppointmentStatus } from '../types';

export const Agenda: React.FC = () => {
  const { 
    appointments, clients, professionals, cabinets, treatmentTypes, 
    addAppointment, updateAppointmentStatus 
  } = useStore();

  const [selectedDate, setSelectedDate] = useState('2026-08-06'); // Standard mock date
  const [filterProfessional, setFilterProfessional] = useState('all');
  const [filterCabinet, setFilterCabinet] = useState('all');
  const [filterTreatment, setFilterTreatment] = useState('all');
  
  const [isBooking, setIsBooking] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  // Booking Form State
  const [booking, setBooking] = useState({
    clientId: clients[0]?.id || '',
    professionalId: professionals[0]?.id || '',
    treatmentTypeId: treatmentTypes[0]?.id || '',
    cabinetId: cabinets[0]?.id || '',
    time: '12:00',
    notes: ''
  });

  const filteredAppointments = appointments.filter(a => {
    const matchesDate = a.dateTime.startsWith(selectedDate);
    const matchesProf = filterProfessional === 'all' || a.professionalId === filterProfessional;
    const matchesCabinet = filterCabinet === 'all' || a.cabinetId === filterCabinet;
    const matchesTreatment = filterTreatment === 'all' || a.treatmentTypeId === filterTreatment;
    return matchesDate && matchesProf && matchesCabinet && matchesTreatment;
  }).sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOverlapError(null);

    const dateTimeStr = `${selectedDate}T${booking.time}:00`;
    const selectedTreatment = treatmentTypes.find(t => t.id === booking.treatmentTypeId);
    const duration = selectedTreatment ? selectedTreatment.durationMin : 30;

    // Call addAppointment which runs the overlap validation logic in the store
    const result = addAppointment({
      clientId: booking.clientId,
      professionalId: booking.professionalId,
      treatmentTypeId: booking.treatmentTypeId,
      cabinetId: booking.cabinetId || undefined,
      dateTime: dateTimeStr,
      durationMin: duration,
      status: 'pending',
      notes: booking.notes
    });

    if (result.success) {
      setIsBooking(false);
      setBooking({
        clientId: clients[0]?.id || '',
        professionalId: professionals[0]?.id || '',
        treatmentTypeId: treatmentTypes[0]?.id || '',
        cabinetId: cabinets[0]?.id || '',
        time: '12:00',
        notes: ''
      });
      alert("Turno agendado exitosamente!");
    } else {
      setOverlapError(result.error || "Error de solapamiento desconocido.");
    }
  };

  const statusLabels: Record<AppointmentStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    'in-progress': 'En Proceso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    'no-show': 'No Asistió'
  };

  const statusColors: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200/60',
    confirmed: 'bg-sky-50 text-sky-600 border-sky-200/60',
    'in-progress': 'bg-purple-50 text-purple-600 border-purple-200/60 animate-pulse',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    cancelled: 'bg-aesthetic-100/50 text-aesthetic-400 border-aesthetic-200/20 line-through',
    'no-show': 'bg-rose-50 text-rose-600 border-rose-200/60'
  };

  return (
    <div className="space-y-8">
      {/* Calendar Header / Day selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel p-6 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <CalendarIcon className="w-6 h-6 text-aesthetic-500" />
          <div>
            <h2 className="text-xl font-extrabold text-[#332724]">Agenda & Planificación</h2>
            <p className="text-xs text-aesthetic-600 font-medium mt-0.5">Control de solapamientos de cabinas y aparatologías</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-aesthetic-400 text-aesthetic-800 font-bold bg-white/60"
          />
          <button 
            onClick={() => {
              setIsBooking(true);
              setOverlapError(null);
            }}
            className="inline-flex items-center space-x-2 bg-aesthetic-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-aesthetic-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Turno</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* FILTERS PANEL */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-aesthetic-200/20">
            <Filter className="w-4 h-4 text-aesthetic-400" />
            <h3 className="text-xs font-bold text-aesthetic-800 uppercase tracking-wider">Filtros de Agenda</h3>
          </div>

          {/* Filter Professional */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-aesthetic-700">Filtrar por Especialista</label>
            <select 
              value={filterProfessional}
              onChange={(e) => setFilterProfessional(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-aesthetic-200/30 text-xs focus:outline-none bg-white/60 text-[#332724]"
            >
              <option value="all">Todos los profesionales</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Cabinet */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-aesthetic-700">Filtrar por Cabina/Equipo</label>
            <select 
              value={filterCabinet}
              onChange={(e) => setFilterCabinet(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-aesthetic-200/30 text-xs focus:outline-none bg-white/60 text-[#332724]"
            >
              <option value="all">Todas las cabinas</option>
              {cabinets.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Treatment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-aesthetic-700">Filtrar por Tratamiento</label>
            <select 
              value={filterTreatment}
              onChange={(e) => setFilterTreatment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-aesthetic-200/30 text-xs focus:outline-none bg-white/60 text-[#332724]"
            >
              <option value="all">Todos los tratamientos</option>
              {treatmentTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CALENDAR VIEW & MODAL FOR BOOKING */}
        <div className="lg:col-span-3 space-y-6">
          {isBooking && (
            /* New Appointment Form with overlap detection alerts */
            <div className="glass-panel p-6 rounded-2xl border-2 border-aesthetic-300 shadow-md space-y-6 animate-slide-in">
              <div className="flex items-center justify-between pb-3 border-b border-aesthetic-200/20">
                <h3 className="text-base font-bold text-[#332724]">Agendar Turno para el {selectedDate}</h3>
                <button 
                  onClick={() => setIsBooking(false)}
                  className="px-2 py-1 rounded bg-aesthetic-100 text-aesthetic-600 hover:bg-aesthetic-200 text-xs font-bold"
                >
                  Cerrar
                </button>
              </div>

              {overlapError && (
                <div className="p-4 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-xl flex items-start space-x-3 text-xs leading-relaxed animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Conflicto de Horario detectado: </span>
                    {overlapError}
                    <p className="mt-1 text-[11px] font-medium opacity-90 text-rose-600">Por favor, modifique el horario, cambie el especialista o reasigne la cabina para evitar la sobre-reserva.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Cliente *</label>
                  <select 
                    value={booking.clientId}
                    onChange={(e) => setBooking({...booking, clientId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.dni})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Tratamiento *</label>
                  <select 
                    value={booking.treatmentTypeId}
                    onChange={(e) => setBooking({...booking, treatmentTypeId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                  >
                    {treatmentTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.durationMin} mins)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Profesional *</label>
                  <select 
                    value={booking.professionalId}
                    onChange={(e) => setBooking({...booking, professionalId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                  >
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Cabina / Aparatología</label>
                  <select 
                    value={booking.cabinetId}
                    onChange={(e) => setBooking({...booking, cabinetId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                  >
                    <option value="">Sin cabina (Atención libre)</option>
                    {cabinets.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Hora de Inicio *</label>
                  <input 
                    type="time" 
                    value={booking.time}
                    onChange={(e) => setBooking({...booking, time: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Notas Adicionales</label>
                  <input 
                    type="text" 
                    placeholder="Detalles, indicaciones especiales..."
                    value={booking.notes}
                    onChange={(e) => setBooking({...booking, notes: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white/60 text-[#332724]"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end space-x-3 pt-3 border-t border-aesthetic-200/10">
                  <button 
                    type="button" 
                    onClick={() => setIsBooking(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-aesthetic-500 hover:bg-aesthetic-100/50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 rounded-xl bg-aesthetic-500 text-white text-xs font-bold hover:bg-aesthetic-600 transition-all shadow-sm cursor-pointer"
                  >
                    Guardar Turno Seguro
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* APPOINTMENTS TIMELINE LIST */}
          <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-aesthetic-200/20 bg-aesthetic-100/10 flex items-center justify-between">
              <span className="text-xs font-bold text-aesthetic-800 uppercase tracking-wider">Turnos Agendados hoy ({filteredAppointments.length})</span>
            </div>

            <div className="divide-y divide-aesthetic-200/10">
              {filteredAppointments.length === 0 ? (
                <div className="p-12 text-center text-aesthetic-500/70 flex flex-col items-center justify-center">
                  <Info className="w-12 h-12 text-aesthetic-200 mb-2" />
                  <p className="text-sm font-semibold">No hay turnos planificados para esta fecha.</p>
                </div>
              ) : (
                filteredAppointments.map((appt) => {
                  const client = clients.find(c => c.id === appt.clientId);
                  const prof = professionals.find(p => p.id === appt.professionalId);
                  const cabinet = cabinets.find(c => c.id === appt.cabinetId);
                  const treat = treatmentTypes.find(t => t.id === appt.treatmentTypeId);
                  
                  const startHour = appt.dateTime.substring(11, 16);
                  const endDateTime = new Date(new Date(appt.dateTime).getTime() + appt.durationMin * 60 * 1000);
                  const endHour = endDateTime.toTimeString().substring(0, 5);

                  return (
                    <div key={appt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-aesthetic-100/20 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-6">
                        {/* Time Slot */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <Clock className="w-4 h-4 text-aesthetic-400" />
                          <span className="text-sm font-extrabold text-[#332724]">{startHour} - {endHour}</span>
                          <span className="text-[10px] text-aesthetic-500 font-semibold">({appt.durationMin} min)</span>
                        </div>

                        {/* Details */}
                        <div>
                          <h4 className="font-extrabold text-[#332724] text-sm">
                            {client ? `${client.firstName} ${client.lastName}` : 'Cliente Desconocido'}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-aesthetic-500 font-semibold">
                            <span className="text-aesthetic-800">{treat?.name || 'Tratamiento'}</span>
                            <span>•</span>
                            <span>Especialista: <strong className="text-aesthetic-600 font-bold">{prof?.name}</strong></span>
                            {cabinet && (
                              <>
                                <span>•</span>
                                <span className="bg-aesthetic-100/60 text-aesthetic-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-aesthetic-200/20">
                                  {cabinet.name}
                                </span>
                              </>
                            )}
                          </div>
                          {appt.notes && (
                            <p className="text-[11px] text-aesthetic-600/80 italic mt-1.5 bg-aesthetic-100/10 p-2 rounded-lg border border-aesthetic-200/10">"{appt.notes}"</p>
                          )}
                        </div>
                      </div>

                      {/* Status select options */}
                      <div className="flex items-center space-x-3.5 mt-4 md:mt-0 self-end md:self-auto">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[appt.status]}`}>
                          {statusLabels[appt.status]}
                        </span>

                        <select
                          value={appt.status}
                          onChange={(e) => updateAppointmentStatus(appt.id, e.target.value as AppointmentStatus)}
                          className="px-2.5 py-1.5 rounded-lg border border-aesthetic-200/30 text-xs text-aesthetic-700 font-bold focus:outline-none bg-white/70 cursor-pointer"
                        >
                          {Object.entries(statusLabels).map(([status, label]) => (
                            <option key={status} value={status}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
