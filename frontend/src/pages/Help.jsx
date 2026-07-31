import { HelpCircle } from "lucide-react";

const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
const faqs = [
  { q: "إزاي أدخل درس أونلاين؟", a: "من صفحة الدروس أونلاين، اضغط زر الانضمام وهيفتح لك رابط الفيديو." },
  { q: "إزاي أسلّم تاسك سوفت سكيلز؟", a: "من صفحة المهارات الناعمة، ارفع ملف البريزنتيشن واضغط سلّم." },
  { q: "منين أشوف مكافآتي؟", a: "من صفحة المكافآت في القائمة الجانبية." },
  { q: "إزاي أكلّم زمايلي؟", a: "من صفحة الشات، كل صف له غرفة خاصة." },
];

// شاشة المساعدة — بشكل الفيجما
function Help() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><HelpCircle className="w-5 h-5" /></div>
        <h1 className="text-xl font-extrabold text-slate-800">المساعدة والدعم</h1>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className={`${card} p-5 text-right`}>
            <h3 className="font-bold text-slate-800">{f.q}</h3>
            <p className="text-sm text-slate-400 mt-1">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Help;
