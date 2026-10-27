import {
  Share2,
  MoreHorizontal,
  Zap,
  ChartBar,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function Navbar() {
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { messages } = useSelector((state) => state.message);
  return (
    <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--line)] bg-[var(--paper-strong)]">
      {/* Left — chat title */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#f3ddd4] border border-[#e6b9aa]">
        <MessageSquare size={14} className="text-[var(--accent-dark)]" />
        </div>
        <h2 className="text-[14px] font-semibold text-slate-100 tracking-tight">
          {selectedConversation?.title || "Research Workspace"}
        </h2>
        <span className="text-[10px] font-medium text-[var(--muted)] bg-[#f2ece3] border border-[var(--line)] px-2.5 py-1 rounded-full">
          {messages.length ? `${messages.length} messages` : "Source-aware studio"}
        </span>
      </div>

      {/* Right — actions */}
    </div>
  );
}
