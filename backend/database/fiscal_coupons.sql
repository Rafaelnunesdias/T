-- =============================================
-- Cupom Fiscal (Fiscal Coupons) Table
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS fiscal_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  number VARCHAR(30) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_document VARCHAR(20),
  client_phone VARCHAR(20),
  payment_method VARCHAR(50) DEFAULT 'Dinheiro',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'emitido',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fiscal_coupons_business_id ON fiscal_coupons(business_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_coupons_number ON fiscal_coupons(number);
CREATE INDEX IF NOT EXISTS idx_fiscal_coupons_status ON fiscal_coupons(status);
CREATE INDEX IF NOT EXISTS idx_fiscal_coupons_issued_at ON fiscal_coupons(issued_at);

-- RLS (Row Level Security)
ALTER TABLE fiscal_coupons ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write their business coupons
CREATE POLICY "Users can view own business coupons" ON fiscal_coupons
  FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "Users can insert own business coupons" ON fiscal_coupons
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can update own business coupons" ON fiscal_coupons
  FOR UPDATE USING (auth.uid() = business_id);

-- =============================================
-- transactions table (if not exists)
-- Used by fiscal coupons for financial integration
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'receita',
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
