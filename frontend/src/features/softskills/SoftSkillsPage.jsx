import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Plus, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

// بطاقة تاسك للطالب
function StudentTaskCard({ task, mySub }) {
  const qc = useQueryClient();
  const [file, setFile] = useState(null);
  const submit = useMutation({
    mutationFn: () => { const fd = new FormData(); fd.append("file", file); return api.submitTask(task.id, fd); },
    onSuccess: () => { toast.success("تم تسليم البريزنتيشن"); qc.invalidateQueries({ queryKey: ["my-subs"] }); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{task.points} نقطة</span>
        <h3 className="font-bold text-slate-800">{task.title}</h3>
      </div>
      {task.description && <p className="text-sm text-slate-400 mt-1 text-right">{task.description}</p>}
      {mySub ? (
        <div className="mt-3 flex items-center justify-end gap-2 text-sm text-emerald-600">
          <CheckCircle className="w-4 h-4" />
          {mySub.grade != null ? `تم التصحيح — درجتك: ${mySub.grade}` : "تم التسليم — بانتظار التصحيح"}
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs flex-1" />
          <button disabled={!file || submit.isPending} onClick={() => submit.mutate()} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> سلّم</button>
        </div>
      )}
    </div>
  );
}

// صف تسليم للمدرس (تصحيح)
function SubRow({ sub }) {
  const qc = useQueryClient();
  const [grade, setGrade] = useState(sub.grade ?? "");
  const g = useMutation({
    mutationFn: () => api.gradeSubmission(sub.id, { grade: Number(grade) }),
    onSuccess: () => { toast.success("تم حفظ الدرجة"); qc.invalidateQueries({ queryKey: ["all-subs"] }); },
  });
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FF] flex-wrap">
      <div className="flex-1 text-right"><p className="font-bold text-sm">{sub.student?.name}</p><p className="text-xs text-slate-400">{sub.task?.title}</p></div>
      <a href={"http://localhost:5000" + sub.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold">فتح الملف</a>
      <input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="درجة" className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm" />
      <button disabled={g.isPending} onClick={() => g.mutate()} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">حفظ</button>
    </div>
  );
}

function SoftSkillsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === "teacher" || user?.role === "admin";
  const isStudent = user?.role === "student";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(10);

  const { data: tData } = useQuery({ queryKey: ["tasks"], queryFn: () => api.getTasks() });
  const tasks = tData?.tasks || [];
  const { data: myS } = useQuery({ queryKey: ["my-subs"], queryFn: () => api.getTaskSubmissions(), enabled: isStudent });
  const myByTask = {}; (myS?.submissions || []).forEach((s) => { myByTask[s.task?.id || s.task] = s; });
  const { data: allS } = useQuery({ queryKey: ["all-subs"], queryFn: () => api.getTaskSubmissions(), enabled: canManage });

  const create = useMutation({
    mutationFn: () => api.createTask({ title, description, points }),
    onSuccess: () => { toast.success("تم إنشاء التاسك"); setTitle(""); setDescription(""); setPoints(10); qc.invalidateQueries({ queryKey: ["tasks"] }); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
        <div><h1 className="text-xl font-extrabold text-slate-800">المهارات الناعمة</h1><p className="text-xs text-slate-400">اقرأ، ابحث، وقدّم بريزنتيشن واكسب نقاط</p></div>
      </div>

      {canManage && (
        <div className={`${card} p-5`}>
          <p className="font-extrabold text-slate-800 mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> إضافة تاسك جديد</p>
          <div className="grid gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان التاسك" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="الوصف" rows={2} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
          </div>
          <button disabled={create.isPending} onClick={() => { if (!title) return toast.error("اكتب العنوان"); create.mutate(); }} className="mt-3 bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl">حفظ التاسك</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {tasks.length === 0 && <p className="text-sm text-slate-400">لا توجد تاسكات بعد.</p>}
        {tasks.map((t) => isStudent
          ? <StudentTaskCard key={t.id} task={t} mySub={myByTask[t.id]} />
          : <div key={t.id} className={`${card} p-5`}><div className="flex items-center justify-between"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{t.points} نقطة</span><h3 className="font-bold text-slate-800">{t.title}</h3></div>{t.description && <p className="text-sm text-slate-400 mt-1 text-right">{t.description}</p>}</div>
        )}
      </div>

      {canManage && (
        <div>
          <h2 className="font-extrabold text-slate-800 mb-3">التسليمات للتصحيح</h2>
          <div className="space-y-2">
            {(allS?.submissions || []).length === 0 && <p className="text-sm text-slate-400">لا توجد تسليمات بعد.</p>}
            {(allS?.submissions || []).map((s) => <SubRow key={s.id} sub={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default SoftSkillsPage;
