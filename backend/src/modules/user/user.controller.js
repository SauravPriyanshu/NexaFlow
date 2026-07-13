const userService = require('./user.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user._id);
    res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, theme } = req.body;
    const user = await userService.updateProfile(req.user._id, { name, avatar, theme });
    res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
