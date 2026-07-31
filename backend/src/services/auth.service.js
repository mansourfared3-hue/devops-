const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const ApiError = require('../utils/ApiError');

const HARDCODED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
const HARDCODED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';

// ===== طبقة الخدمات (Service) =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.
// الفايدة: نقدر نغيّر الداتابيز أو نعيد استخدام المنطق من غير ما نلمس الكنترولر.

// ===== التوكنات =====
// عندنا نوعين:
//   1) accessToken  — قصير (15 دقيقة)، بيتبعت مع كل طلب. لو اتسرق يبوظ بسرعة.
//   2) refreshToken — طويل (7 أيام)، وظيفته الوحيدة إنه يجيب accessToken جديد.
// كده لو حد سرق الـaccess عنده 15 دقيقة بس بدل 7 أيام،
// والمستخدم مايضطرش يسجّل دخول كل ربع ساعة.

function makeAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function makeRefreshToken(user) {
  return jwt.sign(
    { id: user._id, type: 'refresh' }, // مفيش دور ولا اسم — ده للتجديد بس
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function makeTokens(user) {
  return { token: makeAccessToken(user), refreshToken: makeRefreshToken(user) };
}

// ===== تسجيل حساب جديد =====
async function register(data) {
  const { name, email, password, role, grade, subject, schoolCode, nationalId } = data;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'البريد مسجّل من قبل');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || 'student',
    grade,
    subject: role === 'teacher' ? subject : undefined, // التخصّص للمدرس بس
    schoolCode,
    nationalId,
  });

  return { user, ...makeTokens(user) };
}

// ===== تسجيل الدخول =====
async function login({ email, password }) {
  const normalizedEmail = (email || '').toLowerCase();

  if (normalizedEmail === HARDCODED_ADMIN_EMAIL && password === HARDCODED_ADMIN_PASSWORD) {
    const adminUser = await User.findOne({ email: HARDCODED_ADMIN_EMAIL, role: 'admin' });
    if (!adminUser) throw new ApiError(401, 'بيانات الدخول غير صحيحة');

    return { user: adminUser, ...makeTokens(adminUser) };
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new ApiError(401, 'بيانات الدخول غير صحيحة');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'بيانات الدخول غير صحيحة');

  // لو المستخدم مدرس: نفتح له سجل حضور تلقائي (الأدمن بيبني عليه التقييم)
  if (user.role === 'teacher') {
    await Attendance.create({ teacher: user._id, loginAt: new Date() });
  }

  return { user, ...makeTokens(user) };
}

// ===== تجديد التوكن =====
// الفرونت بيبعت الـrefreshToken لما الـaccess يخلص، وبناخد واحد جديد.
async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    throw new ApiError(401, 'انتهت الجلسة — سجّل دخول من جديد');
  }

  // نتأكد إنه refresh token مش access token (حد ممكن يبعت النوع الغلط)
  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'توكن غير صالح');
  }

  // نتأكد إن المستخدم لسه موجود (ممكن يكون اتحذف)
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'المستخدم غير موجود');

  return { user, ...makeTokens(user) };
}

// ===== بياناتي =====
async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'المستخدم غير موجود');
  return user;
}

// ===== تعديل بياناتي =====
async function updateMe(userId, { name, password }) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'المستخدم غير موجود');

  if (name) user.name = name;
  if (password) user.password = await bcrypt.hash(password, 10);

  await user.save();

  // نرجّع توكنات جديدة لأن الاسم جوّا الـaccess token
  return { user, ...makeTokens(user) };
}

module.exports = { register, login, refresh, getMe, updateMe };
