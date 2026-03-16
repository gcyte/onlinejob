import { FileText, Trash2 } from "lucide-react";
import { RefObject } from "react";

interface ResumeUploadProps {
    resume: File | null;
    isDragging: boolean;
    setIsDragging: (value: boolean) => void;
    onDrop: (e: React.DragEvent) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    inputRef: RefObject<HTMLInputElement | null>;
}

export default function ResumeUpload({
    resume,
    isDragging,
    setIsDragging,
    onDrop,
    onChange,
    onRemove,
    inputRef
}: ResumeUploadProps) {
    return (
        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                <div className="w-10 h-10 rounded-[10px] bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Resume / CV</h2>
            </div>

            {!resume ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[10px] p-16 text-center transition-all cursor-pointer group flex flex-col items-center gap-4 ${isDragging ? "bg-blue-50 border-blue-400 ring-4 ring-blue-50" : "bg-[#F9FAFB] border-blue-200/50 hover:border-blue-400 hover:bg-gray-50"
                        }`}
                >
                    <input type="file" ref={inputRef} onChange={onChange} className="hidden" accept=".pdf,.doc,.docx" />
                    <div className="w-16 h-16 bg-[#0F3652]/10 rounded-[10px] flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <FileText className="text-[#0F3652]" size={32} />
                    </div>
                    <h4 className="text-lg font-black text-gray-900">Click to upload or drag and drop</h4>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">PDF, DOCX (Max 5MB)</p>
                </div>
            ) : (
                <div className="bg-[#F9FAFB] rounded-[10px] p-6 flex items-center justify-between border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#0F3652] text-white rounded-[10px] flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-base font-black text-gray-900">{resume.name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{(resume.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-[10px] transition-all"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}
