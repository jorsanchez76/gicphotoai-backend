const db = require('../database/sqlite.js');

// Get all user flags
exports.index = async (req, res) => {
  try {
    const database = await db.openDatabase();
    const flags = await database.all('SELECT * FROM users_flags');
    res.json({ status: true, userFlags: flags, total: flags.length });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Create a new user flag
exports.store = async (req, res) => {
  const { user, validity, trainer_replicate, description, computer_id } = req.body;
  if (!user) {
    return res.status(400).json({ status: false, message: 'User field is required.' });
  }

  try {
    const database = await db.openDatabase();
    const result = await database.run(
      'INSERT INTO users_flags (user, validity, trainer_replicate, description, computer_id) VALUES (?, ?, ?, ?, ?)',
      [user, validity, trainer_replicate, description, computer_id]
    );
    res.status(201).json({ status: true, message: 'User flag created.', data: { id: result.lastID } });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get a specific user flag
exports.show = async (req, res) => {
  try {
    const database = await db.openDatabase();
    const flag = await database.get('SELECT * FROM users_flags WHERE dbid = ?', [req.params.id]);
    if (!flag) {
      return res.status(404).json({ status: false, message: 'User flag not found.' });
    }
    res.json({ status: true, data: flag });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Update a user flag
exports.update = async (req, res) => {
  const { user, validity, trainer_replicate, description, computer_id } = req.body;
  if (!user) {
    return res.status(400).json({ status: false, message: 'User field is required.' });
  }

  try {
    const database = await db.openDatabase();
    const result = await database.run(
      'UPDATE users_flags SET user = ?, validity = ?, trainer_replicate = ?, description = ?, computer_id = ? WHERE dbid = ?',
      [user, validity, trainer_replicate, description, computer_id, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ status: false, message: 'User flag not found.' });
    }
    res.json({ status: true, message: 'User flag updated.' });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Delete a user flag
exports.destroy = async (req, res) => {
  try {
    const database = await db.openDatabase();
    const result = await database.run('DELETE FROM users_flags WHERE dbid = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ status: false, message: 'User flag not found.' });
    }
    res.json({ status: true, message: 'User flag deleted.' });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};