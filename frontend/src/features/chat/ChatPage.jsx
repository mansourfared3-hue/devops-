import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { GRADES, gradeLabel } from "../../lib/grades";

// شات الصف — لحظي عبر Socket.IO
// الفكرة:
//   1) أول ما ندخل الغرفة: نجيب سجل الرسائل القديمة عبر REST
//   2) بعدها: نسمع رسائل جديدة لحظياً من الـ Socket (من غير ما نسأل السيرفر)
function ChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [room, setRoom] = useState(user?.grade || "sec-1");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingName, setTypingName] = useState(""); // مين بيكتب دلوقتي
  const bottomRef = useRef(null);

  // (1) نجيب سجل الرسائل كل ما نغيّر الغرفة
  useEffect(() => {
    api.getMessages(room).then((data) => setMessages(data.messages || []));
  }, [room]);

  // (2) نتعامل مع الـ Socket: ندخل الغرفة ونسمع الأحداث
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_room", room); // ندخل غرفة الصف

    // رسالة جديدة وصلت → نضيفها للقائمة
    const onNewMessage = (message) => {
      if (message.room === room) setMessages((prev) => [...prev, message]);
    };
    // حد بيكتب → نعرض "بيكتب..." ونخفيها بعد ثانيتين
    const onTyping = ({ name }) => {
      setTypingName(name);
      setTimeout(() => setTypingName(""), 2000);
    };

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onTyping);

    // نشيل المستمعين لما نغيّر الغرفة (عشان مايتكرّروش)
    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onTyping);
    };
  }, [socket, room]);

  // ننزل لآخر رسالة تلقائياً
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingName]);

  // نبعت رسالة عبر الـ Socket (مش REST) عشان توصل الكل فوراً
  function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit("send_message", { room, text: text.trim() });
    setText("");
  }

  // نبلّغ إننا بنكتب (كل ما المستخدم يكتب حرف)
  function handleTyping(e) {
    setText(e.target.value);
    if (socket) socket.emit("typing", room);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-extrabold text-slate-800">شات الصف</h1><p className="text-xs text-slate-400">تكلّم مع زملائك في {gradeLabel(room)}</p></div>
        </div>
        <select value={room} onChange={(e) => setRoom(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
          {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-[60vh] overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 && <p className="text-center text-slate-400 my-auto">لا توجد رسائل بعد. ابدأ الكلام!</p>}
        {messages.map((m) => {
          const mine = m.user?.id === user?.id;
          return (
            <div key={m.id || m._id} className={`max-w-[75%] ${mine ? "self-start" : "self-end"}`}>
              <div className={`rounded-2xl px-4 py-2 ${mine ? "bg-blue-600 text-white" : "bg-[#F1F5F9]"}`}>
                {!mine && <p className="text-[11px] font-bold mb-0.5 text-slate-500">{m.user?.name}</p>}
                <p className="text-sm">{m.text}</p>
              </div>
            </div>
          );
        })}
        {/* مؤشّر "بيكتب دلوقتي" */}
        {typingName && <p className="text-[11px] text-slate-400 self-end">{typingName} بيكتب...</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 mt-3">
        <input value={text} onChange={handleTyping} placeholder="اكتب رسالتك..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-blue-600 text-white font-bold px-5 rounded-xl flex items-center gap-1.5"><Send className="w-4 h-4" /> إرسال</button>
      </form>
    </div>
  );
}

export default ChatPage;
