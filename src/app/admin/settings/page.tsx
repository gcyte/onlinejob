import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">System Settings</h1>
                <p className="text-sm text-gray-500 font-medium">Configure platform-wide settings and preferences.</p>
            </div>
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Settings size={36} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Settings Coming Soon</h2>
                <p className="text-gray-400 font-medium text-sm max-w-md mx-auto">
                    Platform configuration options including email settings, registration controls, and feature flags will be available here.
                </p>
            </div>
        </div>
    );
}
