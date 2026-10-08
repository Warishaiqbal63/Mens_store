require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- IMAGE UPLOAD ----------
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, f, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + EXT[f.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, f, cb) => cb(null, !!EXT[f.mimetype]),
});

// turns async errors into a 500 response
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  });

// Middleware: verify token
const auth = (req, res, next) => {
  const token = (req.headers.authorization || '').split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Please log in first' });
  }
};
const admin = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only' });

const makeToken = (u) =>
  jwt.sign({ id: u.id, name: u.name, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ---------- AUTH ----------
app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Enter a name, email, and a password of 6+ characters' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,role',
      [name, email.toLowerCase(), hash]
    );
    res.json({ token: makeToken(rows[0]), user: { name: rows[0].name, role: rows[0].role } });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'That email is already registered' });
    throw e;
  }
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [(email || '').toLowerCase()]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
    return res.status(401).json({ error: 'Incorrect email or password' });
  res.json({ token: makeToken(u), user: { name: u.name, role: u.role } });
}));

const handleUpload = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Upload a JPG, PNG, or WebP image (max 5 MB)' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
};
app.post('/api/upload', auth, admin, handleUpload);       // product photos (admin)
app.post('/api/upload/proof', auth, handleUpload);        // payment screenshots (any logged-in user)

// ---------- PRODUCTS ----------
app.get('/api/products', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  res.json(rows);
}));

app.get('/api/products/:id', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}));

app.post('/api/products', auth, admin, wrap(async (req, res) => {
  const { name, description, price, stock, image_url, category, colors, sizes } = req.body;
  if (!name || !(Number(price) >= 0)) return res.status(400).json({ error: 'Name and price are required' });
  const { rows } = await pool.query(
    `INSERT INTO products(name,description,price,stock,image_url,category,colors,sizes)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [name, description || '', price, stock || 0, image_url || null, category || 'General', colors || [], sizes || []]
  );
  res.json(rows[0]);
}));

app.put('/api/products/:id', auth, admin, wrap(async (req, res) => {
  const { name, description, price, stock, image_url, category, colors, sizes } = req.body;
  if (!name || !(Number(price) >= 0)) return res.status(400).json({ error: 'Name and price are required' });
  const { rows } = await pool.query(
    `UPDATE products SET name=$1,description=$2,price=$3,stock=$4,image_url=$5,category=$6,colors=$7,sizes=$8
     WHERE id=$9 RETURNING *`,
    [name, description || '', price, stock || 0, image_url || null, category || 'General', colors || [], sizes || [], req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}));

app.delete('/api/products/:id', auth, admin, wrap(async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === '23503') return res.status(400).json({ error: 'This product has orders, so it cannot be deleted' });
    throw e;
  }
}));

// ---------- ORDERS (transaction) ----------
app.post('/api/orders', auth, wrap(async (req, res) => {
  const { items, customer = {}, payment_method = 'cod', payment_proof } = req.body;
  const { name, phone, address, city } = customer;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Your cart is empty' });
  if (!name || !address || !city || !/^[0-9+\-\s]{10,15}$/.test(phone || ''))
    return res.status(400).json({ error: 'Please enter your name, a valid phone number, address, and city' });
  if (!['cod', 'transfer'].includes(payment_method))
    return res.status(400).json({ error: 'Invalid payment method' });
  if (payment_method === 'transfer' && !(typeof payment_proof === 'string' && payment_proof.startsWith('/uploads/')))
    return res.status(400).json({ error: 'Please upload your payment screenshot' });

  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    let total = 0;
    const lines = [];
    for (const it of items) {
      const qty = parseInt(it.quantity);
      if (!(qty > 0)) throw new Error('Invalid quantity');
      // take price from the DB, never trust the client's price
      const { rows: [p] } = await c.query(
        'SELECT id,name,price,stock FROM products WHERE id=$1 FOR UPDATE', [it.product_id]);
      if (!p) throw new Error('Product not found');
      if (p.stock < qty) throw new Error(`${p.name}: not enough stock`);
      total += Number(p.price) * qty;
      lines.push({ p, qty, it });
    }
    const { rows: [o] } = await c.query(
      `INSERT INTO orders(user_id,total,customer_name,phone,address,city,payment_method,payment_status,payment_proof)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [req.user.id, total, name, phone, address, city, payment_method,
       payment_method === 'transfer' ? 'pending' : 'unpaid', payment_method === 'transfer' ? payment_proof : null]);
    for (const { p, qty, it } of lines) {
      await c.query(
        'INSERT INTO order_items(order_id,product_id,quantity,price,color,size) VALUES($1,$2,$3,$4,$5,$6)',
        [o.id, p.id, qty, p.price, it.color || null, it.size || null]);
      await c.query('UPDATE products SET stock=stock-$1 WHERE id=$2', [qty, p.id]);
    }
    await c.query('COMMIT');
    res.json({ id: o.id, total, payment_method });
  } catch (e) {
    await c.query('ROLLBACK');
    res.status(400).json({ error: e.message });
  } finally {
    c.release();
  }
}));

app.get('/api/orders/my', auth, wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id,o.total,o.status,o.created_at,o.customer_name,o.phone,o.address,o.city,o.payment_method,o.payment_status,o.payment_proof,
       json_agg(json_build_object('name',p.name,'quantity',oi.quantity,'price',oi.price,'color',oi.color,'size',oi.size)) AS items
     FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
     WHERE o.user_id=$1 GROUP BY o.id ORDER BY o.id DESC`, [req.user.id]);
  res.json(rows);
}));

app.get('/api/orders', auth, admin, wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.*, u.name AS user_name, u.email,
       json_agg(json_build_object('name',p.name,'quantity',oi.quantity,'price',oi.price,'color',oi.color,'size',oi.size)) AS items
     FROM orders o JOIN users u ON u.id=o.user_id
     JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
     GROUP BY o.id,u.name,u.email ORDER BY o.id DESC`);
  res.json(rows);
}));

app.put('/api/orders/:id', auth, admin, wrap(async (req, res) => {
  const { status, payment_status } = req.body;
  const STATUS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const PAY = ['unpaid', 'pending', 'paid', 'rejected'];
  if ((status && !STATUS.includes(status)) || (payment_status && !PAY.includes(payment_status)))
    return res.status(400).json({ error: 'Invalid value' });
  const { rows } = await pool.query(
    `UPDATE orders SET status=COALESCE($1,status), payment_status=COALESCE($2,payment_status)
     WHERE id=$3 RETURNING id,status,payment_status`,
    [status || null, payment_status || null, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}));

app.listen(process.env.PORT || 5000, () => console.log('API running on port 5000'));
