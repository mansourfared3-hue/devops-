import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Trophy, Medal } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { GRADES, gradeLabel } from "../lib/grades";

// شاشة المتصدرين — بشكل الفيجما
function Leaderboard() {
  const { user } = useAuth();
  const [grade, setGrade] = useState(user?.grade || "sec-1");
  const { data } = useQuery({ queryKey: ["leaderboard", grade], queryFn: () => api.getLeaderboard(grade) });
  const list = data?.leaderboard || [];

  const rankColor = (i) => i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-blue-600";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><BarChart3 className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-extrabold text-slate-800">المتصدرون</h1><p className="text-xs text-slate-400">أعلى الطلاب نقاطاً في {gradeLabel(grade)}</p></div>
        </div>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
          {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {list.length === 0 && <p className="text-sm text-slate-400 text-center py-10">لا يوجد طلاب في هذا الصف.</p>}
        {list.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-3 p-4 ${s.id === user?.id ? "bg-blue-50/50" : ""}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${rankColor(i)}`}>
              {i < 3 ? <Medal className="w-4 h-4" /> : i + 1}
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{s.name.charAt(0)}</div>
            <div className="flex-1 text-right">
              <p className="font-bold text-slate-800">{s.name}</p>
              <p className="text-[11px] text-slate-400">{(s.badges || []).length} شارة</p>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-extrabold text-sm"><Trophy className="w-4 h-4" /> {s.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
