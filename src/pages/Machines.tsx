import React, { useState } from 'react';
import {
  HardDrive, Wrench, AlertTriangle, CheckCircle2,
  Clock, Hash, Calendar, Camera, MessageSquare, X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CabinetMachine, MachineStatus, ServiceReportStatus } from '../types';

export const Machines: React.FC = () => {
  const { cabinets, addServiceReport } = useStore();
  const [selectedMachine, setSelectedMachine] = useState<CabinetMachine | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [lastSavedReportId, setLastSavedReportId] = useState<string | null>(null);

  const handleOpenReport = (machine: CabinetMachine) => {
    setSelectedMachine(machine);
    setIsReportModalOpen(true);
    setReportDescription('');
    setLastSavedReportId(null);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

    const newReport = {
      equipoId: selectedMachine.id,
      fecha: new Date().toISOString(),
      descripcionFalla: reportDescription,
      estadoReporte: 'pendiente' as ServiceReportStatus,
    };

    // In a real app, we'd handle photos here
    const reportId = `report-${Date.now()}`;
    addServiceReport({ ...newReport });
    setLastSavedReportId(reportId);

    // We don't close immediately to show the WhatsApp button
  };

  const sendWhatsApp = () => {
    if (!selectedMachine) return;

    const phone = "+5491100000000"; // Placeholder for RGCivit Support
    const message = `Hola RGCivit Service, necesito asistencia técnica para mi equipo:
- Modelo: ${selectedMachine.modelo || selectedMachine.name}
- N° Serie: ${selectedMachine.numeroSerie || 'N/A'}
- Estado actual: ${selectedMachine.estado || 'N/A'}
- Horas de uso: ${selectedMachine.horasUso || 0} hs
- Detalle del problema: ${reportDescription}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    setIsReportModalOpen(false);
  };

  const getStatusConfig = (status?: MachineStatus) => {
    switch (status) {
      case 'optimo':
        return {
          label: 'Óptimo',
          color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          icon: CheckCircle2
        };
      case 'mantenimiento':
        return {
          label: 'Mantenimiento Requerido',
          color: 'bg-amber-50 text-amber-600 border-amber-200',
          icon: AlertTriangle
        };
      case 'fuera-de-servicio':
        return {
          label: 'Fuera de Servicio',
          color: 'bg-rose-50 text-rose-600 border-rose-200',
          icon: X
        };
      default:
        return {
          label: 'Desconocido',
          color: 'bg-aesthetic-100 text-aesthetic-400 border-aesthetic-200',
          icon: HardDrive
        };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#332724]">
            Mis Equipos
          </h1>
          <p className="text-sm text-aesthetic-700/80 mt-1">
            Gestión técnica y telemetría de aparatología del gabinete.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabinets.map((machine) => {
          const status = getStatusConfig(machine.estado);
          return (
            <div key={machine.id} className="glass-panel overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col border border-aesthetic-200/20">
              {/* Card Header */}
              <div className="p-5 border-b border-aesthetic-200/10 bg-gradient-to-br from-white to-aesthetic-50/30">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-aesthetic-100/60 text-aesthetic-500">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.color} flex items-center space-x-1`}>
                    <status.icon className="w-3 h-3" />
                    <span>{status.label}</span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black text-[#332724] tracking-tight">{machine.name}</h3>
                <p className="text-xs text-aesthetic-500 font-bold uppercase tracking-wider">{machine.modelo || 'Modelo no especificado'}</p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-aesthetic-400">
                      <Hash className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">N° Serie</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#332724]">{machine.numeroSerie || 'S/N'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-aesthetic-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Uso Total</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#332724]">{machine.horasUso || 0} hs</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-aesthetic-200/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-aesthetic-600 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-aesthetic-400" />
                      <span>Último Service</span>
                    </div>
                    <span className="text-xs font-extrabold text-aesthetic-800">{machine.ultimoServiceFecha || 'Pendiente'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-aesthetic-600 font-bold">
                      <Wrench className="w-3.5 h-3.5 text-aesthetic-400" />
                      <span>Próximo Service</span>
                    </div>
                    <span className="text-xs font-extrabold text-aesthetic-800">{machine.proximoServiceSugerido || 'A definir'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-aesthetic-50/50 border-t border-aesthetic-200/10">
                <button
                  onClick={() => handleOpenReport(machine)}
                  className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-aesthetic-100 text-aesthetic-700 py-2.5 rounded-xl text-xs font-black border border-aesthetic-200/50 shadow-sm transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Reportar Falla / Service</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {isReportModalOpen && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#500732]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-aesthetic-200/20 animate-slide-in">
            <div className="p-6 border-b border-aesthetic-200/10 flex items-center justify-between bg-aesthetic-50/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-aesthetic-500 text-white shadow-sm">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#332724] uppercase tracking-wider">Reporte Técnico</h3>
                  <p className="text-[10px] text-aesthetic-500 font-bold">{selectedMachine.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 rounded-xl text-aesthetic-400 hover:bg-aesthetic-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!lastSavedReportId ? (
                <form onSubmit={handleSaveReport} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-aesthetic-500 uppercase tracking-widest">Descripción del Problema</label>
                    <textarea
                      required
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Describe brevemente la falla o el mantenimiento requerido..."
                      className="w-full px-4 py-3 rounded-2xl border border-aesthetic-200/30 text-sm font-medium bg-[#faf6f7] text-[#332724] focus:outline-none focus:border-aesthetic-400 min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-aesthetic-500 uppercase tracking-widest">Adjuntar Fotos</label>
                    <div className="flex items-center space-x-3">
                      <label className="flex-1 flex flex-col items-center justify-center py-6 border-2 border-dashed border-aesthetic-200/50 rounded-2xl bg-aesthetic-50/50 hover:bg-aesthetic-100/50 transition-colors cursor-pointer group">
                        <Camera className="w-6 h-6 text-aesthetic-300 group-hover:text-aesthetic-500 transition-colors" />
                        <span className="mt-2 text-[10px] font-bold text-aesthetic-400 uppercase tracking-wider">Tocar para capturar</span>
                        <input type="file" accept="image/*" className="hidden" />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-aesthetic-500 hover:bg-aesthetic-600 text-white py-4 rounded-2xl text-sm font-black shadow-md shadow-aesthetic-500/20 transition-all cursor-pointer border-none"
                  >
                    Guardar Reporte Técnico
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-6">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2 border border-emerald-100">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-[#332724]">Reporte Registrado</h4>
                    <p className="text-sm text-aesthetic-600 font-medium">El reporte ha sido guardado en el sistema local.</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={sendWhatsApp}
                      className="w-full flex items-center justify-center space-x-3 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-sm font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer border-none"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Enviar por WhatsApp a Soporte</span>
                    </button>
                    <button
                      onClick={() => setIsReportModalOpen(false)}
                      className="w-full text-aesthetic-400 hover:text-aesthetic-600 py-2 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer border-none bg-transparent"
                    >
                      Cerrar y volver
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
