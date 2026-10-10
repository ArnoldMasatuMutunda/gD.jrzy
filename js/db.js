/**
 * gD.jrzy Database & Storage Layer
 * Supports IndexedDB (for rich uploaded images) with localStorage fallback.
 * Uses BroadcastChannel for instant cross-tab synchronization.
 */

const DB_NAME = 'gd_jrzy_commerce';
const DB_VERSION = 1;
const SYNC_CHANNEL = 'gd_jrzy_sync_channel';

// Default initial catalog with real photography
const INITIAL_PRODUCTS = [
  {
    id: 1,
    lotNumber: 'GDJ-JRZY-001',
    name: 'Brazil Away / Seleção 2024',
    team: 'Brazil',
    category: 'National',
    kitType: 'Away',
    season: '2024/25',
    priceINR: 1899,
    priceTZS: 58000,
    stock: { S: 3, M: 5, L: 4, XL: 2 },
    condition: 'Brand New with Tags',
    images: ['assets/jerseys/jersey-01.jpg'],
    description: 'A vibrant national-team colourway engineered with aerodynamic moisture-wicking jacquard. Styled for match days and everyday street rotation.',
    fabric: '100% Recycled Poly Jacquard / Dri-FIT ADV finish',
    tag: 'Fan Favourite',
    status: 'Published',
    createdAt: '2026-09-20T10:00:00.000Z'
  },
  {
    id: 2,
    lotNumber: 'GDJ-JRZY-002',
    name: 'Milan Rossoneri / Classic Edit',
    team: 'AC Milan',
    category: 'Club',
    kitType: 'Home',
    season: '2023/24',
    priceINR: 1999,
    priceTZS: 62000,
    stock: { S: 2, M: 4, L: 3, XL: 1 },
    condition: 'Brand New with Tags',
    images: ['assets/jerseys/jersey-02.jpg'],
    description: 'Iconic red and black vertical stripes with matte dark trims. An immortal European football silhouette that transcends sportswear into luxury fashion.',
    fabric: 'Ultra-light breathability weave with woven crest badge',
    tag: 'Classic',
    status: 'Published',
    createdAt: '2026-09-21T11:00:00.000Z'
  },
  {
    id: 3,
    lotNumber: 'GDJ-JRZY-003',
    name: 'Argentina Albiceleste / World Champions',
    team: 'Argentina',
    category: 'National',
    kitType: 'Home',
    season: '2024/25',
    priceINR: 1999,
    priceTZS: 62000,
    stock: { S: 4, M: 6, L: 5, XL: 3 },
    condition: 'Brand New with Tags',
    images: ['assets/jerseys/jersey-03.jpg'],
    description: 'Celestial blue and pure bone stripes accented with golden champion detailing. Tailored modern fit with premium ventilation ribbing.',
    fabric: 'Heat-sealed federation insignia / HEAT.RDY breathable mesh',
    tag: 'New Drop',
    status: 'Published',
    createdAt: '2026-09-22T09:30:00.000Z'
  },
  {
    id: 4,
    lotNumber: 'GDJ-JRZY-004',
    name: 'Como Ivory / Heritage Edition',
    team: 'Como 1907',
    category: 'Club',
    kitType: 'Third',
    season: '2024/25',
    priceINR: 2199,
    priceTZS: 68000,
    stock: { S: 2, M: 3, L: 2, XL: 1 },
    condition: 'Brand New with Tags',
    images: ['assets/jerseys/jersey-04.jpg'],
    description: 'Lakeside Italian elegance translated into high-fashion knitwear. Off-white base with minimalist crest and golden subtle typographic accents.',
    fabric: 'Refined double-knit polyester with micro-perforations',
    tag: 'Limited Drop',
    status: 'Published',
    createdAt: '2026-09-23T14:15:00.000Z'
  },
  {
    id: 5,
    lotNumber: 'GDJ-JRZY-005',
    name: 'Real Madrid / Archive Cream Edit',
    team: 'Real Madrid',
    category: 'Club',
    kitType: 'Third',
    season: '2024/25',
    priceINR: 2299,
    priceTZS: 71000,
    stock: { S: 3, M: 5, L: 3, XL: 2 },
    condition: 'Brand New with Tags',
    images: ['assets/jerseys/jersey-05.jpg'],
    description: 'Regal monochrome with bespoke collar and polo button closure. Built for runway aesthetics and matchday elegance.',
    fabric: 'Engineered moisture management pique knit with embroidered crest',
    tag: 'Archive Edit',
    status: 'Published',
    createdAt: '2026-09-24T16:00:00.000Z'
  },
  {
    id: 6,
    lotNumber: 'GDJ-JRZY-006',
    name: 'Barcelona Blaugrana / Matchday 01',
    team: 'FC Barcelona',
    category: 'Club',
    kitType: 'Home',
    season: '2024/25',
    priceINR: 1999,
    priceTZS: 62000,
    stock: { S: 3, M: 4, L: 4, XL: 2 },
    condition: 'Brand New with Tags',
    images: ['assets/jerseys/jersey-06.jpg'],
    description: 'Split half-and-half classic Catalan palette celebrating 125 years of club legacy. Crisp finish and modern athletic drape.',
    fabric: '100% High-gauge performance polyester',
    tag: 'Cult Classic',
    status: 'Published',
    createdAt: '2026-09-25T12:00:00.000Z'
  },
  {
    id: 7,
    lotNumber: 'GDJ-JRZY-007',
    name: 'Netherlands Oranje / Retro 1988 Edit',
    team: 'Netherlands',
    category: 'National',
    kitType: 'Retro',
    season: '1988 Classic',
    priceINR: 1799,
    priceTZS: 56000,
    stock: { S: 2, M: 3, L: 2, XL: 1 },
    condition: 'Mint / Like New',
    images: ['assets/jerseys/jersey-07.jpg'],
    description: 'The geometric shaded pattern that defined an entire era of streetwear culture. Loud, vibrant, and unapologetically football.',
    fabric: 'Silky retro sheen polyester with ribbed V-neck',
    tag: 'Retro Vault',
    status: 'Published',
    createdAt: '2026-09-26T15:30:00.000Z'
  },
  {
    id: 8,
    lotNumber: 'GDJ-JRZY-008',
    name: 'Blue Heritage / No. 10 Archive',
    team: 'Archive Club',
    category: 'Classic',
    kitType: 'Retro',
    season: 'Archive',
    priceINR: 1699,
    priceTZS: 52000,
    stock: { S: 2, M: 4, L: 3, XL: 1 },
    condition: 'Mint / Like New',
    images: ['assets/jerseys/jersey-08.jpg'],
    description: 'Deep cobalt blue with crisp white detailing and iconic back numeral. A staple vintage top tailored for relaxed campus and city outfits.',
    fabric: 'Heavyweight retro weave jersey with stitched details',
    tag: 'Archive Find',
    status: 'Published',
    createdAt: '2026-09-27T18:00:00.000Z'
  }
];

const DEFAULT_SETTINGS = {
  currency: 'INR', // 'INR' or 'TZS'
  exchangeRateINRtoTZS: 31.0,
  whatsappNumber: '+255700000000',
  adminPasswordHash: 'change-me-before-launch',
  storeName: 'gD.jrzy',
  brandTagline: 'Football Lives Here.',
  campaignPhrase: 'FIT THE KIT.',
  paymentMode: 'test' // 'test' | 'live'
};

class GDCommerceDB {
  constructor() {
    this.db = null;
    this.broadcastChannel = null;
    this.initBroadcast();
  }

  initBroadcast() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);
    }
  }

  notifySync(type, payload = null) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
    // Also trigger window custom event for same-page components
    window.dispatchEvent(new CustomEvent('gd_data_updated', { detail: { type, payload } }));
  }

  onSync(callback) {
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => callback(event.data);
    }
    window.addEventListener('gd_data_updated', (event) => callback(event.detail));
  }

  async open() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('lotNumber', 'lotNumber', { unique: true });
          productStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (e) => {
        this.db = e.target.result;
        await this.seedDefaultsIfEmpty();
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.warn('IndexedDB failed to open, falling back to localStorage', e);
        this.seedLocalStorage();
        resolve(null);
      };
    });
  }

  async seedDefaultsIfEmpty() {
    const products = await this.getAllFromStore('products');
    if (!products || products.length === 0) {
      for (const prod of INITIAL_PRODUCTS) {
        await this.putInStore('products', prod);
      }
    }
    const settings = await this.getFromStore('settings', 'config');
    if (!settings) {
      await this.putInStore('settings', { key: 'config', ...DEFAULT_SETTINGS });
    }
  }

  seedLocalStorage() {
    if (!localStorage.getItem('gd_products')) {
      localStorage.setItem('gd_products', JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem('gd_settings')) {
      localStorage.setItem('gd_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('gd_orders')) {
      localStorage.setItem('gd_orders', JSON.stringify([]));
    }
  }

  // Generic IndexedDB helpers
  getAllFromStore(storeName) {
    if (!this.db) {
      const data = localStorage.getItem(`gd_${storeName}`);
      return Promise.resolve(data ? JSON.parse(data) : []);
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  getFromStore(storeName, key) {
    if (!this.db) {
      const list = JSON.parse(localStorage.getItem(`gd_${storeName}`) || '[]');
      return Promise.resolve(list.find(x => (x.id || x.key) === key) || null);
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  putInStore(storeName, value) {
    if (!this.db) {
      const key = storeName === 'settings' ? 'key' : 'id';
      let list = JSON.parse(localStorage.getItem(`gd_${storeName}`) || '[]');
      const idx = list.findIndex(x => x[key] === value[key]);
      if (idx >= 0) list[idx] = value;
      else list.push(value);
      localStorage.setItem(`gd_${storeName}`, JSON.stringify(list));
      return Promise.resolve(value);
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve(value);
      req.onerror = () => reject(req.error);
    });
  }

  deleteFromStore(storeName, key) {
    if (!this.db) {
      let list = JSON.parse(localStorage.getItem(`gd_${storeName}`) || '[]');
      list = list.filter(x => x.id !== key);
      localStorage.setItem(`gd_${storeName}`, JSON.stringify(list));
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // High-Level Products API
  async getProducts() {
    await this.open();
    const prods = await this.getAllFromStore('products');
    return prods.sort((a, b) => b.id - a.id);
  }

  async getPublishedProducts() {
    const prods = await this.getProducts();
    return prods.filter(p => p.status === 'Published');
  }

  async getProduct(id) {
    await this.open();
    return await this.getFromStore('products', Number(id));
  }

  async saveProduct(product) {
    await this.open();
    if (!product.id) {
      const all = await this.getProducts();
      const maxId = all.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
      product.id = maxId + 1;
      product.createdAt = new Date().toISOString();
    }
    // Compute total stock helper
    const s = product.stock || { S: 0, M: 0, L: 0, XL: 0 };
    product.totalStock = (Number(s.S) || 0) + (Number(s.M) || 0) + (Number(s.L) || 0) + (Number(s.XL) || 0);

    const saved = await this.putInStore('products', product);
    this.notifySync('product_saved', saved);
    return saved;
  }

  async deleteProduct(id) {
    await this.open();
    await this.deleteFromStore('products', Number(id));
    this.notifySync('product_deleted', { id: Number(id) });
    return true;
  }

  async updateStock(id, size, delta) {
    const prod = await this.getProduct(id);
    if (!prod) throw new Error('Product not found');
    if (!prod.stock) prod.stock = { S: 0, M: 0, L: 0, XL: 0 };
    const current = Number(prod.stock[size]) || 0;
    const nextVal = Math.max(0, current + delta);
    prod.stock[size] = nextVal;
    return await this.saveProduct(prod);
  }

  async getNextLotNumber() {
    const all = await this.getProducts();
    const count = all.length + 1;
    return `GDJ-JRZY-${String(count).padStart(3, '0')}`;
  }

  // High-Level Orders API
  async getOrders() {
    await this.open();
    const orders = await this.getAllFromStore('orders');
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async saveOrder(order) {
    await this.open();
    if (!order.id) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      order.id = `ORD-${rand}`;
      order.createdAt = new Date().toISOString();
      order.status = 'New';
      order.paymentStatus = order.paymentStatus || 'Pending';
    }

    // Decrement stock atomically from products
    for (const item of order.items) {
      if (item.productId && item.size) {
        try {
          await this.updateStock(item.productId, item.size, -(Number(item.qty) || 1));
        } catch (err) {
          console.warn('Could not decrement stock for order item', item, err);
        }
      }
    }

    const saved = await this.putInStore('orders', order);
    this.notifySync('order_created', saved);
    return saved;
  }

  async updateOrderStatus(id, status, paymentStatus = null) {
    await this.open();
    const order = await this.getFromStore('orders', id);
    if (!order) throw new Error('Order not found');
    order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    const updated = await this.putInStore('orders', order);
    this.notifySync('order_updated', updated);
    return updated;
  }

  // Settings API
  async getSettings() {
    await this.open();
    const cfg = await this.getFromStore('settings', 'config');
    return { ...DEFAULT_SETTINGS, ...cfg };
  }

  async saveSettings(newSettings) {
    await this.open();
    const current = await this.getSettings();
    const merged = { ...current, ...newSettings, key: 'config' };
    await this.putInStore('settings', merged);
    this.notifySync('settings_updated', merged);
    return merged;
  }

  // Reset demo
  async resetToDefaults() {
    await this.open();
    if (this.db) {
      const tx = this.db.transaction(['products', 'orders', 'settings'], 'readwrite');
      tx.objectStore('products').clear();
      tx.objectStore('orders').clear();
      tx.objectStore('settings').clear();
      await new Promise(r => { tx.oncomplete = r; });
    }
    localStorage.removeItem('gd_products');
    localStorage.removeItem('gd_orders');
    localStorage.removeItem('gd_settings');
    await this.seedDefaultsIfEmpty();
    this.notifySync('catalog_reset');
  }
}

// Global instance
window.gdCommerce = new GDCommerceDB();
