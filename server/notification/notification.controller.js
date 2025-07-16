const Notification = require("./notification.model");
const User = require("../user/user.model");

// Import Host model (we'll create a simple one for updateFCM)
class Host {
  static async findById(id) {
    try {
      const { openDatabase } = require('../database/sqlite');
      const db = await openDatabase();
      const host = await db.get('SELECT * FROM hosts WHERE id = ?', [id]);
      return host;
    } catch (error) {
      console.error('Host.findById error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { openDatabase } = require('../database/sqlite');
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
        `UPDATE hosts SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error('Host.update error:', error);
      throw error;
    }
  }
}

//update FCM token for user or host
exports.updateFCM = async (req, res) => {
  try {
    console.log("updateFCM called");
    
    if (!req.query.fcm_token || !req.query.userId || !req.query.type) {
      return res.status(200).json({
        status: false,
        message: "Invalid Details! fcm_token, userId, and type are required",
      });
    }

    let user;
    
    if (req.query.type === "user") {
      user = await User.findById(req.query.userId);
      if (!user) {
        return res.status(200).json({ 
          status: false, 
          message: "User not found" 
        });
      }
      
      await User.update(req.query.userId, { 
        fcm_token: req.query.fcm_token 
      });
    } else if (req.query.type === "host") {
      user = await Host.findById(req.query.userId);
      if (!user) {
        return res.status(200).json({ 
          status: false, 
          message: "Host not found" 
        });
      }
      
      await Host.update(req.query.userId, { 
        fcm_token: req.query.fcm_token 
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Invalid type! Must be 'user' or 'host'",
      });
    }

    return res.status(200).json({ 
      status: true, 
      message: "FCM token updated successfully" 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};

//get notifications for user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(200).json({
        status: false,
        message: "userId is required",
      });
    }

    const notifications = await Notification.findAll({
      where: { userId: userId },
      orderBy: 'created_at',
      order: 'DESC'
    });

    return res.status(200).json({
      status: true,
      message: "Notifications retrieved successfully",
      notifications,
      total: notifications.length
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};

//get notifications for host
exports.getHostNotifications = async (req, res) => {
  try {
    const hostId = req.query.hostId;
    
    if (!hostId) {
      return res.status(200).json({
        status: false,
        message: "hostId is required",
      });
    }

    const notifications = await Notification.findAll({
      where: { hostId: hostId },
      orderBy: 'created_at',
      order: 'DESC'
    });

    return res.status(200).json({
      status: true,
      message: "Notifications retrieved successfully",
      notifications,
      total: notifications.length
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};

//create notification
exports.createNotification = async (req, res) => {
  try {
    const notificationData = {
      userId: req.body.userId,
      hostId: req.body.hostId,
      notificationType: req.body.notificationType,
      message: req.body.message,
      type: req.body.type,
      title: req.body.title,
      image: req.body.image,
      date: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    };

    const notification = await Notification.create(notificationData);

    return res.status(200).json({
      status: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};