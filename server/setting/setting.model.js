const { openDatabase } = require('../database/sqlite');

class Setting {
  static async findOne() {
    try {
      const db = await openDatabase();
      const setting = await db.get('SELECT * FROM settings LIMIT 1');
      return setting;
    } catch (error) {
      console.error('Setting.findOne error:', error);
      throw error;
    }
  }

  static async create(data = {}) {
    try {
      const db = await openDatabase();
      const result = await db.run(`
        INSERT INTO settings (
          agora_key, agora_certificate, privacy_policy_link, privacy_policy_text,
          term_and_condition, google_play_switch, google_play_email, google_play_key,
          stripe_switch, stripe_publishable_key, stripe_secret_key, razor_pay_switch,
          razor_pay_id, razor_secret_key, is_app_active, is_fake, link,
          welcome_message, redirect_app_url, redirect_message, charge_for_random_call,
          charge_for_private_call, withdraw_limit, coin_per_dollar, coin_charge,
          payment_gateway, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        data.agora_key || 'AGORA KEY',
        data.agora_certificate || 'AGORA CERTIFICATE',
        data.privacy_policy_link || 'PRIVACY POLICY LINK',
        data.privacy_policy_text || 'PRIVACY POLICY TEXT',
        data.term_and_condition || 'Term And Condition',
        data.google_play_switch || false,
        data.google_play_email || 'GOOGLE PLAY EMAIL',
        data.google_play_key || 'GOOGLE PLAY KEY',
        data.stripe_switch || false,
        data.stripe_publishable_key || 'STRIPE PUBLISHABLE KEY',
        data.stripe_secret_key || 'STRIPE SECRET KEY',
        data.razor_pay_switch || false,
        data.razor_pay_id || 'RAZOR PAY ID',
        data.razor_secret_key || 'RAZOR SECRET KEY',
        data.is_app_active !== undefined ? data.is_app_active : true,
        data.is_fake || false,
        data.link || '',
        data.welcome_message || 'Welcome to GICPhotoAI',
        data.redirect_app_url || 'Here Redirect App URL',
        data.redirect_message || 'Here Redirect Message',
        data.charge_for_random_call || 0,
        data.charge_for_private_call || 0,
        data.withdraw_limit || 0,
        data.coin_per_dollar || 50,
        data.coin_charge || 0,
        data.payment_gateway || '[]'
      ]);
      
      return await this.findOne();
    } catch (error) {
      console.error('Setting.create error:', error);
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
        `UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      return await this.findOne();
    } catch (error) {
      console.error('Setting.update error:', error);
      throw error;
    }
  }

  static async updateByQuery(query, data) {
    try {
      const setting = await this.findOne();
      if (!setting) {
        throw new Error('Settings not found');
      }
      return await this.update(setting.id, data);
    } catch (error) {
      console.error('Setting.updateByQuery error:', error);
      throw error;
    }
  }
}

module.exports = Setting;