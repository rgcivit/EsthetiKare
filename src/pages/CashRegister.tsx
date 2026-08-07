import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Wallet, ArrowDownRight, ArrowUpRight, Plus, 
  Play, Power, FileText 
} from 'lucide-react';
import type { PaymentMethod } from '../types';

export const CashRegister: React.FC = () => {
  const { 
    cashSessions, openCashRegister, closeCashRegister, addCashTransaction, currentUser 
  } = useStore();

  const activeSession = cashSessions.find(s => s.status === 'open');
  const closedSessions = cashSessions.filter(s => s.status === 'closed').sort((a,b) => b.openingTime.localeCompare(a.openingTime));

  const [openAmount, setOpenAmount] = useState('');
  const openerName = currentUser?.name || 'Invitado';
  
  const [closeRealAmount, setCloseRealAmount] = useState('');
  const closerName = currentUser?.name || 'Invitado';

  const [isAddingTrans, setIsAddingTrans] = useState(false);
  const [transType, setTransType] = useState<'income' | 'expense'>('expense');
  const [transAmount, setTransAmount] = useState('');
  const [transDesc, setTransDesc] = useState('');
  const transPayMethod: PaymentMethod = 'cash';

  // Compute live statistics for the active session
  let cashIn = 0;
  let cashOut = 0;
  let expectedBalance = 0;

  if (activeSession) {
    cashIn = activeSession.transactions
      .filter(t => t.type === 'income' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
    cashOut = activeSession.transactions
      .filter(t => t.type === 'expense' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
    expectedBalance = activeSession.openingAmount + cashIn - cashOut;
  }

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openAmount);
    if (isNaN(amount) || amount < 0) {
      alert("Ingrese un monto de apertura válido.");
      return;
    }
    openCashRegister(amount, openerName);
    setOpenAmount('');
    alert("¡Caja Diaria abierta con éxito! Ya puede operar y recibir cobros en efectivo.");
  };

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const realAmount = parseFloat(closeRealAmount);
    if (isNaN(realAmount) || realAmount < 0) {
      alert("Ingrese un monto de cierre real válido.");
      return;
    }
    closeCashRegister(realAmount, closerName);
    setCloseRealAmount('');
    alert("¡Caja Diaria cerrada! Discrepancias guardadas en el historial de cierres.");
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transAmount);
    if (isNaN(amount) || amount <= 0 || !transDesc) {
      alert("Ingrese un monto mayor a cero y un concepto.");
      return;
    }

    addCashTransaction(transType, amount, transDesc, transPayMethod);
    setTransAmount('');
    setTransDesc('');
    setIsAddingTrans(false);
    alert("Movimiento de caja registrado.");
  };

  return (
    <div className="space-y-8">
      {/* Page Title banner */}
      <div className="flex items-center space-x-3.5 glass-panel p-6 rounded-2xl shadow-sm">
        <Wallet className="w-6 h-6 text-aesthetic-500" />
        <div>
          <h2 className="text-xl font-extrabold text-[#332724]">Caja Diaria & Cierres</h2>
          <p className="text-xs text-aesthetic-600 font-medium mt-0.5">Control de arqueos de caja, conciliación de efectivo y auditorías diarias</p>
        </div>
      </div>

      {!activeSession ? (
        /* 1. CLOSED REGISTER STATE (Apertura) */
        <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-aesthetic-100 rounded-2xl flex items-center justify-center text-aesthetic-500 mx-auto border border-aesthetic-200/30">
              <Power className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#332724]">La Caja Diaria se encuentra Cerrada</h3>
            <p className="text-xs text-aesthetic-600 leading-relaxed">Abra la caja para registrar transacciones en efectivo, conciliaciones de POS y control de caja chica.</p>
          </div>

          <form onSubmit={handleOpenRegister} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aesthetic-700">Monto Inicial en Efectivo *</label>
              <input 
                type="number" 
                placeholder="Ej. 15000"
                value={openAmount}
                onChange={e => setOpenAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-aesthetic-400 bg-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aesthetic-700">Usuario de Apertura</label>
              <input 
                type="text" 
                value={openerName}
                className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm bg-aesthetic-100/50 text-aesthetic-600 cursor-not-allowed"
                disabled
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-aesthetic-500 hover:bg-aesthetic-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Abrir Caja Diaria</span>
            </button>
          </form>
        </div>
      ) : (
        /* 2. OPEN REGISTER STATE (Control) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Active Ledger Transactions List (Takes 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wider">Apertura</span>
                <p className="text-lg font-black text-[#332724] mt-1">${activeSession.openingAmount.toLocaleString()}</p>
              </div>
              <div className="glass-panel p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Ingresos</span>
                <p className="text-lg font-black text-emerald-600 mt-1">+${cashIn.toLocaleString()}</p>
              </div>
              <div className="glass-panel p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Gastos/Retiros</span>
                <p className="text-lg font-black text-rose-600 mt-1">-${cashOut.toLocaleString()}</p>
              </div>
            </div>

            {/* Manual transaction form inside list area */}
            {isAddingTrans && (
              <form onSubmit={handleAddTransaction} className="glass-panel p-5 rounded-xl border-2 border-aesthetic-300 space-y-4 animate-slide-in">
                <div className="flex items-center justify-between pb-2 border-b border-aesthetic-200/20">
                  <h4 className="font-bold text-[#332724] text-xs">Registrar Entrada/Salida de Caja</h4>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTrans(false)}
                    className="text-[10px] font-bold text-aesthetic-400"
                  >
                    Cerrar
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-aesthetic-600 font-bold">Tipo Movimiento</label>
                    <select 
                      value={transType}
                      onChange={e => setTransType(e.target.value as 'income' | 'expense')}
                      className="w-full p-2 border border-aesthetic-200/30 bg-white rounded-lg text-xs text-[#332724]"
                    >
                      <option value="expense">Egreso (Gasto/Retiro)</option>
                      <option value="income">Ingreso Manual (Extra)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-aesthetic-600 font-bold">Monto ($) *</label>
                    <input 
                      type="number" 
                      value={transAmount}
                      onChange={e => setTransAmount(e.target.value)}
                      className="w-full p-2 border border-aesthetic-200/30 bg-white rounded-lg text-xs text-[#332724]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-aesthetic-600 font-bold">Descripción / Concepto *</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Insumos cafetería, flete, etc."
                    value={transDesc}
                    onChange={e => setTransDesc(e.target.value)}
                    className="w-full p-2 border border-aesthetic-200/30 bg-white rounded-lg text-xs text-[#332724]"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTrans(false)}
                    className="px-3 py-1 text-aesthetic-500 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-aesthetic-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Guardar Movimiento
                  </button>
                </div>
              </form>
            )}

            {/* Transactions audit list */}
            <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-aesthetic-200/20 bg-aesthetic-100/10 flex items-center justify-between">
                <span className="text-xs font-bold text-aesthetic-800 uppercase tracking-wider">Flujo de Fondos Recientes</span>
                <button
                  onClick={() => {
                    setIsAddingTrans(true);
                    setTransType('expense');
                  }}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-aesthetic-600 hover:text-aesthetic-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Movimiento</span>
                </button>
              </div>

              <div className="divide-y divide-aesthetic-200/10">
                {activeSession.transactions.length === 0 ? (
                  <p className="p-8 text-center text-aesthetic-500/80 text-xs italic">No hay movimientos registrados en esta sesión de caja chica.</p>
                ) : (
                  activeSession.transactions.map((trans) => (
                    <div key={trans.id} className="p-4 flex items-center justify-between text-xs hover:bg-aesthetic-100/10 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${trans.type === 'income' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100/30' : 'bg-rose-50 text-rose-500 border border-rose-100/30'}`}>
                          {trans.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-[#332724]">{trans.description}</p>
                          <p className="text-[10px] text-aesthetic-500 font-semibold mt-0.5">{trans.time.substring(11, 16)} hs • Pago en {trans.paymentMethod.toUpperCase()}</p>
                        </div>
                      </div>
                      <span className={`font-black ${trans.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trans.type === 'income' ? '+' : '-'}${trans.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* CLOSING PANEL (Takes 1/3) */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-5">
              <div className="pb-3 border-b border-aesthetic-200/20 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#332724]">Cierre de Caja</h3>
                <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100/40 px-2 py-0.5 rounded-full">ABIERTA</span>
              </div>

              <div className="bg-aesthetic-100/25 p-4 rounded-xl border border-aesthetic-200/20 flex justify-between items-center">
                <span className="text-xs font-bold text-aesthetic-600">Monto Esperado (Efectivo):</span>
                <span className="text-base font-black text-[#332724]">${expectedBalance.toLocaleString()}</span>
              </div>

              <form onSubmit={handleCloseRegister} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Monto Real Contado en Arqueo *</label>
                  <input 
                    type="number" 
                    placeholder="Monto físico contado"
                    value={closeRealAmount}
                    onChange={e => setCloseRealAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm focus:outline-none bg-white text-[#332724]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-aesthetic-700">Usuario de Cierre</label>
                  <input 
                    type="text" 
                    value={closerName}
                    className="w-full px-4 py-2.5 rounded-xl border border-aesthetic-200/30 text-sm bg-aesthetic-100/50 text-aesthetic-600 cursor-not-allowed"
                    disabled
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Power className="w-4 h-4" />
                  <span>Cerrar y Arquear Caja</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HISTORIC AUDIT FOR FINANCIAL REPORT */}
      <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-aesthetic-200/20 bg-aesthetic-100/10 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-aesthetic-400" />
          <span className="text-xs font-bold text-aesthetic-800 uppercase tracking-wider">Historial de Auditoría de Cajas Cerradas</span>
        </div>

        <div className="divide-y divide-aesthetic-200/10 overflow-x-auto">
          {closedSessions.length === 0 ? (
            <p className="p-8 text-center text-aesthetic-500/80 text-xs italic">Ningún cierre registrado todavía en este período fiscal.</p>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-aesthetic-100/30 text-[10px] font-bold text-aesthetic-600 uppercase tracking-wider border-b border-aesthetic-200/20">
                  <th className="p-4">Período de Caja</th>
                  <th className="p-4">Cajero</th>
                  <th className="p-4 text-right">Inicial (Efectivo)</th>
                  <th className="p-4 text-right">Esperado</th>
                  <th className="p-4 text-right">Real Contado</th>
                  <th className="p-4 text-center">Desviación (Faltante/Sobrante)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aesthetic-200/10">
                {closedSessions.map((session) => {
                  const discrepancy = (session.closingAmountReal || 0) - (session.closingAmountExpected || 0);
                  const discColor = discrepancy === 0 ? 'text-aesthetic-500 bg-aesthetic-100/50' : discrepancy > 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-rose-700 bg-rose-50 border border-rose-100';
                  
                  return (
                    <tr key={session.id} className="hover:bg-aesthetic-100/10 transition-colors text-[#332724]">
                      <td className="p-4 font-bold text-[#332724]">
                        {session.openingTime.substring(0, 10)} ({session.openingTime.substring(11, 16)} hs - {session.closingTime?.substring(11, 16)} hs)
                      </td>
                      <td className="p-4 font-bold text-aesthetic-700">{session.closedBy}</td>
                      <td className="p-4 text-right font-bold text-aesthetic-500">${session.openingAmount.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-aesthetic-600">${session.closingAmountExpected?.toLocaleString()}</td>
                      <td className="p-4 text-right font-black text-[#332724]">${session.closingAmountReal?.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${discColor}`}>
                          {discrepancy === 0 ? 'Sin desvíos' : discrepancy > 0 ? `+${discrepancy}` : `${discrepancy}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
