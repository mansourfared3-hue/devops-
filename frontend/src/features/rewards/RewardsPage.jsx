import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Gift, Medal, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
const TYPE = {
  badge: { icon: Medal, label: "شارة", color: "bg-amber-100 text-amber-700" },
  prize: { icon: Gift, label: "جائزة", color: "bg-emerald-100 text-emerald-700" },
  honor: { icon: Star, label: "تكريم", color: "bg-violet-100 text-violet-700" },
};

function RewardsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = user?.role === "admin";
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("badge");

  const { data } = useQuery({ queryKey: ["rewards"], queryFn: () => api.getRewards() });
  const rewards = data?.rewards || [];
  const { data: usersData } = useQuery({ queryKey: ["admin-users"], queryFn: () => api.getAdminUsers(), enabled: isAdmin });
  const users = usersData?.users || [];

  const grant = useMutation({
    mutationFn: () => api.grantReward({ user: userId, title, type }),
    onSuccess: () => { toast.success("تم منح المكافأة"); setUserId(""); setTitle(""); setType("badge"); qc.invalidateQueries({ queryKey: ["rewards"] }); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Award className="w-5 h-5" /></div>
        <div><h1 className="text-xl font-extrabold text-slate-800">المكافآت</h1><p className="text-xs text-slate-400">{isAdmin ? "امنح المتفوقين مكافآتهم" : "مكافآتك وإنجازاتك"}</p></div>
      </div>

      {isAdmin && (
        <div className={`${card} p-5`}>
          <p className="font-extrabold text-slate-800 mb-3">منح مكافأة جديدة</p>
          <div className="grid md:grid-cols-3 gap-3">
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
              <option value="">اختر المستخدم</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان المكافأة" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
              <option value="badge">شارة</option><option value="prize">جائزة</option><option value="honor">تكريم</option>
            </select>
          </div>
          <button disabled={grant.isPending} onClick={() => { if (!userId || !title) return toast.error("اختر المستخدم واكتب العنوان"); grant.mutate(); }} className="mt-3 bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl">منح المكافأة</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {rewards.length === 0 && <p className="text-sm text-slate-400">لا توجد مكافآت بعد.</p>}
        {rewards.map((r) => {
          const meta = TYPE[r.type] || TYPE.badge; const Icon = meta.icon;
          return (
            <div key={r.id} className={`${card} p-4 flex items-center gap-3`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.color}`}><Icon className="w-5 h-5" /></div>
              <div className="flex-1 text-right"><p className="font-bold text-slate-800">{r.title}</p>{isAdmin && <p className="text-xs text-slate-400">{r.user?.name}</p>}</div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RewardsPage;
