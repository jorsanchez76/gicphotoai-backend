const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const config = require('../../config');

let db = null;

async function openDatabase() {
  if (db) return db;
  
  try {
    db = await open({
      filename: path.join(__dirname, '../../', config.DB_PATH),
      driver: sqlite3.Database
    });
    
    console.log('SQLite: Successfully connected to database');
    await initializeTables();
    return db;
  } catch (error) {
    console.error('SQLite connection error:', error);
    throw error;
  }
}

async function initializeTables() {
  try {
    // Settings table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agora_key TEXT DEFAULT 'AGORA KEY',
        agora_certificate TEXT DEFAULT 'AGORA CERTIFICATE',
        privacy_policy_link TEXT DEFAULT 'PRIVACY POLICY LINK',
        privacy_policy_text TEXT DEFAULT 'PRIVACY POLICY TEXT',
        term_and_condition TEXT DEFAULT 'Term And Condition',
        google_play_switch BOOLEAN DEFAULT 0,
        google_play_email TEXT DEFAULT 'GOOGLE PLAY EMAIL',
        google_play_key TEXT DEFAULT 'GOOGLE PLAY KEY',
        stripe_switch BOOLEAN DEFAULT 0,
        stripe_publishable_key TEXT DEFAULT 'STRIPE PUBLISHABLE KEY',
        stripe_secret_key TEXT DEFAULT 'STRIPE SECRET KEY',
        razor_pay_switch BOOLEAN DEFAULT 0,
        razor_pay_id TEXT DEFAULT 'RAZOR PAY ID',
        razor_secret_key TEXT DEFAULT 'RAZOR SECRET KEY',
        is_app_active BOOLEAN DEFAULT 1,
        is_fake BOOLEAN DEFAULT 0,
        link TEXT DEFAULT '',
        welcome_message TEXT DEFAULT 'Welcome to gicphotoai',
        redirect_app_url TEXT DEFAULT 'Here Redirect App URL',
        redirect_message TEXT DEFAULT 'Here Redirect Message',
        charge_for_random_call INTEGER DEFAULT 0,
        charge_for_private_call INTEGER DEFAULT 0,
        withdraw_limit INTEGER DEFAULT 0,
        coin_per_dollar INTEGER DEFAULT 50,
        coin_charge INTEGER DEFAULT 0,
        payment_gateway TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
        name TEXT DEFAULT 'GIC User',
        bio TEXT DEFAULT 'Yes, This Is GIC User',
        identity TEXT,
        unique_id TEXT UNIQUE,
        fcm_token TEXT,
        email TEXT DEFAULT 'gic@gmail.com',
        password TEXT,
        token TEXT,
        channel TEXT,
        gender TEXT DEFAULT 'Female',
        dob TEXT DEFAULT '01-01-2000',
        image TEXT,
        country TEXT DEFAULT '',
        login_type INTEGER DEFAULT 0,
        last_login TEXT,
        platform_type INTEGER DEFAULT 0,
        is_online BOOLEAN DEFAULT 0,
        is_busy BOOLEAN DEFAULT 0,
        is_block BOOLEAN DEFAULT 0,
        is_host BOOLEAN DEFAULT 0,
        is_signup BOOLEAN DEFAULT 0,
        age INTEGER DEFAULT 0,
        date TEXT,
        is_coin_plan BOOLEAN DEFAULT 0,
        plan_start_date TEXT,
        coin_plan_id INTEGER,
        live_streaming_id INTEGER,
        agora_uid INTEGER DEFAULT 0,
        coin INTEGER DEFAULT 0,
        purchased_coin INTEGER DEFAULT 0,
        mobile_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Hosts table (for updateFCM functionality)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
        name TEXT DEFAULT 'GIC Host',
        bio TEXT DEFAULT 'I am GIC Host ☺',
        identity TEXT,
        fcm_token TEXT,
        email TEXT,
        mobile_number TEXT,
        unique_id TEXT,
        password TEXT,
        token TEXT,
        channel TEXT,
        gender TEXT DEFAULT 'Female',
        country TEXT DEFAULT '',
        login_type INTEGER DEFAULT 0,
        last_login TEXT,
        platform_type INTEGER DEFAULT 0,
        coin INTEGER DEFAULT 0,
        dob TEXT DEFAULT '01-01-2000',
        image TEXT,
        album TEXT DEFAULT '[]',
        cover_image TEXT DEFAULT 'https://work10.digicean.com/storage/defaultCoverImage.jpeg',
        is_online BOOLEAN DEFAULT 0,
        is_block BOOLEAN DEFAULT 0,
        is_busy BOOLEAN DEFAULT 0,
        is_live BOOLEAN DEFAULT 0,
        is_host BOOLEAN DEFAULT 1,
        is_accept BOOLEAN DEFAULT 0,
        is_connect BOOLEAN DEFAULT 0,
        age INTEGER,
        date TEXT,
        withdrawal_coin INTEGER DEFAULT 0,
        receive_coin INTEGER DEFAULT 0,
        receive_gift INTEGER DEFAULT 0,
        call_charge INTEGER DEFAULT 0,
        live_streaming_id INTEGER,
        agora_uid INTEGER DEFAULT 0,
        is_fake BOOLEAN DEFAULT 0,
        video TEXT,
        video_type INTEGER,
        image_type INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notifications table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
        user_id TEXT,
        host_id TEXT,
        notification_type INTEGER,
        message TEXT,
        type TEXT,
        title TEXT,
        image TEXT,
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (host_id) REFERENCES hosts (id)
      );
    `);

    // User Flags table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users_flags (
        dbid INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT,
        validity TEXT,
        trainer_replicate TEXT,
        description TEXT
      );
    `);

    // Coin Plan table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS coin_plans (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
        platform_type INTEGER DEFAULT 0,
        product_key TEXT,
        dollar REAL,
        coin INTEGER,
        extra_coin INTEGER DEFAULT 0,
        tag TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Admin table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Coin History table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS coin_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        coin_plan_id TEXT,
        payment_gateway INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        is_income BOOLEAN DEFAULT 1,
        coin INTEGER DEFAULT 0,
        dollar REAL DEFAULT 0,
        type INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (coin_plan_id) REFERENCES coin_plans (id)
      );
    `);

    // Insert default settings if table is empty
    const settingCount = await db.get('SELECT COUNT(*) as count FROM settings');
    if (settingCount.count === 0) {
      await db.run(`
        INSERT INTO settings (agora_key, coin_per_dollar, welcome_message) 
        VALUES ('AGORA KEY', 50, 'Welcome to GICPhotoAI')
      `);
      console.log('SQLite: Default settings inserted');
    }

    // Insert default admin if table is empty
    const adminCount = await db.get('SELECT COUNT(*) as count FROM admins');
    if (adminCount.count === 0) {
      const bcrypt = require('bcryptjs');
      const defaultPassword = await bcrypt.hash('password', 10);
      await db.run(`
        INSERT INTO admins (name, email, password) 
        VALUES ('GIC Admin', 'admin@gicphotoai.com', ?)
      `, [defaultPassword]);
      console.log('SQLite: Default admin created');
    }

    console.log('SQLite: Tables initialized successfully');
  } catch (error) {
    console.error('SQLite table initialization error:', error);
    throw error;
  }
}

async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
    console.log('SQLite: Database connection closed');
  }
}

module.exports = {
  openDatabase,
  closeDatabase,
  getDatabase: () => db
};