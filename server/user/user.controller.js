const User = require("./user.model");

// Helper function to map database user keys to client expected keys
function mapUserKeys(dbUser) {
  if (!dbUser) return null;
  
  return {
    age: dbUser.age,
    _id: dbUser.id,
    name: dbUser.name,
    bio: dbUser.bio,
    email: dbUser.email,
    password: dbUser.password,
    token: dbUser.token,
    channel: dbUser.channel,
    gender: dbUser.gender,
    dob: dbUser.dob,
    image: dbUser.image,
    country: dbUser.country,
    platformType: dbUser.platform_type,
    coin: dbUser.coin,
    isOnline: Boolean(dbUser.is_online),
    isBusy: Boolean(dbUser.is_busy),
    isBlock: Boolean(dbUser.is_block),
    isHost: Boolean(dbUser.is_host),
    isSignup: Boolean(dbUser.is_signup),
    uniqueID: dbUser.unique_id,
    identity: dbUser.identity,
    fcmToken: dbUser.fcm_token,
    lastLogin: dbUser.last_login,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at
  };
}

//get user profile
exports.userProfile = async (req, res) => {
  try {
    let findUser = null;
    
    // Handle GET request (by ID)
    if (req.method === 'GET') {
      const ID = req.query.id;
      if (!ID) {
        return res.status(400).json({ status: false, message: "Invalid ID" });
      }
      findUser = await User.findById(ID);
    }
    
    // Handle POST request (by identity/email)
    if (req.method === 'POST') {
      const { identity, email, fcm_token, loginType, country } = req.body;
      
      console.log('POST userProfile - Request body:', { identity, email, fcm_token, loginType, country });
      
      // Try to find user by identity first, then by email
      if (identity) {
        console.log('Searching user by identity:', identity);
        findUser = await User.findOne({ identity: identity });
        console.log('User found by identity:', findUser ? 'YES' : 'NO');
      }
      
      if (!findUser && email) {
        console.log('Searching user by email:', email);
        findUser = await User.findOne({ email: email });
        console.log('User found by email:', findUser ? 'YES' : 'NO');
      }
      
      // Update FCM token if user found and token provided
      if (findUser && fcm_token && findUser.fcm_token !== fcm_token) {
        console.log('Updating FCM token for user:', findUser.id);
        await User.update(findUser.id, { fcm_token: fcm_token });
        findUser.fcm_token = fcm_token;
      }
    }

    if (!findUser && req.method === 'POST') {
      // Create user if not found in POST request
      console.log('User not found, creating new user...');
      const userData = {
        identity: req.body.identity,
        email: req.body.email,
        fcm_token: req.body.fcm_token,
        loginType: parseInt(req.body.loginType) || 0,
        country: req.body.country,
        name: req.body.name || req.body.email?.split('@')[0] || 'GIC User'
      };
      
      findUser = await User.create(userData);
      console.log('New user created:', findUser.id);
    }
    
    if (!findUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Map database keys to client expected keys
    const mappedUser = mapUserKeys(findUser);

    return res.status(200).json({
      status: true,
      message: "User Profile Get Successfully",
      user: mappedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status: false, 
      message: error.message || "Server Error" 
    });
  }
};

//create user (simplified version for testing)
exports.createUser = async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      uniqueId: req.body.uniqueId,
      fcm_token: req.body.fcm_token,
      identity: req.body.identity,
      loginType: req.body.loginType,
      gender: req.body.gender,
      country: req.body.country,
      age: req.body.age,
      platformType: req.body.platformType
    };

    const newUser = await User.create(userData);
    const mappedUser = mapUserKeys(newUser);

    return res.status(200).json({
      status: true,
      message: "User Created Successfully!!",
      user: mappedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status: false, 
      message: error.message || "Server Error" 
    });
  }
};

//update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(200).json({ 
        status: false, 
        message: "userId is required!" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ 
        status: false, 
        message: "User does not exist!" 
      });
    }

    const updateData = {};
    
    // Only add fields that are provided in the request
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.gender !== undefined) updateData.gender = req.body.gender;
    if (req.body.country !== undefined) updateData.country = req.body.country;
    if (req.body.age !== undefined) updateData.age = req.body.age;
    if (req.body.fcm_token !== undefined) updateData.fcm_token = req.body.fcm_token;
    if (req.body.isOnline !== undefined) updateData.isOnline = req.body.isOnline;
    if (req.body.isBlock !== undefined) updateData.isBlock = req.body.isBlock;
    if (req.body.coin !== undefined) updateData.coin = req.body.coin;

    const updatedUser = await User.update(userId, updateData);
    const mappedUser = mapUserKeys(updatedUser);

    return res.status(200).json({
      status: true,
      message: "User Updated Successfully!!",
      user: mappedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status: false, 
      message: error.message || "Server Error" 
    });
  }
};

//get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      orderBy: 'created_at',
      order: 'DESC'
    });

    // Map all users to client expected format
    const mappedUsers = users.map(user => mapUserKeys(user));

    return res.status(200).json({
      status: true,
      message: "Users Retrieved Successfully",
      users: mappedUsers,
      total: mappedUsers.length
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status: false, 
      message: error.message || "Server Error" 
    });
  }
};

//toggle block/unblock user
exports.toggleBlockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { is_block } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        status: false, 
        message: "User ID is required!" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: false, 
        message: "User not found!" 
      });
    }

    const updateData = { is_block: is_block };
    const updatedUser = await User.update(userId, updateData);
    const mappedUser = mapUserKeys(updatedUser);

    return res.status(200).json({
      status: true,
      message: `User ${is_block ? 'blocked' : 'unblocked'} successfully!`,
      user: mappedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status: false, 
      message: error.message || "Server Error" 
    });
  }
};