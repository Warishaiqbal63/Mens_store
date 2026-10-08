CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  customer_name VARCHAR(100),
  phone VARCHAR(30),
  address TEXT,
  city VARCHAR(80),
  payment_method VARCHAR(20) DEFAULT 'cod',
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  payment_proof TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  color VARCHAR(50),
  size VARCHAR(20)
);
