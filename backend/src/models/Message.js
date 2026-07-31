const mongoose = require('mongoose');

// رسالة في الشات
const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true }, // اسم الغرفة (بنستخدم الصف كغرفة، مثل sec-1)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
