import { MessageSquare } from "lucide-react";

interface CoverLetterProps {
    value: string;
    onChange: (value: string) => void;
}

export default function CoverLetter({ value, onChange }: CoverLetterProps) {
    return (
        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[10px] bg-amber-50 flex items-center justify-center text-amber-600">
                        <MessageSquare size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Cover Letter</h2>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Optional</span>
            </div>

            <div className="relative">
                <textarea
                    rows={8}
                    value={value}
                    onChange={(e) => onChange(e.target.value.slice(0, 2000))}
                    placeholder="Tell us why you're a great fit for this role..."
                    className="w-full px-8 py-8 bg-white border border-gray-100 rounded-[10px] text-gray-900 font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none shadow-sm placeholder:text-gray-300 leading-relaxed"
                />
                <div className="flex justify-end mt-4">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        {value.length} / 2000 characters
                    </span>
                </div>
            </div>
        </div>
    );
}
