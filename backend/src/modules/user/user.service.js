const User = require('./user.model');
const ApiError = require('../../shared/utils/ApiError');

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateProfile = async (userId, { name, avatar, theme }) => {
  const allowedUpdates = {};
  if (name) allowedUpdates.name = name;
  if (avatar) allowedUpdates.avatar = avatar;
  if (theme) allowedUpdates.theme = theme;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

module.exports = {
  getProfile,
  updateProfile
};
