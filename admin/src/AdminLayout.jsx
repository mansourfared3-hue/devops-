import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileCheck2, Clock, CalendarClock, Users, Award, LogOut, Shield } from "lucide-react";

// روابط القائمة الجانبية للأدمن
const links = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/materials", label: "إدارة المواد", icon: FileCheck2 },
  { to: "/rewards", label: "المكافآت", icon: Award },
  { to: "/attendance", label: "حضور المدرسين", icon: Clock },
  { to: "/shifts", label: "شيفتات المناوبة", icon: CalendarClock },
  { to: "/users", label: "المستخدمون", icon: Users },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  }

  const adminName = JSON.parse(localStorage.getItem("admin_user") || "{}")?.name || "الأدمن";

  return (
    <div className="min-h-screen flex">
      {/* القائمة الجانبية (يمين لأننا RTL) */}
      <aside className="w-60 bg-white border-l border-slate-100 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-2 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">لوحة الأدمن</p>
            <p className="text-[11px] text-slate-400">EduCommunity</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold " +
                  (active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")
                }
              >
                <Icon className="w-4 h-4" /> {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </aside>

      {/* المحتوى */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-6">
          <span className="font-bold text-slate-700 text-sm">مرحباً، {adminName}</span>
          <span className="text-xs text-slate-400">منطقة الإدارة فقط</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
