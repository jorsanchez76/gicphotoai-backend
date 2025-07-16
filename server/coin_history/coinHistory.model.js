const { openDatabase } = require('../database/sqlite');

class CoinHistory {
  static async create(data) {
    try {
      const db = await openDatabase();
      
      // Format date as YYYY-MM-DD HH:MM:SS
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
      
      const result = await db.run(`
        INSERT INTO coin_history (
          user_id, coin_plan_id, payment_gateway, date, is_income, 
          coin, dollar, type, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        data.userId,
        data.coinPlanId || null,
        data.paymentGateway || 0,
        data.date || formattedDate,
        data.isIncome !== undefined ? data.isIncome : true,
        data.coin || 0,
        data.dollar || 0,
        data.type || 0
      ]);
      
      return await this.findById(result.lastID);
    } catch (error) {
      console.error('CoinHistory.create error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const db = await openDatabase();
      const history = await db.get('SELECT * FROM coin_history WHERE id = ?', [id]);
      return history;
    } catch (error) {
      console.error('CoinHistory.findById error:', error);
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT * FROM coin_history WHERE user_id = ?';
      const params = [userId];
      
      if (options.type !== undefined) {
        sql += ' AND type = ?';
        params.push(options.type);
      }
      
      if (options.isIncome !== undefined) {
        sql += ' AND is_income = ?';
        params.push(options.isIncome);
      }
      
      sql += ' ORDER BY date DESC';
      
      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(options.limit);
      }
      
      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
      
      const history = await db.all(sql, params);
      return history;
    } catch (error) {
      console.error('CoinHistory.findByUserId error:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT * FROM coin_history';
      const params = [];
      const conditions = [];
      
      if (options.userId) {
        conditions.push('user_id = ?');
        params.push(options.userId);
      }
      
      if (options.type !== undefined) {
        conditions.push('type = ?');
        params.push(options.type);
      }
      
      if (options.isIncome !== undefined) {
        conditions.push('is_income = ?');
        params.push(options.isIncome);
      }
      
      if (options.startDate && options.endDate) {
        conditions.push('date >= ? AND date < date(?, \'+1 day\')');
        params.push(options.startDate, options.endDate);
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      
      sql += ' ORDER BY date DESC';
      
      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(options.limit);
      }
      
      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
      
      const history = await db.all(sql, params);
      return history;
    } catch (error) {
      console.error('CoinHistory.findAll error:', error);
      throw error;
    }
  }

  static async getHistoryWithPagination(options = {}) {
    try {
      const db = await openDatabase();
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;
      
      let baseQuery = `
        SELECT 
          ch.*,
          u.name as user_name,
          cp.dollar as coin_plan_dollar,
          cp.coin as coin_plan_coin,
          cp.tag as coin_plan_tag
        FROM coin_history ch
        LEFT JOIN users u ON ch.user_id = u.id
        LEFT JOIN coin_plans cp ON ch.coin_plan_id = cp.id
      `;
      
      let countQuery = 'SELECT COUNT(*) as total FROM coin_history ch';
      let params = [];
      let conditions = [];
      
      if (options.userId) {
        conditions.push('ch.user_id = ?');
        params.push(options.userId);
      }
      
      if (options.type !== undefined) {
        conditions.push('ch.type = ?');
        params.push(options.type);
      }
      
      if (options.isIncome !== undefined) {
        conditions.push('ch.is_income = ?');
        params.push(options.isIncome);
      }
      
      if (options.startDate && options.endDate) {
        conditions.push('ch.date BETWEEN ? AND ?');
        params.push(options.startDate, options.endDate);
      }
      
      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        baseQuery += whereClause;
        countQuery += whereClause;
      }
      
      baseQuery += ' ORDER BY ch.date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [history, totalResult] = await Promise.all([
        db.all(baseQuery, params),
        db.get(countQuery, params.slice(0, -2)) // Remove limit and offset for count
      ]);
      
      const totalRecords = totalResult.total;
      const totalPages = Math.ceil(totalRecords / limit);
      
      return {
        history,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('CoinHistory.getHistoryWithPagination error:', error);
      throw error;
    }
  }

  static async getTotalCoins(options = {}) {
    try {
      const db = await openDatabase();
      let sql = 'SELECT SUM(CASE WHEN is_income = 1 THEN coin ELSE -coin END) as total_coins FROM coin_history';
      const params = [];
      const conditions = [];
      
      if (options.userId) {
        conditions.push('user_id = ?');
        params.push(options.userId);
      }
      
      if (options.type !== undefined) {
        conditions.push('type = ?');
        params.push(options.type);
      }
      
      if (options.startDate && options.endDate) {
        conditions.push('date >= ? AND date < date(?, \'+1 day\')');
        params.push(options.startDate, options.endDate);
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      
      const result = await db.get(sql, params);
      return result.total_coins || 0;
    } catch (error) {
      console.error('CoinHistory.getTotalCoins error:', error);
      throw error;
    }
  }
}

module.exports = CoinHistory;