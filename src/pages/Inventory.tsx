import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Package, Search, Plus, Tag, Edit2, Trash2, X
} from 'lucide-react';
import type { ProductCategory, Product, PackOfSessions } from '../types';

export const Inventory: React.FC = () => {
  const {
    products, addProduct, updateProduct, deleteProduct,
    packs, addPack, updatePack, deletePack,
    treatmentTypes
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isAddingPack, setIsAddingPack] = useState(false);
  const [editingPack, setEditingPack] = useState<PackOfSessions | null>(null);

  // New product form state
  const [newProd, setNewProd] = useState({
    code: '',
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    category: 'cream' as ProductCategory
  });

  // New pack form state
  const [newPack, setNewPack] = useState({
    name: '',
    treatmentTypeId: treatmentTypes[0]?.id || '',
    sessionCount: 6,
    price: 0
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.code || !newProd.name || newProd.price <= 0) {
      alert("Por favor complete código, nombre y precio.");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, newProd);
      setEditingProduct(null);
      alert("Producto actualizado con éxito.");
    } else {
      addProduct(newProd);
      alert("Producto agregado con éxito.");
    }

    setIsAddingProduct(false);
    setNewProd({
      code: '',
      name: '',
      description: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      category: 'cream'
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto del inventario?")) {
      deleteProduct(id);
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setNewProd({ ...prod });
    setIsAddingProduct(true);
  };

  const handleAddPackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPack.name || newPack.price <= 0) {
      alert("Por favor complete nombre y precio del pack.");
      return;
    }

    if (editingPack) {
      updatePack(editingPack.id, newPack);
      setEditingPack(null);
      alert("Pack actualizado con éxito.");
    } else {
      addPack(newPack);
      alert("Pack agregado con éxito.");
    }

    setIsAddingPack(false);
    setNewPack({
      name: '',
      treatmentTypeId: treatmentTypes[0]?.id || '',
      sessionCount: 6,
      price: 0
    });
  };

  const handleDeletePack = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este pack de sesiones?")) {
      deletePack(id);
    }
  };

  const handleEditPack = (pack: PackOfSessions) => {
    setEditingPack(pack);
    setNewPack({ ...pack });
    setIsAddingPack(true);
  };

  const categoryLabels: Record<ProductCategory, string> = {
    cream: 'Cremas',
    gel: 'Geles',
    supplement: 'Suplementos',
    cabin_use: 'Uso en Gabinete',
    other: 'Otros'
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel p-6 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <Package className="w-6 h-6 text-aesthetic-500" />
          <div>
            <h2 className="text-xl font-extrabold text-[#332724]">Inventario & Packs</h2>
            <p className="text-xs text-aesthetic-600 font-medium mt-0.5">Control de mercadería física y saldo de packs de servicios</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAddingProduct(true)}
          className="inline-flex items-center space-x-2 bg-aesthetic-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-aesthetic-600 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* MAIN INVENTORY TABLE (Takes 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {isAddingProduct && (
            <div className="glass-panel p-6 rounded-2xl border-2 border-aesthetic-300 shadow-md space-y-6 animate-slide-in">
              <div className="flex items-center justify-between pb-3 border-b border-aesthetic-200/20">
                <h3 className="font-bold text-[#332724] text-sm">
                  {editingProduct ? 'Editar Producto' : 'Cargar Nuevo Producto'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="px-2 py-1 rounded bg-aesthetic-100 text-aesthetic-600 hover:bg-aesthetic-200 text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Código de Barras/SKU *</label>
                  <input 
                    type="text" 
                    value={newProd.code}
                    onChange={e => setNewProd({...newProd, code: e.target.value})}
                    placeholder="Ej. AHA-REGEN-50"
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Nombre Comercial *</label>
                  <input 
                    type="text" 
                    value={newProd.name}
                    onChange={e => setNewProd({...newProd, name: e.target.value})}
                    placeholder="Ej. Crema Regeneradora Facial"
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Categoría *</label>
                  <select 
                    value={newProd.category}
                    onChange={e => setNewProd({...newProd, category: e.target.value as ProductCategory})}
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]"
                  >
                    {Object.entries(categoryLabels).map(([cat, label]) => (
                      <option key={cat} value={cat}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Costo ($) *</label>
                  <input 
                    type="number" 
                    value={newProd.cost}
                    onChange={e => setNewProd({...newProd, cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Precio de Venta ($) *</label>
                  <input 
                    type="number" 
                    value={newProd.price}
                    onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Stock Inicial *</label>
                  <input 
                    type="number" 
                    value={newProd.stock}
                    onChange={e => setNewProd({...newProd, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Stock Mínimo (Alerta) *</label>
                  <input 
                    type="number" 
                    value={newProd.minStock}
                    onChange={e => setNewProd({...newProd, minStock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]" 
                    required
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-aesthetic-700">Descripción</label>
                  <input 
                    type="text" 
                    value={newProd.description}
                    onChange={e => setNewProd({...newProd, description: e.target.value})}
                    placeholder="Detalle o modo de uso..."
                    className="w-full px-3 py-2 border border-aesthetic-200/30 rounded-lg text-xs focus:outline-none bg-white text-[#332724]" 
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end space-x-2 pt-2 border-t border-aesthetic-200/10">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingProduct(false)}
                    className="px-4 py-2 border border-aesthetic-200/30 text-aesthetic-700 text-xs rounded-lg font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-aesthetic-500 text-white text-xs font-bold rounded-lg hover:bg-aesthetic-600 shadow-sm"
                  >
                    Registrar Producto
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
            {/* Search and Quick Categories Filter */}
            <div className="p-6 border-b border-aesthetic-200/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-aesthetic-400" />
                <input 
                  type="text" 
                  placeholder="Buscar código o nombre..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-aesthetic-200/30 rounded-xl focus:outline-none bg-white/50 text-[#332724]"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === 'all' 
                      ? 'bg-aesthetic-500 text-white shadow-sm' 
                      : 'bg-aesthetic-100/50 text-aesthetic-500 hover:bg-aesthetic-200/30'
                  }`}
                >
                  Todos
                </button>
                {Object.entries(categoryLabels).map(([cat, label]) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-aesthetic-500 text-white shadow-sm' 
                        : 'bg-aesthetic-100/50 text-aesthetic-500 hover:bg-aesthetic-200/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-aesthetic-100/30 border-b border-aesthetic-200/20 text-[10px] font-bold text-aesthetic-600 uppercase tracking-wider">
                    <th className="p-4">SKU / Producto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4 text-right">Costo</th>
                    <th className="p-4 text-right">Precio Venta</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aesthetic-200/10">
                  {filteredProducts.map((prod) => {
                    const isCriticallyLow = prod.stock <= prod.minStock;
                    const isMildlyLow = prod.stock <= prod.minStock + 2 && prod.stock > prod.minStock;

                    let stockBadge = 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
                    let stockText = 'Disponible';
                    if (isCriticallyLow) {
                      stockBadge = 'bg-rose-50 text-rose-600 border-rose-200/60 animate-pulse';
                      stockText = 'CRÍTICO';
                    } else if (isMildlyLow) {
                      stockBadge = 'bg-amber-50 text-amber-600 border-amber-200/60';
                      stockText = 'Bajo';
                    }

                    return (
                      <tr key={prod.id} className="hover:bg-aesthetic-100/10 transition-colors text-xs text-[#332724]">
                        <td className="p-4">
                          <p className="font-extrabold text-[#332724]">{prod.name}</p>
                          <p className="text-[10px] text-aesthetic-500 font-semibold mt-0.5">SKU: {prod.code}</p>
                        </td>
                        <td className="p-4 text-aesthetic-700 font-bold">{categoryLabels[prod.category]}</td>
                        <td className="p-4 text-right text-aesthetic-600 font-bold">${prod.cost.toLocaleString()}</td>
                        <td className="p-4 text-right text-[#332724] font-black">${prod.price.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 font-extrabold rounded-lg ${isCriticallyLow ? 'text-rose-600 bg-rose-50' : 'text-aesthetic-800 bg-aesthetic-100/50'}`}>
                            {prod.stock} unids
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${stockBadge}`}>
                            {stockText}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-1.5 rounded-lg text-aesthetic-500 hover:bg-aesthetic-100 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SESSION PACKS LIST (Takes 1/3) */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-aesthetic-200/20 mb-5">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-aesthetic-500" />
                <h3 className="text-sm font-bold text-[#332724]">Packs de Sesiones</h3>
              </div>
              <button
                onClick={() => setIsAddingPack(true)}
                className="p-1.5 rounded-lg bg-aesthetic-100 text-aesthetic-600 hover:bg-aesthetic-200 transition-colors"
                title="Nuevo Pack"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {isAddingPack && (
              <div className="mb-6 p-4 rounded-xl border-2 border-aesthetic-200 bg-white space-y-4 animate-slide-in">
                <h4 className="text-xs font-black text-[#332724] uppercase">{editingPack ? 'Editar Pack' : 'Crear Pack'}</h4>
                <form onSubmit={handleAddPackSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-aesthetic-500 uppercase">Nombre</label>
                    <input
                      type="text"
                      value={newPack.name}
                      onChange={e => setNewPack({...newPack, name: e.target.value})}
                      placeholder="Ej. Pack Criolipólisis x6"
                      className="w-full px-3 py-2 border border-aesthetic-100 rounded-lg text-xs focus:outline-none bg-[#faf6f7]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-aesthetic-500 uppercase">Tratamiento</label>
                    <select
                      value={newPack.treatmentTypeId}
                      onChange={e => setNewPack({...newPack, treatmentTypeId: e.target.value})}
                      className="w-full px-3 py-2 border border-aesthetic-100 rounded-lg text-xs focus:outline-none bg-[#faf6f7]"
                    >
                      {treatmentTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-aesthetic-500 uppercase">Cant. Sesiones</label>
                      <input
                        type="number"
                        value={newPack.sessionCount}
                        onChange={e => setNewPack({...newPack, sessionCount: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-aesthetic-100 rounded-lg text-xs focus:outline-none bg-[#faf6f7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-aesthetic-500 uppercase">Precio ($)</label>
                      <input
                        type="number"
                        value={newPack.price}
                        onChange={e => setNewPack({...newPack, price: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-aesthetic-100 rounded-lg text-xs focus:outline-none bg-[#faf6f7]"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPack(false);
                        setEditingPack(null);
                      }}
                      className="flex-1 py-2 rounded-lg border border-aesthetic-100 text-[10px] font-bold text-aesthetic-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-aesthetic-500 text-white text-[10px] font-black uppercase tracking-widest shadow-sm"
                    >
                      {editingPack ? 'Guardar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {packs.map(pack => {
                const treatment = treatmentTypes.find(t => t.id === pack.treatmentTypeId);
                return (
                  <div key={pack.id} className="p-4 rounded-xl border border-aesthetic-200/20 bg-white/40 space-y-3 group hover:border-aesthetic-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <h4 className="font-extrabold text-[#332724] text-xs">{pack.name}</h4>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-aesthetic-600">${pack.price.toLocaleString()}</span>
                        <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                             onClick={() => handleEditPack(pack)}
                             className="p-1 rounded bg-aesthetic-50 text-aesthetic-500 hover:bg-aesthetic-100"
                           >
                             <Edit2 className="w-3 h-3" />
                           </button>
                           <button
                             onClick={() => handleDeletePack(pack.id)}
                             className="p-1 rounded bg-rose-50 text-rose-400 hover:bg-rose-100"
                           >
                             <Trash2 className="w-3 h-3" />
                           </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-aesthetic-500 font-semibold">
                      <span>Carga: {pack.sessionCount} sesiones</span>
                      <span className="bg-white/80 border border-aesthetic-200/15 px-2 py-0.5 rounded-full text-aesthetic-800 font-bold">
                        {treatment?.name || 'Tratamiento'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
