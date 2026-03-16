import { CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";

interface FooterActionsProps {
    agreed: boolean;
    setAgreed: (value: boolean) => void;
    loading: boolean;
    uploading: boolean;
    canSubmit: boolean;
    onCancel: () => void;
}

export default function FooterActions({
    agreed,
    setAgreed,
    loading,
    uploading,
    canSubmit,
    onCancel
}: FooterActionsProps) {
    return (
        <div className="pt-6 space-y-12">
            <label className="flex items-start gap-4 cursor-pointer group max-w-2xl">
                <div className="relative mt-0.5">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-lg group-hover:border-blue-400 transition-colors peer-checked:bg-[#0F3652] peer-checked:border-[#0F3652]" />
                    <CheckCircle2 size={16} className="absolute top-1 left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <p className="text-[13px] font-bold text-gray-500 leading-relaxed">
                    I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. I confirm that all the information provided is accurate and truthful.
                </p>
            </label>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 font-black text-sm uppercase tracking-[0.2em] hover:text-gray-900 transition-colors"
                >
                    Cancel Application
                </button>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full md:w-auto px-12 py-5 bg-[#0F3652] text-white rounded-[10px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 transition-all active:scale-95 ${!canSubmit ? "opacity-40 cursor-not-allowed shadow-none" : "hover:bg-black"
                        }`}
                >
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 size={18} className="animate-spin" />
                            <span>{uploading ? "UPLOADING..." : "SUBMITTING..."}</span>
                        </div>
                    ) : <>Submit Application <Send size={20} className="ml-1" /></>}
                </button>
            </div>
        </div>
    );
}
