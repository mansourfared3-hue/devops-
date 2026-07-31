const multer = require('multer');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryReady } = require('../config/cloudinary');

// ميدلوير رفع الملفات.
// multer هو اللي بيستقبل الملف من الطلب، والـ storage هو اللي بيقرّر يحطّه فين.

let storage;

if (isCloudinaryReady) {
  // (1) الوضع الأساسي: نرفع على Cloudinary
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'educommunity',                              // كل ملفاتنا في فولدر واحد
      resource_type: 'auto',                               // يكتشف لوحده: صورة / فيديو / pdf
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'],
    },
  });
  console.log('☁️  رفع الملفات: Cloudinary');
} else {
  // (2) الوضع الاحتياطي: تخزين محلي (لو مفاتيح Cloudinary مش متظبّطة)
  const dir = 'uploads';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
  });
  console.log('💾 رفع الملفات: تخزين محلي (مفاتيح Cloudinary غير مضبوطة في .env)');
}

// أقصى حجم للملف = 10 ميجا
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// دالة صغيرة بترجّع رابط الملف المرفوع.
// Cloudinary بيدّي رابط كامل في req.file.path، والتخزين المحلي بيدّي اسم الملف بس.
function getFileUrl(file) {
  if (!file) return null;
  return isCloudinaryReady ? file.path : '/uploads/' + file.filename;
}

module.exports = upload;
module.exports.getFileUrl = getFileUrl;
