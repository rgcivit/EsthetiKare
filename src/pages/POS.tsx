import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShoppingCart, Plus, Minus, Trash, Check, 
  User, CreditCard, Tag, Package, UserCheck 
} from 'lucide-react';
import type { SaleItem, PaymentMethod } from '../types';

export const POS: React.FC = () => {
  const { 
    clients, products, packs, professionals, processSale, cashSessions 
  } = useStore();

  const activeCashSession = cashSessions.find(s => s.status === 'open');

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(professionals[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cart, setCart] = useState<SaleItem[]>([]);

  // Add a product or package to the cart
  const addToCart = (item: { id: string; name: string; price: number; type: 'product' | 'pack' }) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        return prevCart.map((i) => 
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prevCart,
        {
          id: item.id,
          name: item.name,
          type: item.type,
          quantity: 1,
          unitPrice: item.price,
          totalPrice: item.price
        }
      ];
    });
  };

  const updateQuantity = (id: string, type: SaleItem['type'], delta: number) => {
    setCart((prevCart) => 
      prevCart.map((i) => {
        if (i.id === id && i.type === type) {
          const newQty = Math.max(1, i.quantity + delta);
          return {
            ...i,
            quantity: newQty,
            totalPrice: newQty * i.unitPrice
          };
        }
        return i;
      })
    );
  };

  const removeFromCart = (id: string, type: SaleItem['type']) => {
    setCart((prevCart) => prevCart.filter((i) => !(i.id === id && i.type === type)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("La cesta está vacía.");
      return;
    }

    if (paymentMethod === 'cash' && !activeCashSession) {
      alert("Para transacciones en EFECTIVO, debe abrir la Caja Diaria primero en el módulo de Caja.");
      return;
    }

    // Process checkout
    processSale({
      clientId: selectedClientId || undefined,
      items: cart,
      total: cartTotal,
      paymentMethod,
      professionalId: selectedProfessionalId
    });

    setCart([]);
    setSelectedClientId('');
    alert("¡Venta completada con éxito! Se han descontado los productos del stock e incrementado los saldos de sesiones del cliente si correspondía.");
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex items-center space-x-3.5 glass-panel p-6 rounded-2xl shadow-sm">
        <ShoppingCart className="w-6 h-6 text-aesthetic-500" />
        <div>
          <h2 className="text-xl font-extrabold text-[#332724]">Terminal de Ventas (POS)</h2>
          <p className="text-xs text-aesthetic-600 font-medium mt-0.5">Venta directa de productos cosméticos y paquetes de sesiones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 1. PRODUCT & PACK SELECTOR (Takes 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Physical products section */}
          <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-aesthetic-800 uppercase tracking-wider flex items-center space-x-2">
              <Package className="w-4 h-4 text-aesthetic-500" />
              <span>Productos Cosméticos</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <div 
                  key={p.id} 
                  className="p-4 rounded-xl border border-aesthetic-200/15 hover:border-aesthetic-300 hover:bg-aesthetic-100/10 bg-white/40 transition-all flex justify-between items-center"
                >
                  <div className="min-w-0 pr-4">
                    <h4 className="font-extrabold text-[#332724] text-xs truncate">{p.name}</h4>
                    <p className="text-[10px] text-aesthetic-600 font-bold mt-0.5">Precio: <span className="text-aesthetic-800">${p.price.toLocaleString()}</span></p>
                    <p className="text-[10px] text-aesthetic-500 font-semibold">Stock: {p.stock} unids</p>
                  </div>
                  <button
                    onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, type: 'product' })}
                    disabled={p.stock === 0}
                    className={`p-2 rounded-lg transition-colors shadow-sm cursor-pointer ${
                      p.stock === 0 
                        ? 'bg-aesthetic-100 text-aesthetic-300 cursor-not-allowed border border-aesthetic-200/10' 
                        : 'bg-aesthetic-100/60 text-aesthetic-700 hover:bg-aesthetic-500 hover:text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Session packs section */}
          <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-aesthetic-800 uppercase tracking-wider flex items-center space-x-2">
              <Tag className="w-4 h-4 text-aesthetic-500" />
              <span>Packs de Tratamientos (Sesiones)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packs.map((pack) => (
                <div 
                  key={pack.id} 
                  className="p-4 rounded-xl border border-aesthetic-200/15 hover:border-aesthetic-300 hover:bg-aesthetic-100/10 bg-white/40 transition-all flex justify-between items-center"
                >
                  <div className="min-w-0 pr-4">
                    <h4 className="font-extrabold text-[#332724] text-xs truncate">{pack.name}</h4>
                    <p className="text-[10px] text-aesthetic-600 font-bold mt-0.5">Precio: <span className="text-aesthetic-800">${pack.price.toLocaleString()}</span></p>
                    <p className="text-[10px] text-sage-600 font-bold bg-sage-50 px-2 py-0.5 rounded-full inline-block mt-1">Incluye {pack.sessionCount} sesiones</p>
                  </div>
                  <button
                    onClick={() => addToCart({ id: pack.id, name: pack.name, price: pack.price, type: 'pack' })}
                    className="p-2 rounded-lg bg-aesthetic-100/60 text-aesthetic-700 hover:bg-aesthetic-500 hover:text-white transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. CHECKOUT CART AND SETTINGS (Takes 1/3) */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-6">
          <div className="pb-3 border-b border-aesthetic-200/20 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#332724]">Cesta de Compra ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-[10px] font-bold text-rose-500 hover:underline uppercase cursor-pointer"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Cart list */}
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-aesthetic-500/80 italic py-6 text-center">La cesta está vacía. Seleccione productos de la izquierda.</p>
            ) : (
              cart.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between text-xs py-1">
                  <div className="min-w-0 pr-2">
                    <p className="font-extrabold text-[#332724] truncate">{item.name}</p>
                    <p className="text-[10px] text-aesthetic-600 font-bold mt-0.5">${item.unitPrice.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button 
                      onClick={() => updateQuantity(item.id, item.type, -1)}
                      className="p-1 rounded bg-aesthetic-100 text-aesthetic-700 hover:bg-aesthetic-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-black text-aesthetic-800 min-w-[15px] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.type, 1)}
                      className="p-1 rounded bg-aesthetic-100 text-aesthetic-700 hover:bg-aesthetic-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.id, item.type)}
                      className="p-1 rounded bg-rose-50 text-rose-500 hover:bg-rose-100 ml-1 cursor-pointer"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-aesthetic-200/20 pt-4 space-y-4">
            {/* Total display */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-aesthetic-600">Monto Total:</span>
              <span className="text-lg font-black text-aesthetic-900">${cartTotal.toLocaleString()}</span>
            </div>

            {/* Client selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Vincular Cliente</span>
              </label>
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-xl text-xs focus:outline-none bg-white/60 text-[#332724]"
              >
                <option value="">Cliente Ocasional / Anónimo</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.dni})</option>
                ))}
              </select>
            </div>

            {/* Professional attribution */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide flex items-center space-x-1">
                <UserCheck className="w-3 h-3" />
                <span>Especialista que Atendió</span>
              </label>
              <select 
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-xl text-xs focus:outline-none bg-white/60 text-[#332724]"
              >
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-aesthetic-500 uppercase tracking-wide flex items-center space-x-1">
                <CreditCard className="w-3 h-3" />
                <span>Método de Pago</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['cash', 'transfer', 'card'] as PaymentMethod[]).map((method) => {
                  const labelMap = { cash: 'Efectivo', transfer: 'Transf.', card: 'Tarjeta' };
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-aesthetic-500 bg-aesthetic-100/60 text-aesthetic-800 shadow-sm' 
                          : 'border-aesthetic-200/30 text-aesthetic-400 hover:border-aesthetic-300 bg-white/30'
                      }`}
                    >
                      {labelMap[method]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer ${
                cart.length === 0 
                  ? 'bg-aesthetic-100 text-aesthetic-300 cursor-not-allowed border border-aesthetic-200/10' 
                  : 'bg-gradient-to-tr from-aesthetic-600 to-aesthetic-500 hover:from-aesthetic-700 hover:to-aesthetic-600 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Cerrar Venta POS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
