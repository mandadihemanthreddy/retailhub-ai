-- Core Multi-Tenant Retail Schema

-- Stores Table for multi-tenant isolation
CREATE TABLE stores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL UNIQUE,
  store_name text NOT NULL,
  business_type text,
  created_at timestamp with time zone DEFAULT now()
);

-- Products Table with Tenant Isolation
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL, -- Crucial for RLS (Row Level Security)
  name text NOT NULL,
  price numeric NOT NULL,
  stock int NOT NULL,
  category text,
  sales int DEFAULT 0,
  metadata jsonb DEFAULT '{}', -- Flex table support for unpredictable CSV uploads
  created_at timestamp with time zone DEFAULT now()
);

-- Chat Messages History
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexing for performance
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_messages_tenant_user ON messages(tenant_id, user_id);

-- Dummy Data for initial testing (Assigning to a placeholder tenant ID)
-- Note: Real production use requires Row Level Security (RLS) policies
INSERT INTO products (tenant_id, name, price, stock, category, sales) VALUES
('00000000-0000-0000-0000-000000000000', 'Wireless Headphones', 99.99, 150, 'Electronics', 1200),
('00000000-0000-0000-0000-000000000000', 'Mechanical Keyboard', 129.99, 85, 'Electronics', 850),
('00000000-0000-0000-0000-000000000000', 'Gaming Mouse', 59.99, 230, 'Electronics', 1500);
