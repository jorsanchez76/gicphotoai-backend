const { openDatabase } = require('../database/sqlite');

class User {
  static async findById(id) {
    try {
      const db = await openDatabase();
      const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
      return user;
    } catch (error) {
      console.error('User.findById error:', error);
      throw error;
    }
  }

  static async findOne(query = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT * FROM users';
      const params = [];
      
      if (Object.keys(query).length > 0) {
        const conditions = [];
        Object.keys(query).forEach(key => {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          conditions.push(`${dbKey} = ?`);
          params.push(query[key]);
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      sql += ' LIMIT 1';
      const user = await db.get(sql, params);
      return user;
    } catch (error) {
      console.error('User.findOne error:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const db = await openDatabase();
      
      // Generate unique_id if not provided
      let uniqueId = data.uniqueId;
      if (!uniqueId) {
        // Find the last user with the highest unique_id
        const lastUser = await db.get('SELECT unique_id FROM users WHERE unique_id IS NOT NULL ORDER BY CAST(unique_id AS INTEGER) DESC LIMIT 1');
        const cnt = parseInt(lastUser?.unique_id);
        let count;
        if (!cnt) {
          count = 1;
        } else {
          count = cnt + 1;
        }
        
        // Format with leading zeros (7 digits total)
        const size = count.toString().length;
        uniqueId = size === 1 ? `000000${count}`
                 : size === 2 ? `00000${count}`
                 : size === 3 ? `0000${count}`
                 : size === 4 ? `000${count}`
                 : size === 5 ? `00${count}`
                 : size === 6 ? `0${count}`
                 : count.toString();
      }
      
      // First insert the user (letting SQLite generate the hex ID)
      const result = await db.run(`
        INSERT INTO users (
          name, bio, identity, unique_id, fcm_token, email, password, token,
          channel, gender, dob, image, country, login_type, last_login,
          platform_type, is_online, is_busy, is_block, is_host, is_signup,
          age, date, is_coin_plan, plan_start_date, coin_plan_id,
          live_streaming_id, agora_uid, coin, purchased_coin, mobile_number,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        data.name || 'GIC User',
        data.bio || 'Yes, This Is GIC User',
        data.identity,
        uniqueId,
        data.fcm_token,
        data.email || 'gic@gmail.com',
        data.password,
        data.token,
        data.channel,
        data.gender || 'Female',
        data.dob || '01-01-2000',
        data.image,
        data.country || '',
        data.loginType || 0,
        data.lastLogin,
        data.platformType || 0,
        data.isOnline || false,
        data.isBusy || false,
        data.isBlock || false,
        data.isHost || false,
        data.isSignup || false,
        data.age || 0,
        data.date,
        data.isCoinPlan || false,
        data.planStartDate,
        data.coinPlanId,
        data.liveStreamingId,
        data.agoraUid || 0,
        data.coin || 0,
        data.purchasedCoin || 0,
        data.mobileNumber
      ]);
      
      // Get the generated ID and return the user
      const generatedId = await db.get('SELECT id FROM users WHERE rowid = ?', [result.lastID]);
      return await this.findById(generatedId.id);
    } catch (error) {
      console.error('User.create error:', error);
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
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error('User.update error:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT * FROM users';
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
      
      const users = await db.all(sql, params);
      return users;
    } catch (error) {
      console.error('User.findAll error:', error);
      throw error;
    }
  }
}

module.exports = User;