const jwt = require('jsonwebtoken');
const User = require('../../modules/user/user.model');
const ApiError = require('../utils/ApiError');

//Jis API ko ye pata hona chahiye ki "request kis user ne bheji hai", 
//wahan authenticate middleware lagta hai.
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // TODO Phase 4: check token against Redis blacklist for force-logout
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token expired');
      }
      throw new ApiError(401, 'Invalid token');
    }
    
    // Find user
    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokenHash -verifyToken');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
