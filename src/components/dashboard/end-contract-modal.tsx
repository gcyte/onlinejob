"use client";

import { useState } from "react";
import { Star, X, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EndContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (score: number, comment: string) => Promise<void>;
    freelancerName: string;
}

export default function EndContractModal({ isOpen, onClose, onSubmit, freelancerName }: EndContractModalProps) {
    const [score, setScore] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (score === 0) return;
        setLoading(true);
        try {
            await onSubmit(score, comment);
            onClose();
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[10px] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">End Contract</h2>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Provide feedback for {freelancerName}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Initial Trust Score (1-5)</label>
                                    <div className="flex gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setScore(star)}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                                className="transition-all transform hover:scale-110 active:scale-90"
                                            >
                                                <Star
                                                    size={32}
                                                    fill={(hover || score) >= star ? "#EAB308" : "none"}
                                                    className={(hover || score) >= star ? "text-yellow-500" : "text-gray-200"}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Public Comment & Feedback</label>
                                    <div className="relative group">
                                        <MessageSquare size={18} className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Tell us about your experience working with this freelancer..."
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[10px] focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold transition-all min-h-[120px] resize-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-[10px] flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="text-emerald-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-emerald-900">Guaranteed Trust System</p>
                                        <p className="text-[10px] text-emerald-700 font-bold">Your feedback directly impacts the freelancer's profile trust score.</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || score === 0}
                                    className="w-full h-14 bg-blue-600 text-white rounded-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={24} className="animate-spin" /> : "Complete Contract & Submit"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
