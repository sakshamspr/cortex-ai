import { useState } from "react";
import {
  Send,
  Paperclip,
  Square,
  Zap,
  MessageSquare,
  Code2,
  Presentation,
  Image as ImageIcon,
  Globe,
  FileText,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setIsLoading } from "../redux/message.slice";
import { sendPrompt } from "../features/agent.api";
import { Mic, MicOff } from "lucide-react";
import { useEffect } from "react";
import {
  createConversation,
  updateConversations,
} from "../features/conversation.api";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversation.slice";
import { useRef } from "react";

export default function ChatInput({ setBanner }) {
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading } = useSelector((state) => state.message);
  const fileRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const placeholders = {
    auto: "Ask CortexAI...",

    chat: "Chat with CortexAI...",

    coding: "Describe the software you want...",

    pdf: "Generate a PDF about...",

    ppt: "Create a presentation about...",

    image: "Describe the image...",

    search: "Search the web...",
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },

    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },

    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },

    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },

    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },

    {
      id: "image",
      icon: ImageIcon,
      label: "Image",
    },

    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  const researchActions = [
    {
      label: "Research brief",
      prompt: "Create a concise research brief from the uploaded source. Include the thesis, key concepts, evidence, open questions, and a short conclusion.",
      agent: "chat",
    },
    {
      label: "Presentation",
      prompt: "Create a clear academic presentation from the uploaded source with a title, learning objectives, key ideas, evidence, and conclusion.",
      agent: "ppt",
    },
    {
      label: "Questionnaire",
      prompt: "Generate a balanced study questionnaire from the uploaded source with factual, conceptual, and application questions followed by an answer key.",
      agent: "chat",
    },
    {
      label: "Assignment",
      prompt: "Create a college-level assignment from the uploaded source with context, learning objectives, tasks, evaluation criteria, and extension questions.",
      agent: "chat",
    },
  ];

  useEffect(() => {
    const handlePresetPrompt = (event) => {
      setValue(event.detail?.prompt || "");
      if (event.detail?.agent) setSelectedAgent(event.detail.agent);
    };
    window.addEventListener("cortex:prompt", handlePresetPrompt);
    return () => window.removeEventListener("cortex:prompt", handlePresetPrompt);
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.interimResults = true;

    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported");

      return;
    }

    if (isListening) {
      recognitionRef.current.stop();

      setIsListening(false);
    } else {
      recognitionRef.current.start();

      setIsListening(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const prompt = value.trim();
    if (!prompt) return;

    dispatch(setIsLoading(true));

    try {
      let conversation = selectedConversation;

      if (!conversation) {
        const newConversation = await createConversation();
        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));
        conversation = newConversation;
      }

      if (conversation.title === "New Chat") {
        await updateConversations(conversation._id, prompt.slice(0, 40));
        dispatch(
          setConvTitle({
            conversationId: conversation._id,
            title: prompt.slice(0, 40),
          }),
        );
      }

      const userFiles = [];
      if (selectedFile) {
        userFiles.push({
          url: URL.createObjectURL(selectedFile),
          name: selectedFile.name,
          type: selectedFile.type,
        });
      }

      dispatch(addMessage({ role: "user", content: prompt, files: userFiles }));
      setValue("");

      const formData = new FormData();

      formData.append("conversationId", conversation._id);

      formData.append("prompt", prompt);

      formData.append("agent", selectedAgent);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      setSelectedFile(null);

      const data = await sendPrompt(formData);
      console.log(data);
      dispatch(
        addMessage({
          role: "assistant",
          content: data.answer,
          images: data.images,
          trace: data.trace,
        }),
      );

      console.log(data);

      if (data.artifacts) {
        dispatch(setArtifacts(data.artifacts));
      }
    } catch (error) {
      const responseData = error.response?.data;
      setBanner({
        open: true,
        title: responseData?.title || "Request could not be completed",
        message:
          responseData?.message ||
          responseData?.error ||
          error.message ||
          "Please check that the services are running and try again.",
      });
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="flex flex-col gap-2 bg-[var(--paper-strong)] border border-[var(--line)] rounded-2xl px-4 pt-3.5 pb-3 shadow-[0_8px_24px_rgba(74,54,38,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Research actions
          </p>
          <span className="text-[10px] text-[var(--muted)]">
            {selectedFile ? `Source attached: ${selectedFile.name}` : "Upload a PDF to ground the result"}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {researchActions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setSelectedAgent(action.agent);
                setValue(action.prompt);
              }}
              className="shrink-0 rounded-full border border-[var(--line)] bg-[#faf6ef] px-3 py-1.5 text-[11px] font-medium text-[var(--muted)] transition-colors hover:border-[#d59b8c] hover:text-[var(--accent-dark)]"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="flex w-[80%] gap-2 pr-2 flex-wrap">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = selectedAgent === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`
            flex-shrink-0
            
            inline-flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-full
            text-xs
            font-medium
            border
            transition-all

            ${
              isActive
                ? "bg-[var(--accent)] text-white border-transparent shadow-[0_1px_8px_rgba(196,95,69,.28)]"
                : "bg-[#faf6ef] text-[var(--muted)] border-[var(--line)] hover:bg-[#f3e7dd]"
            }
          `}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />

                {agent.label}
              </button>
            );
          })}
        </div>

        {selectedFile && (
          <div className="my-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              {selectedFile.type === "application/pdf" ? (
                <FileText size={16} className="text-red-400" />
              ) : (
                selectedFile?.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    className="h-10 w-10 rounded-xl object-cover mt-3"
                  />
                )
              )}

              <div>
                <p className="text-xs text-white">{selectedFile.name}</p>

                <p className="text-[10px] text-slate-500">
                  {Math.ceil(selectedFile.size / 1024)}
                  KB
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);

                  fileRef.current.value = "";
                }}
                className="ml-2"
              >
                <X size={14} className="text-slate-500 hover:text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[selectedAgent]}
          rows={3}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-[var(--ink)] placeholder:text-[#aaa096] leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
        />

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          {/* Left — attach + mic */}
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              hidden
              accept=".pdf,image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted)] hover:text-[var(--accent-dark)] hover:bg-[#f3e7dd] border border-transparent hover:border-[var(--line)] transition-all duration-150 bg-transparent cursor-pointer"
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={14} />
            </button>
            <button
              onClick={toggleMic}
              className={`

flex

items-center

justify-center

w-8

h-8

rounded-lg

transition-all

cursor-pointer

${
  isListening ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:bg-[#f3e7dd]"
}

`}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          </div>

          {/* Right — send / stop */}
          <button
            onClick={handleSend}
            disabled={!isLoading && !value.trim()}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150
              ${
                isLoading
                  ? "bg-[var(--ink)] text-white hover:bg-[#4a4038]"
                  : value.trim()
                  ? "bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white"
                  : "bg-[#eee7dc] text-[#aaa096] cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <Square size={12} fill="currentColor" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-[10.5px] text-[var(--muted)] mt-2.5">
        CortexAI can make mistakes. Verify important info.
      </p>
    </div>
  );
}
