-- Rooklance Wallet App Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    total_earnings DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL,
    discount TEXT NOT NULL,
    description TEXT NOT NULL,
    valid_until DATE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    color_start TEXT NOT NULL,
    color_end TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('deposit', 'withdrawal', 'earning')) NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_user_id ON promo_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Wallets policies
CREATE POLICY "Users can view their own wallet" ON wallets
    FOR SELECT USING (user_id = current_setting('app.user_id', true)::text);

CREATE POLICY "Users can insert their own wallet" ON wallets
    FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true)::text);

CREATE POLICY "Users can update their own wallet" ON wallets
    FOR UPDATE USING (user_id = current_setting('app.user_id', true)::text);

-- Promo codes policies
CREATE POLICY "Users can view their own promo codes" ON promo_codes
    FOR SELECT USING (user_id = current_setting('app.user_id', true)::text);

CREATE POLICY "Users can insert their own promo codes" ON promo_codes
    FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true)::text);

CREATE POLICY "Users can update their own promo codes" ON promo_codes
    FOR UPDATE USING (user_id = current_setting('app.user_id', true)::text);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (user_id = current_setting('app.user_id', true)::text);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true)::text);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (user_id = current_setting('app.user_id', true)::text);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO wallets (user_id, balance, total_earnings) VALUES 
('demo-user-123', 1250.75, 8500.00)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO promo_codes (user_id, code, discount, description, valid_until, is_used, color_start, color_end) VALUES 
('demo-user-123', 'ROOKLANCE20', '20₺', 'Tüm ürünlerde %20 indirim', '2024-12-31', false, '#6366f1', '#8b5cf6'),
('demo-user-123', 'NEWUSER30', '30₺', 'Yeni kullanıcılar için', '2024-11-20', false, '#ec4899', '#f43f5e'),
('demo-user-123', 'FLASH25', '25₺', 'Flash satışlarda %25 indirim', '2024-11-15', false, '#10b981', '#6366f1'),
('demo-user-123', 'VIP100', '100₺', 'VIP üyeler için özel indirim', '2024-10-30', true, '#f59e0b', '#ef4444'),
('demo-user-123', 'WELCOME50', '50₺', 'İlk siparişinizde %50 indirim', '2024-12-31', false, '#06b6d4', '#6366f1')
ON CONFLICT DO NOTHING;

INSERT INTO transactions (user_id, amount, type, description, status) VALUES 
('demo-user-123', 500.00, 'earning', 'Referans kazancı', 'completed'),
('demo-user-123', -200.00, 'withdrawal', 'Para çekme işlemi', 'completed'),
('demo-user-123', 150.75, 'earning', 'Komisyon kazancı', 'completed')
ON CONFLICT DO NOTHING;
