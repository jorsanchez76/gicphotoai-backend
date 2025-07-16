const db = require('../database/sqlite.js');
const { Parser } = require('json2csv');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { baseURL } = require('../../config');

// --- Encryption Settings (matching your Python implementation) ---
const CONSTANT_DATOSENC_PWD = process.env.GIC_ENCRYPTION_PWD || "C0N574N7_D47053NC_P455W0RD";
const CONSTANT_DATOSENC_SAL = process.env.GIC_ENCRYPTION_SALT || "C0N574N7_54LD3536UR1D4D_P455W0RD";

function gicEncrypt(data, password, salt) {
  try {
    // Derive key manually with PBKDF2-HMAC-SHA256 (matching Python exactly)
    const passwordBuffer = typeof password === 'string' ? Buffer.from(password, 'utf-8') : password;
    const key = crypto.pbkdf2Sync(passwordBuffer, salt, 10000, 32, 'sha256'); // 10000 iterations, 32 bytes
    
    // Generate random IV (16 bytes)
    const iv = crypto.randomBytes(16);
    
    // Ensure data is Buffer
    const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
    
    // Create cipher with AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    // Encrypt data (with automatic PKCS7 padding)
    let encrypted = cipher.update(dataBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return IV + ciphertext (compatible with iOS format)
    return Buffer.concat([iv, encrypted]);
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

exports.generateConfig = async (req, res) => {
  try {
    const database = await db.openDatabase();
    const flags = await database.all('SELECT user, validity, trainer_replicate, description, computer_id FROM users_flags');

    if (flags.length === 0) {
      return res.status(404).json({ status: false, message: 'No user flags found to generate config.' });
    }

    // Process flags to handle null/undefined computer_id values
    const processedFlags = flags.map(flag => ({
      user: flag.user || '',
      validity: flag.validity || '',
      trainer_replicate: flag.trainer_replicate || '',
      description: flag.description || '',
      computer_id: flag.computer_id || ''
    }));

    // Convert to CSV with headers
    const json2csvParser = new Parser({ 
      header: true,
      fields: ['user', 'validity', 'trainer_replicate', 'description', 'computer_id']
    });
    const csv = json2csvParser.parse(processedFlags);
    const csvWithNewline = csv + '\n'; // Add final newline like in Python

    // Encrypt using GIC method (binary output, not hex)
    const saltBuffer = Buffer.from(CONSTANT_DATOSENC_SAL, 'utf8');
    const encryptedData = gicEncrypt(csvWithNewline, CONSTANT_DATOSENC_PWD, saltBuffer);
    
    if (!encryptedData) {
      return res.status(500).json({ status: false, message: 'Error during encryption.' });
    }

    // Save the encrypted file as binary
    const fileName = 'users_flags.cse';
    const filePath = path.join(__dirname, '../../storage', fileName);
    fs.writeFileSync(filePath, encryptedData); // Write as binary, not string

    // Respond with the URL
    const fileUrl = `${baseURL}storage/${fileName}`;
    res.json({ 
      status: true, 
      message: 'Configuration file generated successfully.',
      fileUrl: fileUrl,
      url: fileUrl,  // Keep both for compatibility
      last_modified: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating config file:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};