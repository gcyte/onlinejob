import { Paperclip, Plus, FileText, Trash2 } from "lucide-react";
import { RefObject } from "react";

interface AdditionalAttachmentsProps {
    attachments: { id: string, file: File, type: 'portfolio' | 'certificate' }[];
    onRemove: (id: string) => void;
    onAdd: (type: 'portfolio' | 'certificate') => void;
    inputRef: RefObject<HTMLInputElement | null>;
}

export default function AdditionalAttachments({
    attachments,
    onRemove,
    onAdd,
    inputRef
}: AdditionalAttachmentsProps) {
    return (
        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Paperclip size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Additional Attachments</h2>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Optional</span>
            </div>

            <p className="text-gray-400 font-bold ml-1 mb-10 text-sm">Include portfolios, certifications, or other relevant documents.</p>

            <div className="space-y-6">
                {attachments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {attachments.map((attr) => (
                            <div key={attr.id} className="bg-gray-50 rounded-[10px] p-4 flex items-center justify-between border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${attr.type === 'portfolio' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 truncate max-w-[150px]">{attr.file.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{attr.type}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(attr.id)}
                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-5">
                    <button
                        type="button"
                        onClick={() => onAdd('portfolio')}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-[10px] text-gray-900 font-black text-[11px] uppercase tracking-widest hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group"
                    >
                        <Plus size={18} className="text-gray-400 group-hover:text-blue-600" /> Add Portfolio
                    </button>
                    <button
                        type="button"
                        onClick={() => onAdd('certificate')}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-[10px] text-gray-900 font-black text-[11px] uppercase tracking-widest hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group"
                    >
                        <Plus size={18} className="text-gray-400 group-hover:text-blue-600" /> Add Certificate
                    </button>
                </div>
            </div>
        </div>
    );
}
