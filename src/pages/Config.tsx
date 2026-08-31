import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { exportBackup, importBackup } from '../utils/backupManager';
import { 
  Settings, Download, Upload, AlertTriangle 
} from 'lucide-react';

export const Config: React.FC = () => {
  const storeState = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const {
      clients, appointments, evolutionaryRecords, products, 
      treatmentTypes, cabinets, professionals, packs, sales, cashSessions,
      purchasedPacks, serviceReports
    } = storeState;

    const dataToExport = {
      clients, appointments, evolutionaryRecords, products, 
      treatmentTypes, cabinets, professionals, packs, sales, cashSessions,
      purchasedPacks, serviceReports
    };

    exportBackup(dataToExport);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm("¡ATENCIÓN! Importar un respaldo sobrescribirá todos los datos actuales. ¿Estás completamente seguro de que deseas continuar?")) {
      try {
        const importedData = await importBackup(file);
        
        if (importedData && typeof importedData === 'object' && importedData.clients) {
          storeState.restoreState(importedData);
          alert("¡Respaldo importado y base de datos restaurada con éxito!");
        } else {
          alert("El archivo no tiene el formato correcto de EsthetiKare.");
        }
      } catch (error: any) {
        alert(error.message || "Ocurrió un error al importar el respaldo.");
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex items-center space-x-3.5 glass-panel p-6 rounded-2xl shadow-sm">
        <Settings className="w-6 h-6 text-aesthetic-500" />
        <div>
          <h2 className="text-xl font-extrabold text-[#332724]">Configuración & Respaldo</h2>
          <p className="text-xs text-aesthetic-600 font-medium mt-0.5">Gestión de base de datos local y parámetros del centro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Export Backup */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-aesthetic-200/20">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#332724] text-sm">Exportar Copia de Seguridad</h3>
              <p className="text-[10px] text-aesthetic-600 font-medium mt-0.5">Descarga un archivo .json con toda la información</p>
            </div>
          </div>
          <div className="p-4 bg-aesthetic-100/30 rounded-xl border border-aesthetic-200/20 text-xs text-aesthetic-800 leading-relaxed">
            <p>Se exportarán todos los <strong>Clientes, Fichas Clínicas, Turnos, Inventario, Punto de Venta y Arqueos de Caja</strong>. Guarda este archivo en un lugar seguro (Google Drive, pendrive o celular).</p>
          </div>
          <button 
            onClick={handleExport}
            className="w-full py-3 bg-[#332724] hover:bg-black text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Backup Local (.json)</span>
          </button>
        </div>

        {/* Import Backup */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-aesthetic-200/20">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#332724] text-sm">Restaurar Copia de Seguridad</h3>
              <p className="text-[10px] text-aesthetic-600 font-medium mt-0.5">Importa un archivo .json para recuperar datos</p>
            </div>
          </div>
          
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200/60 text-xs text-rose-800 leading-relaxed flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p><strong>Cuidado:</strong> Al importar un archivo de respaldo, se <strong>borrarán y sobrescribirán</strong> absolutamente todos los datos actuales del sistema con la información contenida en el archivo.</p>
          </div>

          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-aesthetic-500 hover:bg-aesthetic-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Seleccionar archivo y Restaurar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
