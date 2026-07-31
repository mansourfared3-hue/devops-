import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// نجوم التقييم — لو interactive بيبقى فيها أزرار تقدر تضغط عليها
function StarRating({ rating, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const color = star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200";
        // العرض فقط: أيقونة من غير زرار (عشان مفيش أزرار بلا وظيفة)
        if (!interactive) return <Star key={star} className={`w-4 h-4 ${color}`} />;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star className={`w-5 h-5 ${color}`} />
          </button>
        );
      })}
    </div>
  );
}

// شاشة تقييم المعلمين — بتصميم الفيجما
function TeacherRating() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null); // id المعلم اللي بنقيّمه
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");

  // المعلمين جايين من الباك مرتبين حسب متوسط التقييم
  const { data, isLoading, error } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => api.getTeachers(),
  });
  const teachers = data?.teachers || [];

  // إرسال التقييم (الطالب بس هو اللي يقدر يقيّم)
  const rate = useMutation({
    mutationFn: (vars) => api.rateTeacher(vars.id, vars.rating, vars.comment),
    onSuccess: () => {
      toast.success("تم تسجيل تقييمك بنجاح!");
      setSelectedTeacher(null);
      setUserRating(0);
      setCommentText("");
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (e) => toast.error(e.message || "فشل إرسال التقييم"),
  });

  // نتأكد من الشروط قبل ما نبعت
  function handleSubmitRating(teacherId) {
    if (!user) {
      toast.error("يرجى تسجيل الدخول لتقييم المعلمين");
      return;
    }
    if (user.role !== "student") {
      toast.error("عذراً، التقييم متاح للطلاب فقط");
      return;
    }
    if (userRating < 1 || userRating > 5) {
      toast.error("يرجى اختيار عدد النجوم للتقييم");
      return;
    }
    rate.mutate({ id: teacherId, rating: userRating, comment: commentText });
  }

  // نفتح خانة التقييم لمعلم ونصفّر القيم القديمة
  function openRating(teacherId) {
    setSelectedTeacher(teacherId);
    setUserRating(0);
    setCommentText("");
  }

  // نقفل خانة التقييم
  function closeRating() {
    setSelectedTeacher(null);
    setUserRating(0);
    setCommentText("");
  }

  const filtered = teachers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* الهيدر */}
      <div className="text-right">
        <h1 className="text-xl font-extrabold text-slate-800">تقييم المعلمين</h1>
        <p className="text-xs text-slate-400 mt-1">شارك رأيك البنّاء لمساعدة المعلمين وبقية زملائك</p>
      </div>

      {/* البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المعلم..."
          className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs outline-none focus:border-blue-400"
        />
      </div>

      {/* الحالات: تحميل / خطأ / فاضي */}
      {isLoading && <p className="text-sm text-slate-400 text-center py-10">جاري تحميل المعلمين...</p>}
      {error && <p className="text-sm text-rose-500 text-center py-10">{error.message || "فشل تحميل المعلمين"}</p>}
      {!isLoading && !error && filtered.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-10 bg-[#F5F7FF] rounded-2xl">لا يوجد معلمون مطابقون للبحث.</p>
      )}

      {/* كروت المعلمين */}
      <div className="space-y-3">
        {filtered.map((teacher) => (
          <div key={teacher.id} className={`${card} p-5`}>
            <div className="flex items-center gap-4">
              {/* متوسط التقييم وعدد التقييمات */}
              <div className="text-left shrink-0">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-extrabold text-slate-800">{Number(teacher.avg_rating).toFixed(1)}</span>
                </div>
                <p className="text-[11px] text-slate-400">{teacher.ratings_count} تقييم</p>
              </div>

              <div className="flex-1 min-w-0 text-right">
                <h3 className="font-bold text-slate-800">{teacher.name}</h3>
                {/* تخصّص المدرس (المادة اللي بيدرّسها) */}
                {teacher.subject && (
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">مدرّس {teacher.subject}</span>
                )}
                <p className="text-xs text-slate-400 mt-1">{teacher.email}</p>
                <div className="flex justify-end mt-1">
                  <StarRating rating={Math.round(Number(teacher.avg_rating))} />
                </div>
              </div>

              {/* أول حرف من الاسم كصورة */}
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-extrabold text-white shrink-0">
                {teacher.name.charAt(0)}
              </div>
            </div>

            {/* خانة التقييم مفتوحة لهذا المعلم */}
            {selectedTeacher === teacher.id ? (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-end gap-3">
                  <StarRating rating={userRating} interactive onChange={setUserRating} />
                  <span className="text-xs font-bold text-slate-500">تقييمك:</span>
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="اكتب ملاحظاتك وتقييمك للمعلم..."
                  rows="3"
                  className="w-full bg-[#F5F7FF] rounded-xl p-3 text-xs text-slate-700 outline-none resize-none text-right"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeRating}
                    className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => handleSubmitRating(teacher.id)}
                    disabled={rate.isPending}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {rate.isPending ? "جاري الإرسال..." : "إرسال"}
                  </button>
                </div>
              </div>
            ) : (
              // الطالب بس هو اللي يشوف زرار التقييم
              user?.role === "student" && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => openRating(teacher.id)}
                    className="px-4 py-2 rounded-xl bg-[#F5F7FF] text-blue-600 text-xs font-bold flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-4 h-4" /> قيّم هذا المعلم
                  </button>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherRating;
