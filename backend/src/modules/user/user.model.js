const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
      default: null,
    },
    verifyTokenExpiry: {
      type: Date,
      default: null,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

//fast lookup by refreshTokenHash for refreshing access tokens 
//or logging out from devices
userSchema.index({ refreshTokenHash: 1 });

//In controllers res.json(user) --use--> res.json(user.toPublicJSON())
//delete unnecessary fields from user object before sending to client
userSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshTokenHash;
  delete user.verifyToken;
  delete user.verifyTokenExpiry;
  return user;
};

userSchema.index(
  { name: 'text', email: 'text' },
  { weights: { name: 10, email: 5 }, name: 'user_text_index' }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
