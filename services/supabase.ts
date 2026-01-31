import { createClient } from '@supabase/supabase-js';
import { Reservation, MenuItem, Announcement } from '../types';

// --- CONFIGURAÇÃO DO SUPABASE ---
// COLOQUE AQUI AS CHAVES DO SEU NOVO PROJETO
// Enquanto estiverem vazias (''), o site funcionará em MODO OFFLINE (exibindo o cardápio padrão).
const SUPABASE_URL = 'https://xylglivnfztzumbruzzh.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bGdsaXZuZnp0enVtYnJ1enpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTQ0MDIsImV4cCI6MjA4NTM5MDQwMn0.30MazvSdAa_rcf3vGzvv771BX-GVB0j2BTRQn5-A_7M';

// Verifica se as chaves foram configuradas
const hasCredentials = SUPABASE_URL && SUPABASE_ANON_KEY;
export const supabase = createClient(
  hasCredentials ? SUPABASE_URL : 'https://placeholder.supabase.co', 
  hasCredentials ? SUPABASE_ANON_KEY : 'placeholder'
);

const STORAGE_KEY = 'fuego_reservations';
const ANNOUNCEMENT_KEY = 'fuego_announcements';
const MENU_KEY = 'fuego_menu_v7'; // Bump version to clear potential stuck cache

// Connection Status Flag
export let isSystemOffline = !hasCredentials;

// --- DEFAULT DATA (Exported for initial state) ---
export const DEFAULT_MENU_ITEMS: any[] = [
  {
    id: '1',
    name: "Prime Tomahawk Gold",
    description: "Corte nobre de 800g com osso, finalizado na manteiga de ervas e flor de sal.",
    price: 189.90,
    category: "carnes",
    highlight: true,
    image: "https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '2',
    name: "Bife de Chorizo Angus",
    description: "Suculência extrema, grelhado ao ponto do chef. Acompanha batatas rústicas.",
    price: 89.90,
    category: "carnes",
    highlight: true,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '3',
    name: "Costela Defumada BBQ",
    description: "Assada lentamente por 12 horas, desmancha no garfo. Molho barbecue artesanal.",
    price: 75.00,
    category: "carnes",
    highlight: false,
    image: "https://img.freepik.com/fotos-premium/costelinha-de-porco-estilo-americano-deliciosas-costelinhas-de-porco-defumadas-com-cobertura-de-molho-barbecue-vista-de-cima_946881-13.jpg"
  },
  {
    id: '4',
    name: "Ancho Premium",
    description: "Corte dianteiro do contrafilé, marmoreio intenso e sabor inigualável.",
    price: 92.00,
    category: "carnes",
    highlight: false,
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800"
  },
  // Massas
  {
    id: '5',
    name: "Gnocchi ao Funghi Trufado",
    description: "Massa fresca de batata, molho cremoso de cogumelos selvagens e azeite trufado.",
    price: 68.00,
    category: "massas",
    highlight: true,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '6',
    name: "Carbonara Autêntica",
    description: "Sem creme de leite. Gema caipira, pecorino romano, guanciale e pimenta negra.",
    price: 62.00,
    category: "massas",
    highlight: true,
    image: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '7',
    name: "Risoto de Camarão",
    description: "Arroz arbóreo, camarões rosa grandes, limão siciliano e parmesão.",
    price: 79.00,
    category: "massas",
    highlight: false,
    image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '8',
    name: "Lasagna Bolognese",
    description: "Camadas finas de massa, ragu de carne cozido por 6h e molho bechamel.",
    price: 58.00,
    category: "massas",
    highlight: false,
    image: "https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&q=80&w=800"
  },
  // Entradas
  {
    id: '9',
    name: "Burrata Caprese",
    description: "Burrata cremosa, tomates confit, pesto de manjericão fresco e torradas.",
    price: 55.00,
    category: "entradas",
    highlight: true,
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '10',
    name: "Carpaccio Clássico",
    description: "Lâminas finíssimas de carne crua, alcaparras, parmesão e mostarda.",
    price: 48.00,
    category: "entradas",
    highlight: false,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '11',
    name: "Bruschetta Pomodoro",
    description: "Pão italiano tostado, tomates frescos, alho e manjericão.",
    price: 32.00,
    category: "entradas",
    highlight: false,
    image: "https://trattorialapasta.com/cms-data/blog/menu/bruschetta-al-pomodoro/image/bruschetta-al-pomodoro.jpg"
  },
  {
    id: '12',
    name: "Dadinhos de Queijo Coalho",
    description: "Crocantes por fora, macios por dentro. Acompanha geleia de pimenta.",
    price: 35.00,
    category: "entradas",
    highlight: false,
    image: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&q=80&w=800"
  },
  // Sobremesas
  {
    id: '13',
    name: "Volcán de Dulce de Leche",
    description: "Petit gateau de doce de leite argentino com sorvete de baunilha.",
    price: 32.00,
    category: "sobremesas",
    highlight: true,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '14',
    name: "Tiramisu Fuego",
    description: "A clássica receita italiana com um toque de conhaque.",
    price: 28.00,
    category: "sobremesas",
    highlight: false,
    image: "https://desxestal.com/wp-content/uploads/2021/04/desxestal_tiramisu-scaled.jpg"
  },
  {
    id: '15',
    name: "Cheesecake de Frutas Vermelhas",
    description: "Base crocante, creme suave e calda rústica de frutas.",
    price: 29.00,
    category: "sobremesas",
    highlight: false,
    image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&q=80&w=800"
  },
  // Vinhos
  {
    id: '16',
    name: "Malbec Reserva",
    description: "Vinho tinto encorpado, notas de ameixa e baunilha. Safra especial.",
    price: 140.00,
    category: "vinhos",
    highlight: false,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '17',
    name: "Fuego Signature Drink",
    description: "Gin, infusão de hibisco, tônica e defumação de alecrim.",
    price: 38.00,
    category: "vinhos",
    highlight: true,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800"
  }
];

// Fallback: LocalStorage Helpers
const getLocalData = (): Reservation[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

const setLocalData = (data: Reservation[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const getLocalAnnouncements = (): Announcement[] => {
  try {
    const saved = localStorage.getItem(ANNOUNCEMENT_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

const setLocalAnnouncements = (data: Announcement[]) => localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(data));

const getLocalMenu = (): any[] => {
  try {
    const saved = localStorage.getItem(MENU_KEY);
    // CRITICAL FIX: Allow empty array return if saved, don't force DEFAULTS immediately
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    return DEFAULT_MENU_ITEMS;
  } catch (e) { return DEFAULT_MENU_ITEMS; }
};

const setLocalMenu = (data: any[]) => localStorage.setItem(MENU_KEY, JSON.stringify(data));

/**
 * Checks if the connection to Supabase is truly working
 */
export const checkConnection = async (): Promise<boolean> => {
  if (!hasCredentials) {
    isSystemOffline = true;
    return false;
  }
  try {
    const { error } = await supabase.from('reservations').select('*', { count: 'exact', head: true });
    if (error) {
      // Don't log annoying warnings, just handle gracefully
      isSystemOffline = true;
      return false;
    }
    isSystemOffline = false;
    return true;
  } catch (e) {
    isSystemOffline = true;
    return false;
  }
};

/**
 * --- MENU SERVICES (CRITICAL FIX) ---
 */

export const fetchMenu = async (): Promise<any[]> => {
  // HELPER: Filter out "Teste" and "po" as requested by user
  const cleanFilter = (items: any[]) => items.filter(i => {
    const name = (i.name || '').trim().toLowerCase();
    return name !== 'teste' && name !== 'po';
  });

  // 1. If no credentials, use LOCAL STORAGE if available.
  if (!hasCredentials) {
    const local = getLocalMenu();
    return cleanFilter(local); 
  }

  const local = getLocalMenu();
  
  try {
    // 2. Try Supabase
    // Using maybeSingle() or just select to avoid errors on empty tables if they exist
    const { data, error } = await supabase.from('menu_items').select('*');
    
    // 3. Validation Logic
    if (!error && data) {
      // CRITICAL FIX: If data is empty array [], return it! 
      // If table exists but is empty, we respect that.
      if (data.length === 0) return [];

      const mapped = data.map((item: any) => ({
        id: String(item.id), // Ensure ID is string
        name: item.name || "Item sem nome",
        description: item.description || "",
        price: Number(item.price) || 0,
        highlight: item.highlight === true || item.highlight === 'true' || item.highlight === 't' || item.highlight === 1,
        category: (item.category || 'outros').toLowerCase().trim(),
        image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
      }));

      return cleanFilter(mapped);
    }
  } catch (e) {
    // Silent fail to local
  }

  // 5. Fallback to Local if DB failed (e.g. table doesn't exist yet)
  return cleanFilter(local);
};

// ... (Other services remain largely similar, checking hasCredentials) ...

export const fetchReservations = async (): Promise<Reservation[]> => {
  const localData = getLocalData();
  if (!hasCredentials) return localData;

  let serverData: Reservation[] = [];
  try {
    const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      serverData = data.map((item: any) => ({
        id: item.id,
        clientName: item.client_name,
        phone: item.phone || '',
        pax: typeof item.pax === 'number' ? `${item.pax} Pessoas` : (item.pax || '2 Pessoas'),
        time: item.time,
        date: item.date,
        tableType: item.table_type || 'Salão Principal',
        status: item.status,
        createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
      }));
    }
  } catch (error) {}

  const allReservations = [...serverData, ...localData];
  const uniqueMap = new Map();
  allReservations.forEach(item => {
    if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
  });
  return Array.from(uniqueMap.values()).sort((a, b) => b.createdAt - a.createdAt);
};

export const createReservation = async (res: Omit<Reservation, 'id' | 'status' | 'createdAt'>): Promise<Reservation | null> => {
  const newReservation: Reservation = {
      id: 'local_' + Math.random().toString(36).substr(2, 9), 
      clientName: res.clientName,
      phone: res.phone,
      pax: res.pax,
      time: res.time,
      date: res.date,
      tableType: res.tableType,
      status: 'confirmed',
      createdAt: Date.now()
    };
  
  if (!hasCredentials) {
    const currentData = getLocalData();
    setLocalData([newReservation, ...currentData]);
    return newReservation;
  }

  try {
    const paxInt = parseInt((res.pax || '2').replace(/\D/g, '')) || 2;
    const { data, error } = await supabase.from('reservations').insert([{
        client_name: res.clientName,
        phone: res.phone,
        pax: paxInt,
        date: res.date,
        time: res.time,
        table_type: res.tableType,
        status: 'confirmed'
      }]).select().single();

    if (error) throw error;
    return {
      id: data.id,
      clientName: data.client_name,
      phone: data.phone,
      pax: `${data.pax} Pessoas`,
      time: data.time,
      date: data.date,
      tableType: data.table_type,
      status: data.status,
      createdAt: new Date(data.created_at).getTime()
    };
  } catch (error) {
    const currentData = getLocalData();
    setLocalData([newReservation, ...currentData]);
    return newReservation;
  }
};

export const updateReservationStatusService = async (id: string, status: 'confirmed' | 'cancelled') => {
  if (id.startsWith('local_') || !hasCredentials) {
    const currentData = getLocalData();
    setLocalData(currentData.map(r => r.id === id ? { ...r, status } : r));
    return;
  }
  try {
    await supabase.from('reservations').update({ status }).eq('id', id);
  } catch (error) {
    const currentData = getLocalData();
    setLocalData(currentData.map(r => r.id === id ? { ...r, status } : r));
  }
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const localData = getLocalAnnouncements();
  if (!hasCredentials) return localData;
  let serverData: Announcement[] = [];
  try {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) {
      serverData = data.map((item: any) => ({
        id: item.id,
        message: item.message,
        isActive: item.is_active,
        createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
      }));
    }
  } catch (e) {}
  const all = [...serverData, ...localData];
  const uniqueMap = new Map();
  all.forEach(item => { if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item); });
  return Array.from(uniqueMap.values()).sort((a, b) => b.createdAt - a.createdAt);
};

export const createAnnouncement = async (message: string): Promise<Announcement | null> => {
  const newAnn: Announcement = { id: 'local_' + Date.now(), message, isActive: true, createdAt: Date.now() };
  if (!hasCredentials) {
    setLocalAnnouncements([newAnn, ...getLocalAnnouncements()]);
    return newAnn;
  }
  try {
    const { data, error } = await supabase.from('announcements').insert([{ message, is_active: true }]).select().single();
    if(error) throw error;
    return { id: data.id, message: data.message, isActive: data.is_active, createdAt: new Date(data.created_at).getTime() };
  } catch (e) {
    setLocalAnnouncements([newAnn, ...getLocalAnnouncements()]);
    return newAnn;
  }
};

export const toggleAnnouncement = async (id: string, isActive: boolean) => {
  if (id.startsWith('local_') || !hasCredentials) {
    setLocalAnnouncements(getLocalAnnouncements().map(a => a.id === id ? { ...a, isActive } : a));
    return;
  }
  try {
    await supabase.from('announcements').update({ is_active: isActive }).eq('id', id);
  } catch (e) {
    setLocalAnnouncements(getLocalAnnouncements().map(a => a.id === id ? { ...a, isActive } : a));
  }
};

export const updateMenuItemPrice = async (id: string, newPrice: number) => {
  const currentMenu = getLocalMenu(); 
  const updatedMenu = currentMenu.map(item => String(item.id) === String(id) ? { ...item, price: newPrice } : item);
  setLocalMenu(updatedMenu);

  if (hasCredentials) {
    try {
      await supabase.from('menu_items').update({ price: newPrice }).eq('id', id);
    } catch (e) {}
  }
  return updatedMenu;
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>) => {
  const newId = 'item_' + Date.now();
  const newItem = { 
    id: newId, 
    ...item, 
    highlight: item.popular || false, 
    price: Number(item.price) 
  };
  
  const currentMenu = getLocalMenu();
  const updatedMenu = [...currentMenu, newItem];
  setLocalMenu(updatedMenu);

  if (hasCredentials) {
    try {
       await supabase.from('menu_items').insert([{
         id: newId,
         name: item.name,
         description: item.description,
         price: item.price,
         category: item.category,
         highlight: item.popular,
         image: (item as any).image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
       }]);
    } catch (e) {
      console.error("Error creating menu item in DB", e);
    }
  }
  return newItem;
};

export const deleteMenuItem = async (id: string) => {
  // 1. Remove from local storage with STRICT string comparison
  const currentMenu = getLocalMenu();
  const updatedMenu = currentMenu.filter(item => String(item.id) !== String(id));
  setLocalMenu(updatedMenu);

  // 2. Remove from Supabase if connected
  if (hasCredentials) {
    // FIX: DO NOT throw error if DB fails. This allows local deletion to persist even if DB is offline/table missing.
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) {
        console.warn("Supabase Delete Failed (ignored to keep local state clean):", error.message);
      }
    } catch (e) {
      console.warn("Supabase Exception during delete (ignored):", e);
    }
  }
  return updatedMenu;
};

export const resetMenuToDefaults = async () => {
  if (!hasCredentials) {
    setLocalMenu(DEFAULT_MENU_ITEMS);
    return DEFAULT_MENU_ITEMS;
  }
  try {
    const { error: deleteError } = await supabase.from('menu_items').delete().neq('id', 'impossible_id_val'); 
    if (!deleteError) {
       await supabase.from('menu_items').insert(DEFAULT_MENU_ITEMS);
    }
  } catch (e) {}
  setLocalMenu(DEFAULT_MENU_ITEMS);
  return DEFAULT_MENU_ITEMS;
};