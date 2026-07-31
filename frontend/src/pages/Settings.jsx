import { useState } from "react";
import { Settings as SettingsIcon, LogOut, User, Mail, Shield, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
const input = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500";

// شاشة الإعدادات — بشكل الفيجما
function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const roleLabel = user?.role === "teacher" ? "معلم" : user?.role === "admin" ? "مدير النظام" : "طالب";

  // بيانات التعديل
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // نحفظ التعديلات في الباك
  async function handleSave(e) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    if (password && password.length < 6) {
      toast.error("كلمة المرور يجب ألا تقل عن 6 أحرف");
      return;
    }

    setSaving(true);
    try {
      // نبعت الاسم دائماً، وكلمة المرور بس لو المستخدم كتبها
      const body = { name: name.trim() };
      if (password) body.password = password;

      const res = await api.updateMe(body);

      // السيرفر بيرجّع توكنين جديدين لأن الاسم جوّا الـ access token
      if (res.token) localStorage.setItem("token", res.token);
      if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
      await refreshUser();

      setPassword("");
      toast.success(res.message || "تم حفظ التعديلات");
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><SettingsIcon className="w-5 h-5" /></div>
        <h1 className="text-xl font-extrabold text-slate-800">الإعدادات</h1>
      </div>

      {/* بيانات الحساب (للعرض) */}
      <div className={`${card} p-6`}>
        <h2 className="font-extrabold text-slate-800 mb-4">بيانات الحساب</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-end gap-2"><span className="text-slate-800 font-bold">{user?.name}</span><User className="w-4 h-4 text-slate-400" /></div>
          <div className="flex items-center justify-end gap-2"><span className="text-slate-800">{user?.email}</span><Mail className="w-4 h-4 text-slate-400" /></div>
          <div className="flex items-center justify-end gap-2"><span className="text-slate-800">{roleLabel}</span><Shield className="w-4 h-4 text-slate-400" /></div>
        </div>
      </div>

      {/* تعديل البيانات */}
      <form onSubmit={handleSave} className={`${card} p-6`}>
        <h2 className="font-extrabold text-slate-800 mb-1">تعديل بياناتي</h2>
        <p className="text-xs text-slate-400 mb-4">غيّر اسمك أو كلمة مرورك.</p>

        <label className="block text-xs font-bold text-slate-500 mb-1">الاسم</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${input} mb-3`} placeholder="اسمك" />

        <label className="block text-xs font-bold text-slate-500 mb-1">كلمة مرور جديدة</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${input} mb-1`}
          placeholder="اتركها فارغة لو مش عايز تغيّرها"
        />
        <p className="text-[11px] text-slate-400 mb-4">6 أحرف على الأقل</p>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>

      {/* الحساب */}
      <div className={`${card} p-6`}>
        <h2 className="font-extrabold text-slate-800 mb-3">الحساب</h2>
        <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 text-rose-500 font-bold text-sm border border-rose-200 rounded-xl px-4 py-2 hover:bg-rose-50">
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export default Settings;
