import Database from 'better-sqlite3'
import path from 'path'

// Standard SQLite setup for Next.js App Router
const dbPath = path.join(process.cwd(), 'townsync.db')
const db = new Database(dbPath, {
    // verbose: console.log 
})

// Initialize Schema
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL DEFAULT 'hashed_password',
    name TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    mfa TEXT NOT NULL DEFAULT 'Disabled',
    lastLog TEXT NOT NULL DEFAULT 'Just now'
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'In Stock',
    user_id TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS msme_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    location_region TEXT,
    current_stock_value REAL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    amount REAL NOT NULL,
    transaction_date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS simulations (
    id TEXT PRIMARY KEY,
    regulator_id TEXT NOT NULL,
    tax_rate_params REAL NOT NULL,
    subsidy_params REAL NOT NULL,
    projected_outcome TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(regulator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ip_address TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    movement_type TEXT NOT NULL CHECK(movement_type IN ('inbound', 'outbound')),
    reason TEXT NOT NULL,
    date TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY(item_id) REFERENCES inventory(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add name column if it doesn't exist
try {
    db.exec(`ALTER TABLE users ADD COLUMN name TEXT;`)
} catch (e: any) {
    // Column already exists, ignore error
}

// Seed Initial Data if tables are empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (id, email, password_hash, name, role, status, mfa, lastLog) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    // Simple hash placeholder - in production use bcrypt
    const defaultHash = 'password123_hashed';
    insertUser.run('USR-891', 'regulator1@townsync.go.id', defaultHash, 'Regulator One', 'regulator', 'Active', 'Enabled', '10 mins ago');
    insertUser.run('USR-890', 'analyst_surabaya@townsync.go.id', defaultHash, 'Analyst Surabaya', 'analyst', 'Active', 'Enabled', '2 hrs ago');
    insertUser.run('USR-889', 'toko_sejahtera@gmail.com', defaultHash, 'Toko Sejahtera', 'umkm', 'Active', 'Disabled', '5 hrs ago');
    insertUser.run('USR-888', 'toko_maju@yahoo.com', defaultHash, 'Toko Maju', 'umkm', 'Locked', 'Disabled', '1 day ago');
    insertUser.run('USR-887', 'admin@townsync.go.id', defaultHash, 'System Administrator', 'admin', 'Active', 'Enabled', 'Just now');
}

// Seed MSME Profiles
const msmeCount = db.prepare('SELECT COUNT(*) as count FROM msme_profiles').get() as { count: number };
if (msmeCount.count === 0) {
    const insertMSME = db.prepare('INSERT INTO msme_profiles (id, user_id, business_name, location_region, current_stock_value) VALUES (?, ?, ?, ?, ?)');
    insertMSME.run('MSME-001', 'USR-889', 'Toko Sejahtera', 'Jakarta Selatan', 8200000);
    insertMSME.run('MSME-002', 'USR-888', 'Toko Maju', 'Surabaya', 5500000);
}

// Seed Transactions
const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number };
if (txCount.count === 0) {
    const insertTx = db.prepare('INSERT INTO transactions (id, sender_id, receiver_id, amount, transaction_date, description) VALUES (?, ?, ?, ?, ?, ?)');
    insertTx.run('TRX-001', 'USR-891', 'USR-889', 5000000, '2026-02-20T10:00:00Z', 'Government Subsidy Payment');
    insertTx.run('TRX-002', 'USR-889', 'USR-888', 2500000, '2026-02-24T14:30:00Z', 'Supplier Payment - Rice');
    insertTx.run('TRX-003', 'USR-889', 'USR-890', 840000, '2026-02-28T16:45:00Z', 'Daily Retail Sales');
}

// Seed Audit Logs
const logCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as { count: number };
if (logCount.count === 0) {
    const insertLog = db.prepare('INSERT INTO audit_logs (id, user_id, action, timestamp, ip_address) VALUES (?, ?, ?, ?, ?)');
    insertLog.run('LOG-001', 'USR-891', 'Ran Policy Simulation (Tax=5%, Subsidy=25M)', '2026-03-01T14:32:11Z', '192.168.1.14');
    insertLog.run('LOG-002', 'USR-887', 'Exported User List CSV', '2026-03-01T10:15:44Z', '10.0.0.52');
    insertLog.run('LOG-003', 'USR-889', 'Updated Inventory (SKU: BRS-005)', '2026-02-27T18:20:15Z', '202.43.11.9');
}

const inventoryCount = db.prepare('SELECT COUNT(*) as count FROM inventory').get() as { count: number };
if (inventoryCount.count === 0) {
    const insertItem = db.prepare('INSERT INTO inventory (id, name, category, sku, quantity, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertItem.run('1', 'Beras Premium 5kg', 'Sembako', 'BRS-005', 45, 75000, 'In Stock');
    insertItem.run('2', 'Minyak Goreng 2L', 'Sembako', 'MNY-002', 12, 34000, 'Low Stock');
    insertItem.run('3', 'Gula Pasir 1kg', 'Sembako', 'GLA-001', 0, 17000, 'Out of Stock');
    insertItem.run('4', 'Kopi Bubuk Lokal', 'Minuman', 'KOP-100', 120, 45000, 'In Stock');
    insertItem.run('5', 'Tepung Terigu 1kg', 'Sembako', 'TPG-001', 8, 12000, 'Low Stock');
}

export default db;
