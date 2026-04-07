CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  stock int NOT NULL,
  category text,
  sales int DEFAULT 0
);

-- Dummy Data
INSERT INTO products (name, price, stock, category, sales) VALUES
('Wireless Headphones', 99.99, 150, 'Electronics', 1200),
('Mechanical Keyboard', 129.99, 85, 'Electronics', 850),
('Gaming Mouse', 59.99, 230, 'Electronics', 1500),
('Desk Mat', 25.00, 500, 'Accessories', 300),
('Monitor Mount', 45.00, 110, 'Accessories', 400);
