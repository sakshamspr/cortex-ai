import MessageBubble from "./MessageBubble";

import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
function NeuralPulse() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      {[0, 0.45, 0.9].map((delay, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-[#d59b8c]/50"
          initial={{ scale: 0.3, opacity: 0.55 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.span
        className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"
        style={{ boxShadow: "0 0 14px rgba(196,95,69,0.32)" }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const THINKING_LABELS = ["Thinking", "Analyzing", "Reasoning", "Generating"];

function GeneratingIndicator() {
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % THINKING_LABELS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const label = THINKING_LABELS[labelIndex];

  return (
    <div className="flex items-center gap-3 max-w-[72%] py-1">
      <NeuralPulse />
      <div className="flex overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            className="flex"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {label.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="text-[13px] font-medium tracking-wide text-[var(--muted)]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function MessageList() {
  const bottomRef = useRef(null);
  const { messages, isLoading } = useSelector((state) => state.message);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",

        block: "end",
      });
    });
  }, [messages.length, isLoading]);
  useEffect(() => {
    if (selectedConversation?.title === "New Chat") return;
    const get = async () => {
      const data = await getMessages(selectedConversation?._id);
      dispatch(setMessages(data));
      const latestArtifactMessage = [...data]
        .reverse()
        .find((msg) => msg.artifacts && msg.artifacts.length > 0);

      if (latestArtifactMessage) {
        dispatch(setArtifacts(latestArtifactMessage.artifacts));
      }
    };
    get();
  }, [selectedConversation?._id]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#f5f0e8] px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 && !isLoading ? (
        <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-6">
          <div className="w-full max-w-[620px] rounded-3xl border border-[var(--line)] bg-[var(--paper-strong)] px-7 py-9 shadow-[0_18px_50px_rgba(74,54,38,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-dark)]">
            Cortex Research Studio
          </p>
          <div className="flex flex-col gap-1.5">
          <h1 className="research-display text-[34px] font-normal text-[var(--ink)] tracking-tight">
            Turn sources into insight.
          </h1>
          <h3 className="text-[15px] font-medium text-[var(--muted)] tracking-tight">
            Upload a chapter, explore the evidence, and shape it into something presentable.
          </h3>
          <p className="text-[13px] text-[var(--muted)] max-w-[470px] mx-auto leading-relaxed">
            Build a research brief, presentation, questionnaire, or assignment from one focused workspace.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-1 max-w-[620px]">
          {[
            ["Summarize my uploaded chapter", "chat"],
            ["Create a presentation outline", "ppt"],
            ["Generate a study questionnaire", "chat"],
          ].map(([label, agent]) => (
            <button
              key={label}
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("cortex:prompt", {
                    detail: { prompt: label, agent },
                  }),
                )
              }
              className="text-[12px] text-[var(--muted)] bg-[var(--paper-strong)] border border-[var(--line)] px-3.5 py-2 rounded-full hover:border-[#d59b8c] hover:text-[var(--accent-dark)] transition-colors duration-150 cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
        </div>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <MessageBubble
                role={msg.role}
                content={msg.content}
                images={msg?.images || []}
                files={msg?.files || []}
              />
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <GeneratingIndicator />
            </motion.div>
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
