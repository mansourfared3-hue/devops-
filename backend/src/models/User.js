const mongoose = require('mongoose');

// شكل بيانات المستخدم في قاعدة البيانات
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'supervisor'],
      default: 'student',
    },
    grade: String,        // الصف الدراسي (للطالب)
    subject: String,      // تخصّص المدرس (فيزياء / رياضيات ...) — للمدرس فقط
    schoolCode: String,   // كود المدرسة
    nationalId: String,   // الرقم القومي
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true } // يضيف createdAt و updatedAt تلقائياً
);

// لما نحوّل المستخدم لـ JSON: نخلي id بدل _id ونشيل كلمة المرور (عشان الأمان)
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
