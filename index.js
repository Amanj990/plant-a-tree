const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db', 'db.json');
const SECRET_KEY = 'treeplant-secret-key'; // change to a strong secret
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));


app.use(bodyParser.json());
app.use(express.static('public')); // serve your HTML files if inside /public

// ================== DATABASE HELPERS ==================
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }
  const data = fs.readFileSync(DB_PATH);
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ================== JWT HELPERS ==================
function generateToken(user) {
  return jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}

// ================== REGISTER ==================
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, referralCode } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields except referral are required' });
  }

  const db = readDB();
  const userExists = db.users.find(u => u.username === username || u.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'Username or Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    balance: 0,
    totalInvestment: 0,
    totalReturns: 0,
    referralCode: referralCode || '',
  };

  db.users.push(newUser);
  writeDB(db);

  const token = generateToken(newUser);
  res.json({ token, user: { username: newUser.username, email: newUser.email, referralCode: newUser.referralCode } });
});

// ================== LOGIN ==================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const db = readDB();
  const user = db.users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = generateToken(user);
  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, email: user.email, referralCode: user.referralCode }
  });
});

// ================== DASHBOARD ==================
app.get('/api/user/dashboard', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

  const db = readDB();
  const user = db.users.find(u => u.email === decoded.email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ user });
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
