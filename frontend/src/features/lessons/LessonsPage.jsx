import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Plus, Trash2, Pencil, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { GRADES, gradeLabel } from "../../lib/grades";

// شاشة الدروس المباشرة (أونلاين) — بالالتزام بتصميم الفيجما
function LessonsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === "teacher" || user?.role === "admin";

  const [grade, setGrade] = useState(user?.grade || "sec-1");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [startsAt, setStartsAt] = useState("");

  const { data } = useQuery({ queryKey: ["lessons", grade], queryFn: () => api.getLessons(grade) });
  const lessons = data?.lessons || [];

  const create = useMutation({
    mutationFn: () => api.createLesson({ title, grade, subject, startsAt }),
    onSuccess: () => { toast.success("تم إنشاء الدرس"); setTitle(""); setSubject(""); setStartsAt(""); setShowForm(false); qc.invalidateQueries({ queryKey: ["lessons", grade] }); },
    onError: (e) => toast.error(e.message),
  });
  const del = useMutation({ mutationFn: (id) => api.deleteLesson(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons", grade] }) });

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-5">
      {/* العمود الجانبي */}
      <div className="space-y-4">
        <div className={`${card} p-4`}>
          <p className="font-extrabold text-slate-800 text-sm text-center mb-3">{new Date().toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}</p>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
            {["س", "ج", "خ", "ر", "ث", "ن", "ح"].map((d) => <span key={d} className="font-bold">{d}</span>)}
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className={`py-1 rounded ${i === 15 ? "bg-blue-600 text-white" : "text-slate-500"}`}>{i + 1}</span>
            ))}
          </div>
        </div>
        <div className={`${card} p-4 border-r-4 border-r-teal-500`}>
          <p className="font-extrabold text-slate-800 text-sm mb-2">إحصائيات البث</p>
          <div className="flex items-center justify-between text-sm"><span className="text-slate-400 text-xs">إجمالي الدروس</span><span className="font-extrabold text-teal-600">{lessons.length}</span></div>
          <div className="flex items-center justify-between text-sm mt-2"><span className="text-slate-400 text-xs">رضا الطلاب</span><span className="font-extrabold text-amber-600 flex items-center gap-1">4.9/5 <Star className="w-3 h-3 fill-current" /></span></div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-right">
            <h1 className="text-xl font-extrabold text-slate-800">الدروس المباشرة (أونلاين)</h1>
            <p className="text-xs text-slate-400">أدر دروسك التفاعلية وتواصل مع طلابك في الوقت الفعلي.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
              {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            {canManage && <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"><Plus className="w-4 h-4" /> جدولة درس جديد</button>}
          </div>
        </div>

        {/* نموذج إنشاء درس */}
        {canManage && showForm && (
          <div className={`${card} p-4 grid md:grid-cols-3 gap-3`}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الدرس" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="المادة" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <button onClick={() => { if (!title || !startsAt) return toast.error("اكتب العنوان والموعد"); create.mutate(); }} disabled={create.isPending} className="md:col-span-3 bg-blue-600 text-white text-sm font-bold py-2 rounded-xl">حفظ الدرس</button>
          </div>
        )}

        {/* كروت الدروس */}
        <div className="space-y-3">
          {lessons.length === 0 && <p className="text-sm text-slate-400 text-center py-10">لا توجد دروس قادمة لهذا الصف.</p>}
          {lessons.map((l) => (
            <div key={l.id} className={`${card} p-4 flex items-center gap-4`}>
              <div className="w-28 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 shrink-0 hidden sm:block" />
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{l.subject || "عام"}</span>
                  <span className="text-[10px] text-slate-400">{gradeLabel(l.grade)}</span>
                </div>
                <p className="font-bold text-slate-800 mt-1">{l.title} - أ. {l.teacher?.name}</p>
                <p className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-1"><Clock className="w-3 h-3" /> {new Date(l.startsAt).toLocaleString("ar-EG")}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <a href={l.meetingUrl} target="_blank" rel="noreferrer"><button className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 w-full justify-center"><Video className="w-3.5 h-3.5" /> {canManage ? "بدء البث" : "انضمام"}</button></a>
                {canManage && <button onClick={() => del.mutate(l.id)} className="border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 justify-center"><Trash2 className="w-3.5 h-3.5" /> حذف</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LessonsPage;
