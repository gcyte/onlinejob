"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    variant: ToastVariant;
    title?: string;
    message: string;
}

interface ToastContextValue {
    toasts: Toast[];
    toast: (variant: ToastVariant, message: string, title?: string) => void;
    dismiss: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const toast = useCallback(
        (variant: ToastVariant, message: string, title?: string) => {
            const id = crypto.randomUUID();
            setToasts((prev) => [...prev, { id, variant, message, title }]);

            const timer = setTimeout(() => dismiss(id), 4500);
            timers.current.set(id, timer);
        },
        [dismiss]
    );

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastViewport />
        </ToastContext.Provider>
    );
}

// ─── Viewport (renders the stack) ────────────────────────────────────────────

function ToastViewport() {
    const { toasts, dismiss } = useToast();

    return (
        <div
            aria-live="polite"
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 min-w-[320px] max-w-[420px] pointer-events-none"
        >
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
            ))}
        </div>
    );
}

// ─── Individual Toast Item ────────────────────────────────────────────────────

const VARIANTS: Record<
    ToastVariant,
    { icon: React.ReactNode; classes: string; iconClasses: string; progressClasses: string }
> = {
    success: {
        icon: <CheckCircle2 size={20} />,
        classes: "bg-white border-l-4 border-emerald-500 shadow-xl shadow-emerald-100/50",
        iconClasses: "text-emerald-500",
        progressClasses: "bg-emerald-500",
    },
    error: {
        icon: <XCircle size={20} />,
        classes: "bg-white border-l-4 border-red-500 shadow-xl shadow-red-100/50",
        iconClasses: "text-red-500",
        progressClasses: "bg-red-500",
    },
    warning: {
        icon: <AlertTriangle size={20} />,
        classes: "bg-white border-l-4 border-amber-500 shadow-xl shadow-amber-100/50",
        iconClasses: "text-amber-500",
        progressClasses: "bg-amber-500",
    },
    info: {
        icon: <Info size={20} />,
        classes: "bg-white border-l-4 border-blue-500 shadow-xl shadow-blue-100/50",
        iconClasses: "text-blue-500",
        progressClasses: "bg-blue-500",
    },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const v = VARIANTS[toast.variant];

    return (
        <div
            className={`
        pointer-events-auto relative overflow-hidden rounded-2xl border border-gray-100
        ${v.classes}
        animate-toast-in
      `}
            role="alert"
        >
            {/* Content */}
            <div className="flex items-start gap-4 px-5 py-4">
                {/* Icon */}
                <span className={`mt-0.5 flex-shrink-0 ${v.iconClasses}`}>{v.icon}</span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <p className="text-sm font-bold text-gray-900 mb-0.5">{toast.title}</p>
                    )}
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{toast.message}</p>
                </div>

                {/* Close */}
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-lg hover:bg-gray-100"
                    aria-label="Dismiss notification"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-100">
                <div
                    className={`h-full ${v.progressClasses} animate-toast-progress origin-left`}
                />
            </div>
        </div>
    );
}
