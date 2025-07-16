const { openDatabase } = require('../database/sqlite');

class CoinPlan {
  static async findById(id) {
    try {
      const db = await openDatabase();
      const coinPlan = await db.get('SELECT * FROM coin_plans WHERE id = ?', [id]);
      return coinPlan;
    } catch (error) {
      console.error('CoinPlan.findById error:', error);
      throw error;
    }
  }

  static async findOne(query = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT * FROM coin_plans';
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
      const coinPlan = await db.get(sql, params);
      return coinPlan;
    } catch (error) {
      console.error('CoinPlan.findOne error:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT * FROM coin_plans';
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
      
      const coinPlans = await db.all(sql, params);
      return coinPlans;
    } catch (error) {
      console.error('CoinPlan.findAll error:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const db = await openDatabase();
      
      const result = await db.run(`
        INSERT INTO coin_plans (
          platform_type, product_key, dollar, coin, extra_coin, tag, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.platformType || 0,
        data.productKey,
        data.dollar,
        data.coin,
        data.extraCoin || 0,
        data.tag,
        data.isActive !== undefined ? data.isActive : true
      ]);
      
      const generatedId = await db.get('SELECT id FROM coin_plans WHERE rowid = ?', [result.lastID]);
      return await this.findById(generatedId.id);
    } catch (error) {
      console.error('CoinPlan.create error:', error);
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
        `UPDATE coin_plans SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error('CoinPlan.update error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const db = await openDatabase();
      await db.run('DELETE FROM coin_plans WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('CoinPlan.delete error:', error);
      throw error;
    }
  }
}

module.exports = CoinPlan;