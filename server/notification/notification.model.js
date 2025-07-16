const { openDatabase } = require('../database/sqlite');

class Notification {
  static async findById(id) {
    try {
      const db = await openDatabase();
      const notification = await db.get('SELECT * FROM notifications WHERE id = ?', [id]);
      return notification;
    } catch (error) {
      console.error('Notification.findById error:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const db = await openDatabase();
      const result = await db.run(`
        INSERT INTO notifications (
          user_id, host_id, notification_type, message, type, title, image, date, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        data.userId,
        data.hostId,
        data.notificationType,
        data.message,
        data.type,
        data.title,
        data.image,
        data.date
      ]);
      
      // Get the generated ID and return the notification
      const generatedId = await db.get('SELECT id FROM notifications WHERE rowid = ?', [result.lastID]);
      return await this.findById(generatedId.id);
    } catch (error) {
      console.error('Notification.create error:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT * FROM notifications';
      const params = [];
      
      if (options.where) {
        const conditions = [];
        Object.keys(options.where).forEach(key => {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          conditions.push(`${dbKey} = ?`);
          params.push(options.where[key]);
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      if (options.orderBy) {
        const orderKey = options.orderBy.replace(/([A-Z])/g, '_$1').toLowerCase();
        sql += ` ORDER BY ${orderKey}`;
        if (options.order) {
          sql += ` ${options.order}`;
        }
      }
      
      if (options.limit) {
        sql += ` LIMIT ${options.limit}`;
      }
      
      const notifications = await db.all(sql, params);
      return notifications;
    } catch (error) {
      console.error('Notification.findAll error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const db = await openDatabase();
      
      const updateFields = [];
      const updateValues = [];
      
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          updateFields.push(`${dbKey} = ?`);
          updateValues.push(data[key]);
        }
      });
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);
      
      await db.run(
        `UPDATE notifications SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error('Notification.update error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const db = await openDatabase();
      await db.run('DELETE FROM notifications WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Notification.delete error:', error);
      throw error;
    }
  }
}

module.exports = Notification;