import { useEffect, useState } from "react";
import {
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  User,
  PenSquare,
  Menu,
  X,
  Coins,
  ConeIcon,
  Trash2,
  Edit3,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import {
  getConversations,
  deleteConversation,
  updateConversations,
} from "../features/conversation.api";
import {
  setConversations,
  setSelectedConversation,
  deleteConversationFromState,
  setConvTitle,
} from "../redux/conversation.slice";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";

const PanelIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

export default function Sidebar() {
  const [hovered, setHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const dispatch = useDispatch();
  const [editingId, setEditingId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const handleSaveTitle = async (conversationId) => {
    const newTitle = editTitleValue.trim();
    if (!newTitle || newTitle === "") {
      setEditingId(null);
      return;
    }
    try {
      await updateConversations(conversationId, newTitle);
      dispatch(setConvTitle({ conversationId, title: newTitle }));
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update chat title");
    }
  };

  const logout = async () => {
    dispatch(setUserData(null));
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [userData?._id]);

  const handleCreateConversation = () => {
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
    setMobileOpen(false);
  };

  const handleSelectConversation = async (conversation) => {
    setMobileOpen(false);
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));
    dispatch(setArtifacts(messages.artifacts));
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;
    try {
      await deleteConversation(conversationId);
      dispatch(deleteConversationFromState(conversationId));
      if (selectedConversation?._id === conversationId) {
        dispatch(setSelectedConversation(null));
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
      }
    } catch (error) {
      console.log(error);
      alert("Failed to delete conversation");
    }
  };

  /* ── Collapsed rail — desktop only ── */
  const collapsedRail = (
    <div className="hidden lg:flex flex-col items-center w-[56px] h-screen bg-[var(--paper-strong)] border-r border-[var(--line)] py-4 gap-1 shrink-0">
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f3e7dd] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-1"
      >
        <PanelIcon />
      </button>

      <button
        onClick={handleCreateConversation}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f3e7dd] transition-colors duration-150 bg-transparent border-none cursor-pointer"
      >
        <Plus size={17} />
      </button>

      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto w-full px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-1">
        {conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          return (
            <button
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              title={chat.title}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-150 border-none cursor-pointer
                ${isActive ? "bg-[#f3ddd4] text-[var(--accent-dark)]" : "bg-transparent text-[var(--muted)] hover:bg-[#f3e7dd] hover:text-[var(--ink)]"}`}
            >
              <MessageSquare size={15} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        {userData && (
          <div className="relative">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-8 h-8 rounded-[8px] object-cover border-2 border-[#d59b8c]"
              />
            ) : (
              <div className="w-8 h-8 rounded-[8px] bg-[#f3e7dd] flex items-center justify-center">
                <User size={14} className="text-[var(--muted)]" />
              </div>
            )}
            <span className="absolute -bottom-px -right-px w-2 h-2 bg-[var(--sage)] rounded-full border-[1.5px] border-[var(--paper-strong)] block" />
          </div>
        )}
      </div>
    </div>
  );

  /* ── Full sidebar content ── */
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[var(--line)]">
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f3e7dd] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <PanelIcon />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f3e7dd] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <X size={15} />
        </button>

        <span className="text-[16px] font-semibold text-[var(--ink)] tracking-tight flex-1">
          CortexAI Research
        </span>

        <span className="text-[10px] font-medium text-[var(--accent-dark)] bg-[#f3ddd4] border border-[#e6b9aa] px-2 py-0.5 rounded-full tracking-wide">
          {userData?.plan ?? "pro"}
        </span>

        <button
          onClick={handleCreateConversation}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f3e7dd] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <PenSquare size={14} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-4 pt-4 pb-1">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-[var(--accent)] rounded-xl py-[10px] border-none cursor-pointer hover:bg-[var(--accent-dark)] transition-colors duration-150"
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>

      {conversations.length == 0 ? (
        <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          No recent conversations
        </div>
      ) : (
        <p className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          Recents
        </p>
      )}

      {/* Section label */}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          const isHov = hovered === chat._id;
          const isEditing = editingId === chat._id;
          return (
            <div
              key={chat._id}
              onClick={() => !isEditing && handleSelectConversation(chat)}
              onMouseEnter={() => setHovered(chat._id)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150
                ${
                  isActive
                    ? "bg-[#f3ddd4] border-[#e6b9aa]"
                    : isHov
                      ? "bg-[#faf6ef] border-transparent"
                      : "bg-transparent border-transparent"
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg transition-colors duration-150
                  ${isActive ? "bg-[#f3ddd4] text-[var(--accent-dark)]" : "bg-[#f5f0e8] text-[var(--muted)]"}`}
                >
                  <MessageSquare size={13} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    onBlur={() => handleSaveTitle(chat._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle(chat._id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--paper-strong)] border border-[var(--line)] rounded px-1.5 py-0.5 text-[13px] text-[var(--ink)] w-full outline-none focus:border-[#d59b8c]"
                    autoFocus
                  />
                ) : (
                  <p
                    className={`text-[13px] font-medium truncate ${isActive ? "text-[var(--ink)]" : "text-[#5f574f]"} flex-1`}
                  >
                    {chat.title}
                  </p>
                )}
              </div>

              {!isEditing && isHov && (
                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingId(chat._id);
                      setEditTitleValue(chat.title);
                    }}
                    className="flex items-center justify-center w-6 h-6 rounded-md text-[var(--muted)] hover:text-[var(--accent-dark)] hover:bg-[#f3ddd4] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                    title="Edit title"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(e, chat._id)}
                    className="flex items-center justify-center w-6 h-6 rounded-md text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[#f4dfd8] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                    title="Delete chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-2.5 h-px bg-[var(--line)]" />

      {/* Footer */}
      <div className="px-3.5 py-3.5">
        {userData ? (
          <div className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-[#faf6ef] transition-colors duration-150">
            <div className="relative shrink-0">
              {!userData?.avatar || imageError ? (
                <div className="w-9 h-9 rounded-[10px] bg-[#f3e7dd] flex items-center justify-center">
                  <User size={15} className="text-[var(--muted)]" />
                </div>
              ) : (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-9 h-9 rounded-[10px] object-cover border-2 border-[#d59b8c]"
                  onError={() => setImageError(true)}
                />
              )}
              <span className="absolute -bottom-px -right-px w-[9px] h-[9px] bg-[var(--sage)] rounded-full border-2 border-[var(--paper-strong)] block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[var(--ink)] truncate">
                {userData.name}
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-px">
                {userData.plan || "Free Plan"}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={logout}
                className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-[var(--muted)] cursor-pointer hover:bg-[#f3e7dd] hover:text-[var(--ink)] transition-all duration-150"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-1">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/[0.05] border border-white/[0.08] rounded-xl py-[11px] cursor-pointer hover:bg-white/[0.08] transition-colors duration-150">
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (collapsed) return collapsedRail;

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--paper-strong)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors duration-150 cursor-pointer"
      >
        <Menu size={16} />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* ── Sidebar panel ── */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[270px] h-screen shrink-0
        bg-[var(--paper-strong)] border-r border-[var(--line)]
        transition-transform duration-250
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {sidebarContent}
      </div>

    </>
  );
}
