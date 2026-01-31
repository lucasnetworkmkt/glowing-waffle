import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  Copy,
  Database,
  AlertTriangle,
  Server,
  Megaphone,
  UtensilsCrossed,
  Save,
  Edit2,
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Reservation, Announcement } from '../types';
import { fetchAnnouncements, createAnnouncement, toggleAnnouncement, DEFAULT_MENU_ITEMS, resetMenuToDefaults } from '../services/supabase';

interface AdminDashboardProps {
  reservations: Reservation[];
  menuItems: any[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled') => void;
  onUpdateMenuPrice: (id: string, newPrice: number) => void;
  onAddMenuItem: (item: any) => Promise<void>;
  onLogout: () => void;
  isDbConnected: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reservations, menuItems, onUpdateStatus, onUpdateMenuPrice, onAddMenuItem, onLogout, isDbConnected }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'menu' | 'settings'>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  
  // Announcement State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Menu Edit State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [isResettingMenu, setIsResettingMenu] = useState(false);

  // Add Item State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'carnes',
    image: '',
    highlight: false
  });

  // --- DATA SANITIZATION (CRITICAL FOR STABILITY) ---
  const cleanReservations = useMemo(() => {
    if (!Array.isArray(reservations)) return [];
    return reservations.filter(r => r && typeof r === 'object' && r.id);
  }, [reservations]);

  const cleanMenuItems = useMemo(() => {
    if (!Array.isArray(menuItems)) return [];
    return menuItems.filter(i => i && typeof i === 'object' && i.id);
  }, [menuItems]);

  // SQL Command Generation
  const sqlCommand = useMemo(() => {
    return `-- COMANDO DE RECUPERAÇÃO DO SISTEMA
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS announcements;

create table reservations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name text,
  phone text,
  pax int,
  date text,
  time text,
  table_type text,
  status text default 'confirmed'
);

create table announcements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message text,
  is_active boolean default true
);

create table menu_items (
  id text primary key,
  name text,
  description text,
  price numeric,
  category text,
  highlight boolean,
  image text
);

alter table reservations enable row level security;
alter table announcements enable row level security;
alter table menu_items enable row level security;

create policy "Public Access" on reservations for all using (true) with check (true);
create policy "Public Access" on announcements for all using (true) with check (true);
create policy "Public Access" on menu_items for all using (true) with check (true);
`;
  }, []);

  // Load Announcements
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchAnnouncements().then(data => {
        if(Array.isArray(data)) setAnnouncements(data);
      });
    }
  }, [activeTab]);

  // Safe Stats
  const stats = {
    total: cleanReservations.length,
    pending: cleanReservations.filter(r => r.status === 'pending').length,
    confirmed: cleanReservations.filter(r => r.status === 'confirmed').length,
    today: cleanReservations.filter(r => {
      try {
        if (!r.date) return false;
        return r.date === new Date().toISOString().split('T')[0];
      } catch (e) { return false; }
    }).length
  };

  const filteredReservations = cleanReservations
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const copySql = () => {
    navigator.clipboard.writeText(sqlCommand);
    alert("SQL copiado!");
  };

  const handlePostAnnouncement = async () => {
    if (!newAnnouncementText.trim()) return;
    setIsPostingAnnouncement(true);
    try {
      const newItem = await createAnnouncement(newAnnouncementText);
      if (newItem) {
        setAnnouncements(prev => [newItem, ...prev]); 
        setNewAnnouncementText('');
      }
    } catch(e) {}
    setIsPostingAnnouncement(false);
  };

  const handleToggleAnnouncement = async (id: string, currentStatus: boolean) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
    await toggleAnnouncement(id, !currentStatus);
    const fresh = await fetchAnnouncements();
    if(Array.isArray(fresh)) setAnnouncements(fresh);
  };

  const startEditingPrice = (item: any) => {
    if (!item) return;
    setEditingPriceId(item.id);
    const val = item.price !== undefined && item.price !== null ? item.price : 0;
    setTempPrice(String(val));
  };

  const savePrice = (id: string) => {
    const newPrice = parseFloat(tempPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onUpdateMenuPrice(id, newPrice);
      setEditingPriceId(null);
    }
  };

  const formatPrice = (p: any) => {
    const num = parseFloat(p);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleResetMenu = async () => {
    if (confirm("Resetar cardápio para o padrão?")) {
      setIsResettingMenu(true);
      try {
        await resetMenuToDefaults();
        window.location.reload();
      } catch (e) {
        alert("Erro ao resetar.");
      } finally {
        setIsResettingMenu(false);
      }
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.price) return;
    
    await onAddMenuItem({
      name: newItemData.name,
      description: newItemData.description,
      price: parseFloat(newItemData.price),
      category: newItemData.category,
      image: newItemData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      popular: newItemData.highlight
    });
    
    setShowAddForm(false);
    setNewItemData({ name: '', description: '', price: '', category: 'carnes', image: '', highlight: false });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans flex animate-in fade-in duration-500">
      
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-6 border-b border-stone-800">
          <h1 className="font-serif text-2xl font-bold text-white tracking-widest">FUEGO<span className="text-orange-600">.OS</span></h1>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Visão Geral</span>
          </button>
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reservations' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <CalendarDays size={20} />
            <span className="font-medium">Reservas</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'menu' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <UtensilsCrossed size={20} />
            <span className="font-medium">Cardápio</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <Settings size={20} />
            <span className="font-medium">Configurações</span>
          </button>
        </nav>

        <div className="p-4 border-t border-stone-800">
           <div className={`mb-4 rounded-xl p-3 border ${isDbConnected ? 'bg-emerald-900/20 border-emerald-800' : 'bg-red-900/20 border-red-800'}`}>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                 <span className="text-xs font-bold text-white">
                   {isDbConnected ? 'Online' : 'Offline'}
                 </span>
              </div>
           </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-400 hover:bg-red-900/20 hover:text-red-400">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-white capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
              <Users size={20} className="text-stone-400" />
            </div>
          </div>
        </header>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800">
                <p className="text-stone-500 text-sm">Hoje</p>
                <h3 className="text-3xl font-bold text-white">{stats.today}</h3>
              </div>
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800">
                <p className="text-stone-500 text-sm">Pendentes</p>
                <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
              </div>
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800">
                <p className="text-stone-500 text-sm">Confirmadas</p>
                <h3 className="text-3xl font-bold text-white">{stats.confirmed}</h3>
              </div>
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800">
                <p className="text-stone-500 text-sm">Total</p>
                <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
              </div>
            </div>
          </div>
        )}

        {/* RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
             <div className="p-6">
               <div className="flex gap-2 mb-4">
                 {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
                   <button 
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-3 py-1 rounded text-xs uppercase font-bold ${filterStatus === status ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400'}`}
                   >
                     {status === 'all' ? 'Todas' : status}
                   </button>
                 ))}
               </div>
               {filteredReservations.length === 0 && (
                 <p className="text-stone-500 text-center py-8">Nenhuma reserva encontrada.</p>
               )}
               {filteredReservations.map(res => (
                  <div key={res.id} className="p-4 border-b border-stone-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{res.clientName || 'Cliente'}</p>
                      <p className="text-xs text-stone-500">{res.date} • {res.time} • {res.pax}</p>
                      <span className={`text-[10px] uppercase font-bold ${res.status === 'confirmed' ? 'text-emerald-500' : res.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>
                        {res.status}
                      </span>
                    </div>
                    {res.status === 'pending' && (
                       <div className="flex gap-2">
                         <button onClick={() => onUpdateStatus(res.id, 'confirmed')} className="p-2 bg-emerald-500/20 text-emerald-500 rounded"><CheckCircle size={16}/></button>
                         <button onClick={() => onUpdateStatus(res.id, 'cancelled')} className="p-2 bg-red-500/20 text-red-500 rounded"><XCircle size={16}/></button>
                       </div>
                    )}
                  </div>
               ))}
             </div>
          </div>
        )}

        {/* MENU TAB - NEW ADD FEATURE */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
             {/* ADD ITEM CARD */}
             <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-orange-500" />
                    Gerenciar Cardápio
                  </h3>
                  <div className="flex gap-4">
                     <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-700 transition-all">
                       <Plus size={16} /> Novo Prato
                     </button>
                     <button onClick={handleResetMenu} className="text-xs text-red-400 underline hover:text-red-300">
                       Resetar Tabela
                     </button>
                  </div>
                </div>

                {showAddForm && (
                  <form onSubmit={handleCreateItem} className="bg-stone-950 p-6 rounded-xl border border-stone-800 mb-6 animate-in slide-in-from-top-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-xs text-stone-500 uppercase font-bold">Nome do Prato</label>
                          <input 
                            required 
                            className="w-full bg-stone-900 border border-stone-800 p-2 rounded text-white"
                            value={newItemData.name}
                            onChange={e => setNewItemData({...newItemData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-stone-500 uppercase font-bold">Preço (R$)</label>
                          <input 
                            required 
                            type="number" 
                            step="0.01" 
                            className="w-full bg-stone-900 border border-stone-800 p-2 rounded text-white"
                            value={newItemData.price}
                            onChange={e => setNewItemData({...newItemData, price: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-stone-500 uppercase font-bold">Categoria</label>
                          <select 
                            className="w-full bg-stone-900 border border-stone-800 p-2 rounded text-white"
                            value={newItemData.category}
                            onChange={e => setNewItemData({...newItemData, category: e.target.value})}
                          >
                             <option value="carnes">Carnes Nobres</option>
                             <option value="massas">Massas Artesanais</option>
                             <option value="entradas">Entradas</option>
                             <option value="sobremesas">Sobremesas</option>
                             <option value="vinhos">Vinhos & Drinks</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-stone-500 uppercase font-bold">URL da Imagem</label>
                          <input 
                            placeholder="https://..." 
                            className="w-full bg-stone-900 border border-stone-800 p-2 rounded text-white"
                            value={newItemData.image}
                            onChange={e => setNewItemData({...newItemData, image: e.target.value})}
                          />
                        </div>
                        <div className="col-span-full space-y-1">
                          <label className="text-xs text-stone-500 uppercase font-bold">Descrição</label>
                          <textarea 
                            className="w-full bg-stone-900 border border-stone-800 p-2 rounded text-white h-20 resize-none"
                            value={newItemData.description}
                            onChange={e => setNewItemData({...newItemData, description: e.target.value})}
                          />
                        </div>
                        <div className="col-span-full flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="highlight"
                            className="w-4 h-4 accent-orange-500"
                            checked={newItemData.highlight}
                            onChange={e => setNewItemData({...newItemData, highlight: e.target.checked})}
                          />
                          <label htmlFor="highlight" className="text-sm text-white">Destacar este item (Aparecerá em "Destaques")</label>
                        </div>
                     </div>
                     <div className="flex gap-3">
                       <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Salvar Prato</button>
                       <button type="button" onClick={() => setShowAddForm(false)} className="bg-stone-800 hover:bg-stone-700 text-white py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                     </div>
                  </form>
                )}
             
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cleanMenuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-stone-950 p-3 rounded border border-stone-800 hover:border-orange-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {item.image && <img src={item.image} className="w-10 h-10 rounded object-cover bg-stone-900" alt="" />}
                          <div>
                            <p className="font-bold text-sm text-white">{item.name}</p>
                            <p className="text-xs text-stone-500 capitalize">{item.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {editingPriceId === item.id ? (
                            <div className="flex items-center gap-1">
                              <input 
                                  type="number"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-16 bg-stone-800 border border-stone-600 rounded px-1 py-1 text-white text-sm"
                              />
                              <button onClick={() => savePrice(item.id)} className="p-1 bg-emerald-600 rounded text-white"><Save size={14}/></button>
                              <button onClick={() => setEditingPriceId(null)} className="p-1 bg-stone-700 rounded text-white"><X size={14}/></button>
                            </div>
                          ) : (
                            <>
                                <span className="font-bold text-emerald-400 text-sm">R$ {formatPrice(item.price)}</span>
                                <button onClick={() => startEditingPrice(item)} className="p-1 text-stone-500 hover:text-white" title="Editar Preço"><Edit2 size={14}/></button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {cleanMenuItems.length === 0 && <p className="text-stone-500 p-4">Sem itens. Adicione um novo prato acima.</p>}
                </div>
             </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
           <div className="space-y-6">
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800">
                 <h3 className="font-bold text-white mb-4">Avisos do Site</h3>
                 <div className="flex gap-2 mb-4">
                    <input 
                      className="flex-1 bg-stone-950 border border-stone-700 rounded p-2 text-white"
                      placeholder="Novo aviso..."
                      value={newAnnouncementText}
                      onChange={(e) => setNewAnnouncementText(e.target.value)}
                    />
                    <button onClick={handlePostAnnouncement} className="bg-orange-600 text-white px-4 rounded font-bold">Criar</button>
                 </div>
                 <div className="space-y-2">
                    {announcements.map(ann => (
                      <div key={ann.id} className="flex justify-between items-center p-3 bg-stone-950 rounded border border-stone-800">
                         <span className={ann.isActive ? 'text-white' : 'text-stone-500'}>{ann.message}</span>
                         <button onClick={() => handleToggleAnnouncement(ann.id, ann.isActive)} className="text-xs underline text-orange-500">
                           {ann.isActive ? 'Desativar' : 'Ativar'}
                         </button>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800">
                 <h3 className="font-bold text-white mb-2">Banco de Dados</h3>
                 <p className="text-xs text-stone-500 mb-4">Se não houver cardápio, copie e rode o SQL abaixo no Supabase.</p>
                 <div className="bg-black p-4 rounded text-xs font-mono text-emerald-400 overflow-x-auto relative">
                    <pre>{sqlCommand}</pre>
                    <button onClick={copySql} className="absolute top-2 right-2 bg-stone-800 px-2 py-1 rounded text-white">Copiar</button>
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;