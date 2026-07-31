import { useEffect, useState } from "react";
import { FileCheck2, Check, Trash2, FileText, Upload, Plus, X } from "lucide-react";
import { api } from "../api.js";

// الصفوف الدراسية (نفس أكواد الباك)
const GRADES = [
  { value: "sec-1", label: "الأول الثانوي" },
  { value: "sec-2", label: "الثاني الثانوي" },
  { value: "sec-3", label: "الثالث الثانوي" },
];
const TYPES = [
  { value: "pdf", label: "ملف PDF" },
  { value: "video", label: "فيديو" },
  { value: "graphic", label: "جرافيك توضيحي" },
];

// إدارة المواد — الأدمن يرفع مواد الوزارة الرسمية (معتمدة فوراً) + يوافق على مواد المدرسين
function Materials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // نموذج رفع مادة الوزارة
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("sec-1");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("pdf");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState(null);
  const [subjects, setSubjects] = useState([]);

  async function loadPending() {
    setLoading(true);
    try {
      const data = await api.getPendingMaterials();
      setItems(data.materials || []);
    } catch (e) {
      setMsg(e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPending();
  }, []);

  // نجيب مواد الصف المختار لقائمة المادة
  useEffect(() => {
    if (!showUpload) return;
    api.getSubjects(grade).then((d) => setSubjects(d.subjects || [])).catch(() => {});
  }, [grade, showUpload]);

  async function approve(id) {
    await api.approveMaterial(id);
    setMsg("تمت الموافقة على المادة ✅");
    loadPending();
  }

  async function reject(id) {
    await api.deleteMaterial(id);
    setMsg("تم رفض المادة وحذفها");
    loadPending();
  }

  async function uploadMinistry(e) {
    e.preventDefault();
    setMsg("");
    if (!title.trim() || !subject) {
      setMsg("اكتب العنوان واختر المادة");
      return;
    }
    if (!file && !fileUrl.trim()) {
      setMsg("ارفع ملفاً أو أدخل رابطاً");
      return;
    }
    try {
      // نبعت FormData عشان يدعم رفع ملف
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("subject", subject);
      fd.append("grade", grade);
      fd.append("type", type);
      if (file) fd.append("file", file);
      else fd.append("fileUrl", fileUrl.trim());

      const res = await api.createMaterial(fd);
      setMsg(res.message || "تم رفع مادة الوزارة (معتمدة فوراً) ✅");
      setTitle(""); setSubject(""); setFileUrl(""); setFile(null); setShowUpload(false);
    } catch (err) {
      setMsg(err.message);
    }
  }

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
  const input = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500";

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-800">إدارة المواد التعليمية</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">ارفع مواد الوزارة الرسمية، ووافق على مواد المدرسين.</p>
        </div>
        <button
          onClick={() => setShowUpload((s) => !s)}
          className="bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
        >
          {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showUpload ? "إغلاق" : "رفع مادة وزارة"}
        </button>
      </div>

      {msg && <p className="text-sm bg-blue-50 text-blue-700 rounded-lg p-2 my-3">{msg}</p>}

      {/* نموذج رفع مادة الوزارة */}
      {showUpload && (
        <form onSubmit={uploadMinistry} className={`${card} p-4 my-4`}>
          <p className="font-extrabold text-slate-800 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" /> رفع مادة الوزارة الرسمية
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">العنوان</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder="مثال: منهج الفيزياء الرسمي" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الصف</label>
              <select value={grade} onChange={(e) => { setGrade(e.target.value); setSubject(""); }} className={input}>
                {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">المادة</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className={input}>
                <option value="">{subjects.length ? "اختر المادة" : "لا توجد مواد لهذا الصف"}</option>
                {subjects.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">النوع</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">رفع ملف</label>
              <input type="file" accept=".pdf,image/*,video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">أو رابط خارجي</label>
              <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className={input} placeholder="https://..." />
            </div>
          </div>
          <button className="mt-4 bg-teal-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2">
            <Upload className="w-4 h-4" /> رفع (معتمدة فوراً)
          </button>
        </form>
      )}

      {/* قائمة الموافقة */}
      <h2 className="font-extrabold text-slate-800 mt-6 mb-3">مواد بانتظار موافقتك</h2>
      {loading && <p className="text-sm text-slate-400">جاري التحميل...</p>}
      {!loading && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
          لا توجد مواد بانتظار الموافقة حالياً 🎉
        </div>
      )}

      <div className="space-y-3">
        {items.map((m) => (
          <div key={m._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{m.title}</p>
                <p className="text-[11px] text-slate-400">
                  {m.subject?.name} • {m.type} • رفعها: أ. {m.uploadedBy?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => approve(m._id)} className="bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                <Check className="w-4 h-4" /> موافقة
              </button>
              <button onClick={() => reject(m._id)} className="bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> رفض
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Materials;
