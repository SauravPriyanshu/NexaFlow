const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000
    },
    type: {
      type: String,
      enum: ['text', 'file', 'image', 'system'],
      default: 'text'
    },
    fileUrl: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      default: null
    },
    // Reply-to: snapshot of the original message so it works even if original is deleted
    replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
      senderName: { type: String, default: null },
      content: { type: String, default: null }
    },
    // Reactions: { "👍": ["userId1", "userId2"], ... }
    reactions: {
      type: Map,
      of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: {}
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
      }
    ],
    editedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletedByRole: { type: String, enum: ['self', 'admin', 'owner'], default: null }
  },
  { timestamps: true }
);

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index(
  { content: 'text' },
  { name: 'message_text_index' }
);
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
