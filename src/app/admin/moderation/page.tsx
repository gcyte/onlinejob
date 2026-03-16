import { ShieldAlert } from "lucide-react";

export default function AdminModerationPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Moderation Queue</h1>
                <p className="text-sm text-gray-500 font-medium">Review reported content and flagged accounts.</p>
            </div>
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={36} className="text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Moderation Tools Coming Soon</h2>
                <p className="text-gray-400 font-medium text-sm max-w-md mx-auto">
                    Manage reported posts, flagged profiles, and user appeals. Use the <strong>Job Posts</strong> page in the sidebar to moderate job listings for now.
                </p>
            </div>
        </div>
    );
}
