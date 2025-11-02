import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { localDB } from '../utills/localDB';
import bcrypt from 'bcryptjs'; // We'll install this

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const currentUserJson = localStorage.getItem('current_user');
    if (currentUserJson) {
      setUser(JSON.parse(currentUserJson));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Check if user exists
      const existingUser = await localDB.getUserByEmail(email);
      if (existingUser) {
        return { error: new Error('User already registered') };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null
      };

      await localDB.addUser(newUser);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const dbUser = await localDB.getUserByEmail(email);
      
      if (!dbUser) {
        return { error: new Error('Invalid login credentials') };
      }

      // Check if account is locked
      if (dbUser.locked_until) {
        const lockTime = new Date(dbUser.locked_until);
        if (lockTime > new Date()) {
          const minutesLeft = Math.ceil((lockTime.getTime() - Date.now()) / 60000);
          return { error: new Error(`Account locked. Try again in ${minutesLeft} minutes`) };
        } else {
          // Unlock account
          dbUser.locked_until = null;
          dbUser.failed_login_attempts = 0;
          await localDB.updateUser(dbUser);
        }
      }

      // Verify password
      const isValid = await bcrypt.compare(password, dbUser.password);
      
      if (!isValid) {
        // Increment failed attempts
        dbUser.failed_login_attempts++;
        
        // Lock account after 5 failed attempts
        if (dbUser.failed_login_attempts >= 5) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 15); // Lock for 15 minutes
          dbUser.locked_until = lockUntil.toISOString();
        }
        
        await localDB.updateUser(dbUser);
        return { error: new Error('Invalid login credentials') };
      }

      // Reset failed attempts on successful login
      dbUser.failed_login_attempts = 0;
      dbUser.locked_until = null;
      await localDB.updateUser(dbUser);

      // Set current user
      const currentUser: User = {
        id: dbUser.id,
        email: dbUser.email,
        created_at: dbUser.created_at
      };
      
      localStorage.setItem('current_user', JSON.stringify(currentUser));
      setUser(currentUser);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a LocalAuthProvider');
  }
  return context;
}