"use client";

import { useState, useRef } from "react";
import { Send, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }

  return (
    <div
      className="flex items-end gap-2 rounded-2xl p-2"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Escribí algo... Ej: &quot;Gasté $3000 en taxi con efectivo&quot;"
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent text-sm outline-none resize-none py-2 px-2 min-h-[40px]"
        style={{ color: "hsl(var(--foreground))" }}
      />

      {/* Voice button placeholder */}
      <button
        type="button"
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors mb-0.5"
        style={{
          background: "hsl(var(--muted))",
          color: "hsl(var(--muted-foreground))",
        }}
        title="Voz (próximamente)"
      >
        <Mic className="w-4 h-4" />
      </button>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all mb-0.5 disabled:opacity-40"
        style={{
          background: text.trim() && !disabled ? "hsl(var(--primary))" : "hsl(var(--muted))",
          color: text.trim() && !disabled ? "white" : "hsl(var(--muted-foreground))",
        }}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
