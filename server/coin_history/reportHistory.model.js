const { openDatabase } = require('../database/sqlite');

class ReportHistory {
  // Create the report_history table if it doesn't exist
  static async createTable() {
    try {
      const db = await openDatabase();
      await db.exec(`
        CREATE TABLE IF NOT EXISTS report_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          generated_at DATETIME NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          total_records INTEGER DEFAULT 0,
          total_coins INTEGER DEFAULT 0,
          file_size INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('report_history table created/verified successfully');
    } catch (error) {
      console.error('Error creating report_history table:', error);
      throw error;
    }
  }

  // Create a new report history record
  static async create(data) {
    try {
      const db = await openDatabase();
      
      // Ensure table exists
      await this.createTable();
      
      const result = await db.run(`
        INSERT INTO report_history (
          user_id, file_name, generated_at, start_date, end_date, 
          total_records, total_coins, file_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.userId,
        data.fileName,
        data.generatedAt,
        data.startDate,
        data.endDate,
        data.totalRecords || 0,
        data.totalCoins || 0,
        data.fileSize || 0
      ]);
      
      return await this.findById(result.lastID);
    } catch (error) {
      console.error('ReportHistory.create error:', error);
      throw error;
    }
  }

  // Find report by ID
  static async findById(id) {
    try {
      const db = await openDatabase();
      const report = await db.get('SELECT * FROM report_history WHERE id = ?', [id]);
      return report;
    } catch (error) {
      console.error('ReportHistory.findById error:', error);
      throw error;
    }
  }

  // Find all reports for a user
  static async findByUserId(userId, options = {}) {
    try {
      const db = await openDatabase();
      
      // Ensure table exists
      await this.createTable();
      
      let sql = 'SELECT * FROM report_history WHERE user_id = ?';
      const params = [userId];
      
      // Add date filtering if provided
      if (options.startDate && options.endDate) {
        sql += ' AND generated_at >= ? AND generated_at < date(?, \'+1 day\')';
        params.push(options.startDate, options.endDate);
      }
      
      // Order by most recent first
      sql += ' ORDER BY generated_at DESC';
      
      // Add pagination if provided
      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(options.limit);
      }
      
      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
      
      const reports = await db.all(sql, params);
      return reports;
    } catch (error) {
      console.error('ReportHistory.findByUserId error:', error);
      throw error;
    }
  }

  // Get reports with pagination
  static async getReportsWithPagination(userId, options = {}) {
    try {
      const db = await openDatabase();
      
      // Ensure table exists
      await this.createTable();
      
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;
      
      let baseQuery = 'SELECT * FROM report_history WHERE user_id = ?';
      let countQuery = 'SELECT COUNT(*) as total FROM report_history WHERE user_id = ?';
      let params = [userId];
      
      // Add date filtering if provided
      if (options.startDate && options.endDate) {
        baseQuery += ' AND generated_at >= ? AND generated_at < date(?, \'+1 day\')';
        countQuery += ' AND generated_at >= ? AND generated_at < date(?, \'+1 day\')';
        params.push(options.startDate, options.endDate);
      }
      
      baseQuery += ' ORDER BY generated_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [reports, totalResult] = await Promise.all([
        db.all(baseQuery, params),
        db.get(countQuery, params.slice(0, -2)) // Remove limit and offset for count
      ]);
      
      const totalRecords = totalResult.total;
      const totalPages = Math.ceil(totalRecords / limit);
      
      return {
        reports,
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
      console.error('ReportHistory.getReportsWithPagination error:', error);
      throw error;
    }
  }

  // Delete a report record
  static async deleteById(id) {
    try {
      const db = await openDatabase();
      const result = await db.run('DELETE FROM report_history WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('ReportHistory.deleteById error:', error);
      throw error;
    }
  }

  // Delete reports by user ID
  static async deleteByUserId(userId) {
    try {
      const db = await openDatabase();
      const result = await db.run('DELETE FROM report_history WHERE user_id = ?', [userId]);
      return result.changes;
    } catch (error) {
      console.error('ReportHistory.deleteByUserId error:', error);
      throw error;
    }
  }

  // Get total count of reports for a user
  static async getCountByUserId(userId) {
    try {
      const db = await openDatabase();
      
      // Ensure table exists
      await this.createTable();
      
      const result = await db.get('SELECT COUNT(*) as total FROM report_history WHERE user_id = ?', [userId]);
      return result.total;
    } catch (error) {
      console.error('ReportHistory.getCountByUserId error:', error);
      throw error;
    }
  }

  // Clean up old reports (older than specified days)
  static async cleanupOldReports(daysOld = 30) {
    try {
      const db = await openDatabase();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffString = cutoffDate.toISOString().slice(0, 19).replace('T', ' ');
      
      const result = await db.run('DELETE FROM report_history WHERE generated_at < ?', [cutoffString]);
      return result.changes;
    } catch (error) {
      console.error('ReportHistory.cleanupOldReports error:', error);
      throw error;
    }
  }
}

module.exports = ReportHistory;