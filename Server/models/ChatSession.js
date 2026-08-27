const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'tool'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    toolCallId: {
      type: String, // sirf 'tool' role messages ke liye
    },
    toolName: {
      type: String, // sirf 'tool' role messages ke liye (function ka naam)
    },
    toolCalls: {
      type: [mongoose.Schema.Types.Mixed], // sirf 'assistant' role messages ke liye, jab tool call hua ho
      default: undefined,
    },
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);