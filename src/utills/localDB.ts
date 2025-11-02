// Local database using IndexedDB for activity logs and user data

interface User {
    id: string;
    email: string;
    password: string; // Will be hashed
    created_at: string;
    failed_login_attempts: number;
    locked_until: string | null;
  }
  
  interface ActivityLog {
    id: string;
    user_id: string | null;
    action: string;
    details: any;
    ip_address: string;
    created_at: string;
  }
  
  interface Portfolio {
    id: string;
    user_id: string;
    symbol: string;
    asset_type: 'crypto' | 'stock';
    quantity: number;
    buy_price: number;
    current_price?: number;
    created_at: string;
    updated_at: string;
  }
  
  class LocalDatabase {
    private dbName = 'investify_db';
    private version = 1;
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;
  
    async init(): Promise<void> {
      if (this.initPromise) {
        return this.initPromise;
      }
  
      this.initPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
  
        request.onerror = () => {
          console.error('Database failed to open:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          console.log('✅ Database initialized successfully');
          resolve();
        };
  
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
  
          // Create users store
          if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('email', 'email', { unique: true });
          }
  
          // Create activity_logs store
          if (!db.objectStoreNames.contains('activity_logs')) {
            const logStore = db.createObjectStore('activity_logs', { keyPath: 'id' });
            logStore.createIndex('user_id', 'user_id', { unique: false });
            logStore.createIndex('created_at', 'created_at', { unique: false });
          }
  
          // Create portfolios store
          if (!db.objectStoreNames.contains('portfolios')) {
            const portfolioStore = db.createObjectStore('portfolios', { keyPath: 'id' });
            portfolioStore.createIndex('user_id', 'user_id', { unique: false });
          }
        };
      });
  
      return this.initPromise;
    }
  
    private async ensureInitialized(): Promise<void> {
      if (!this.db) {
        await this.init();
      }
    }
  
    // Users
    async addUser(user: User): Promise<void> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      await store.add(user);
    }
  
    async getUserByEmail(email: string): Promise<User | null> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const index = store.index('email');
      return new Promise((resolve) => {
        const request = index.get(email);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    }
  
    async updateUser(user: User): Promise<void> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      await store.put(user);
    }
  
    // Activity Logs
    async addActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<void> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('activity_logs', 'readwrite');
      const store = tx.objectStore('activity_logs');
      const fullLog: ActivityLog = {
        ...log,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      await store.add(fullLog);
    }
  
    async getActivityLogs(userId?: string): Promise<ActivityLog[]> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('activity_logs', 'readonly');
      const store = tx.objectStore('activity_logs');
      
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          let logs = request.result || [];
          if (userId) {
            logs = logs.filter(log => log.user_id === userId);
          }
          logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          resolve(logs);
        };
        request.onerror = () => resolve([]);
      });
    }
  
    // Portfolios
    async addPortfolio(portfolio: Omit<Portfolio, 'id' | 'created_at' | 'updated_at'>): Promise<Portfolio> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('portfolios', 'readwrite');
      const store = tx.objectStore('portfolios');
      const fullPortfolio: Portfolio = {
        ...portfolio,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await store.add(fullPortfolio);
      return fullPortfolio;
    }
  
    async getPortfolios(userId: string): Promise<Portfolio[]> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('portfolios', 'readonly');
      const store = tx.objectStore('portfolios');
      const index = store.index('user_id');
      
      return new Promise((resolve) => {
        const request = index.getAll(userId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => {
          console.error('Error getting portfolios:', request.error);
          resolve([]);
        };
      });
    }
  
    async updatePortfolio(portfolio: Portfolio): Promise<void> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('portfolios', 'readwrite');
      const store = tx.objectStore('portfolios');
      portfolio.updated_at = new Date().toISOString();
      await store.put(portfolio);
    }
  
    async deletePortfolio(id: string): Promise<void> {
      await this.ensureInitialized();
      const tx = this.db!.transaction('portfolios', 'readwrite');
      const store = tx.objectStore('portfolios');
      await store.delete(id);
    }
  }
  
  export const localDB = new LocalDatabase();
  
  // Initialize on load
  localDB.init().catch(console.error);