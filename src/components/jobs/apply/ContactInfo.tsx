import { User } from "lucide-react";

interface ContactInfoProps {
    formData: {
        fullName: string;
        email: string;
        phoneNumber: string;
        linkedinUrl: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ContactInfo({ formData, onChange }: ContactInfoProps) {
    return (
        <div className="bg-white rounded-[10px] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                <div className="w-10 h-10 rounded-[10px] bg-blue-50 flex items-center justify-center text-blue-600">
                    <User size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Contact Information</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={onChange}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[10px] text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={onChange}
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[10px] text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={onChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[10px] text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">LinkedIn Profile URL</label>
                    <input
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={onChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[10px] text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
}
