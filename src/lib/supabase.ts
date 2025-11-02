import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: 'crypto' | 'stock';
  quantity: number;
  buy_price: number;
  created_at: string;
  updated_at: string;
}
