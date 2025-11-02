/*
  # Investify Database Schema
  
  1. Tables
    - `portfolios` - User portfolio assets
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `symbol` (text, asset symbol e.g., BTC, ETH, AAPL)
      - `asset_type` (text, either 'crypto' or 'stock')
      - `quantity` (decimal, amount owned)
      - `buy_price` (decimal, purchase price per unit)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own portfolio data
    
  3. Notes
    - Using Supabase Auth for user management
    - Portfolio data tied to authenticated users
    - Indexes added for performance on user_id queries
*/

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
  quantity decimal(20, 8) NOT NULL CHECK (quantity > 0),
  buy_price decimal(20, 8) NOT NULL CHECK (buy_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own portfolio"
  ON portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
  ON portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON portfolios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio"
  ON portfolios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
  CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
