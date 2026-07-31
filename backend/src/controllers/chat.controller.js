const chatService = require('../services/chat.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر =====
// شغلها 3 خطوات بس ومفيش غيرهم:
//   1) تاخد البيانات من الطلب (req)
//   2) تنادي الـservice
//   3) تبعت الرد
// مفيش منطق ولا داتابيز هنا — ده شغل الـservice.
// ومفيش try/catch — ده شغل asyncHandler + error middleware.

async function getHistory(req, res) {
  const { messages, meta } = await chatService.getHistory(req.query);
  return sendSuccess(res, { messages }, '', meta); // الـmeta فيها بيانات الصفحات
}

async function sendMessage(req, res) {
  const message = await chatService.sendMessage(req.body, req.user.id);
  return sendCreated(res, { message }, 'تم إرسال الرسالة');
}

module.exports = { getHistory, sendMessage };
