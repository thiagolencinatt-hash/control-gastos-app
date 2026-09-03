"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus } from "lucide-react";

interface DraggableWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  windowId: string;
  defaultPosition?: { x: number; y: number };
}

export function DraggableWindow({
  isOpen,
  onClose,
  title,
  children,
  windowId,
  defaultPosition = { x: 0, y: 0 },
}: DraggableWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none sm:p-4"
        >
          {/* Overlay oscuro de fondo solo en mobile, en desktop es ventana flotante real */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto sm:hidden" onClick={onClose} />

          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
            className={`pointer-events-auto relative flex flex-col glass-strong shadow-2xl 
              ${isMinimized ? "w-[300px] h-[56px] rounded-2xl" : "w-full h-full sm:w-[500px] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl"}`}
            style={{ x: defaultPosition.x, y: defaultPosition.y }}
          >
            {/* Header / Barra de título arrastrable */}
            <div className="flex items-center justify-between px-4 py-3 border-b cursor-grab active:cursor-grabbing shrink-0" style={{ borderColor: "hsl(var(--border) / 0.5)" }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center group">
                    <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button onClick={() => setIsMinimized(!isMinimized)} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center group">
                    <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <h3 className="ml-2 font-semibold text-sm">{title}</h3>
              </div>
            </div>

            {/* Contenido (Scrollable) */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {children}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
