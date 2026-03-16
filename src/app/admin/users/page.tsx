"use client";

import { useState, useEffect, useCallback } from "react";
import { User as UserIcon, Building2, Ban, CheckCircle2, Search, ChevronLeft, ChevronRight, Loader2, Shield, AlertTriangle, Download, X, Briefcase, FileText, Plus } from "lucide-react";

type UserRecord = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    image: string | null;
    isBanned: boolean;
    createdAt: string;
    freelancerProfile: { isVerified: boolean; verificationStatus: string; avatarUrl: string | null } | null;
    employerProfile: { companyName: string | null; companyLogo: string | null } | null;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmBan, setConfirmBan] = useState<UserRecord | null>(null);

    // User Detail Modal State
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [addAdminOpen, setAddAdminOpen] = useState(false);
    const [addAdminLoading, setAddAdminLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [roleFilter, statusFilter]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: debouncedSearch,
                role: roleFilter,
                status: statusFilter,
                page: page.toString()
            });
            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const data = await res.json();
            setUsers(data.users);
            setTotalPages(data.pages);
            setTotal(data.total);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, roleFilter, statusFilter, page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleBanToggle = async (e: React.MouseEvent, user: UserRecord) => {
        e.stopPropagation(); // prevent opening details modal
        if (!user.isBanned) {
            setConfirmBan(user);
            return;
        }
        await executeBanToggle(user.id, false);
    };

    const executeBanToggle = async (userId: string, isBanned: boolean) => {
        setActionLoading(userId);
        setConfirmBan(null);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isBanned }),
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned } : u));
                if (selectedUserId === userId && userDetails) {
                    setUserDetails({ ...userDetails, isBanned });
                }
            }
        } finally {
            setActionLoading(null);
        }
    };

    const fetchUserDetails = async (id: string) => {
        setSelectedUserId(id);
        setUserDetails(null);
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${id}`);
            const data = await res.json();
            setUserDetails(data);
        } finally {
            setDetailsLoading(false);
        }
    };

    const exportCSV = () => {
        window.location.href = "/api/admin/export?type=users";
    };

    const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAddAdminLoading(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (res.ok) {
                setAddAdminOpen(false);
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create admin");
            }
        } finally {
            setAddAdminLoading(false);
        }
    };

    const roleBadge = (role: string) => {
        const styles: Record<string, string> = {
            ADMIN: "bg-purple-50 text-purple-700 border-purple-100",
            EMPLOYER: "bg-blue-50 text-blue-700 border-blue-100",
            FREELANCER: "bg-indigo-50 text-indigo-700 border-indigo-100",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[role] || styles.FREELANCER}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 mb-1">User Directory</h1>
                    <p className="text-sm text-gray-500 font-medium">{total} registered accounts</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Add Admin Button */}
                    <button
                        onClick={() => setAddAdminOpen(true)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <Plus size={16} /> <span>Add Team Member</span>
                    </button>

                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm font-bold text-gray-700 cursor-pointer"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="FREELANCER">Freelancers</option>
                            <option value="EMPLOYER">Employers</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm font-bold text-gray-700 cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="BANNED">Banned</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 sm:w-64 min-w-[200px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search accounts..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm font-medium"
                        />
                    </div>

                    {/* Export */}
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 shrink-0"
                    >
                        <Download size={16} /> <span className="hidden xl:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <UserIcon size={48} className="text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Verification</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Joined</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(user => (
                                    <tr
                                        key={user.id}
                                        onClick={() => fetchUserDetails(user.id)}
                                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${user.isBanned ? "opacity-60" : ""}`}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 font-black text-blue-600 text-sm overflow-hidden border border-gray-100">
                                                    {(user.image || user.freelancerProfile?.avatarUrl || user.employerProfile?.companyLogo) ? (
                                                        <img src={user.image || user.freelancerProfile?.avatarUrl || user.employerProfile?.companyLogo || ""} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name?.[0]?.toUpperCase() || "?"
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{user.name || "—"}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">{roleBadge(user.role)}</td>
                                        <td className="px-6 py-5">
                                            {user.role === "FREELANCER" && user.freelancerProfile ? (
                                                user.freelancerProfile.isVerified ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                        <Shield size={14} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.freelancerProfile.verificationStatus === "PENDING"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-gray-100 text-gray-500"
                                                        }`}>
                                                        {user.freelancerProfile.verificationStatus.replace("_", " ")}
                                                    </span>
                                                )
                                            ) : user.role === "EMPLOYER" ? (
                                                <span className="text-xs text-gray-400 font-medium">{user.employerProfile?.companyName || "—"}</span>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {user.isBanned ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                                                    <Ban size={13} /> Banned
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                    <CheckCircle2 size={13} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-xs text-gray-400 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {user.role !== "ADMIN" && (
                                                <button
                                                    onClick={(e) => handleBanToggle(e, user)}
                                                    disabled={actionLoading === user.id}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ml-auto ${user.isBanned
                                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                                        } disabled:opacity-50`}
                                                >
                                                    {actionLoading === user.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : user.isBanned ? (
                                                        <><CheckCircle2 size={13} /> Unban</>
                                                    ) : (
                                                        <><Ban size={13} /> Ban</>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400 font-medium">
                            Page {page} of {totalPages} · {total} total
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Ban Confirmation Modal */}
            {confirmBan && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setConfirmBan(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-8 shadow-2xl w-[360px]">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle size={28} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 text-center mb-2">Ban this user?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6 font-medium leading-relaxed">
                            <strong className="text-gray-800">{confirmBan.name}</strong> ({confirmBan.email}) will be banned from the platform. You can unban them later.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmBan(null)}
                                className="flex-1 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => executeBanToggle(confirmBan.id, true)}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                            >
                                Ban User
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* User Detail Modal */}
            {selectedUserId && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setSelectedUserId(null)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-black text-gray-900">User Profile</h2>
                            <button onClick={() => setSelectedUserId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {detailsLoading || !userDetails ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-4">
                                    <Loader2 size={32} className="animate-spin text-blue-600" />
                                    <p className="text-sm text-gray-500 font-medium">Loading profile...</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Header Profile */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-black text-blue-600 text-2xl shrink-0 border-2 border-white shadow-sm overflow-hidden">
                                            {(userDetails.image || userDetails.freelancerProfile?.avatarUrl || userDetails.employerProfile?.companyLogo) ? (
                                                <img src={userDetails.image || userDetails.freelancerProfile?.avatarUrl || userDetails.employerProfile?.companyLogo || ""} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                userDetails.name?.[0]?.toUpperCase() || "?"
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 mb-1">{userDetails.name || "Unknown User"}</h3>
                                            <p className="text-sm text-gray-500 font-medium mb-2">{userDetails.email}</p>
                                            <div className="flex items-center gap-2">
                                                {roleBadge(userDetails.role)}
                                                {userDetails.isBanned && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-red-50 text-red-700 border-red-100">Banned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Joined</p>
                                            <p className="text-sm font-bold text-gray-900">{new Date(userDetails.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        {userDetails.role === "EMPLOYER" && (
                                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-amber-600/60 mb-1">Jobs Posted</p>
                                                <p className="text-sm font-bold text-amber-700">{userDetails.stats?.jobsPosted || 0}</p>
                                            </div>
                                        )}
                                        {userDetails.role === "FREELANCER" && (
                                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-blue-600/60 mb-1">Applications</p>
                                                <p className="text-sm font-bold text-blue-700">{userDetails.stats?.applications || 0}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Role Specific Details */}
                                    {userDetails.role === "FREELANCER" && userDetails.freelancerProfile && (
                                        <div className="space-y-4">
                                            <h4 className="text-xs uppercase font-black tracking-widest text-gray-400 pb-2 border-b border-gray-100">Freelancer Details</h4>

                                            <div className="bg-white border text-sm font-medium border-gray-100 rounded-xl p-4 space-y-3 shadow-sm">
                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-gray-500">Title</span>
                                                    <span className="font-bold text-gray-900">{userDetails.freelancerProfile.title || "Not set"}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-gray-500">Hourly Rate</span>
                                                    <span className="font-bold text-gray-900">{userDetails.freelancerProfile.expectedSalary || "Not set"}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-1 border-t border-gray-50 pt-3 mt-1">
                                                    <span className="text-gray-500">Identity Status</span>
                                                    <span className={`font-bold ${userDetails.freelancerProfile.isVerified ? "text-emerald-600" : "text-amber-600"}`}>
                                                        {userDetails.freelancerProfile.verificationStatus.replace("_", " ")}
                                                    </span>
                                                </div>
                                            </div>

                                            {userDetails.freelancerProfile.bio && (
                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Bio</p>
                                                    <p className="text-gray-700 leading-relaxed text-xs">{userDetails.freelancerProfile.bio}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {userDetails.role === "EMPLOYER" && userDetails.employerProfile && (
                                        <div className="space-y-4">
                                            <h4 className="text-xs uppercase font-black tracking-widest text-gray-400 pb-2 border-b border-gray-100">Employer Details</h4>

                                            <div className="bg-white border text-sm font-medium border-gray-100 rounded-xl p-4 space-y-3 shadow-sm">
                                                <div className="flex justify-between flex-col gap-1 py-1">
                                                    <span className="text-gray-500 flex items-center gap-1.5"><Building2 size={14} /> Company Name</span>
                                                    <span className="font-bold text-gray-900 text-base">{userDetails.employerProfile.companyName || "Not set"}</span>
                                                </div>
                                                {userDetails.employerProfile.companyWebsite && (
                                                    <div className="flex justify-between items-center py-1 border-t border-gray-50 pt-3 mt-1">
                                                        <span className="text-gray-500">Website</span>
                                                        <a href={userDetails.employerProfile.companyWebsite} target="_blank" className="font-bold text-blue-600 hover:underline">Link</a>
                                                    </div>
                                                )}
                                            </div>

                                            {userDetails.employerProfile.description && (
                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Company Description</p>
                                                    <p className="text-gray-700 leading-relaxed text-xs">{userDetails.employerProfile.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        {userDetails && userDetails.role !== "ADMIN" && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={(e) => handleBanToggle(e, userDetails)}
                                    className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${userDetails.isBanned
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
                                        : "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
                                        }`}
                                >
                                    {userDetails.isBanned ? (
                                        <><CheckCircle2 size={16} /> Restore Account (Unban)</>
                                    ) : (
                                        <><Ban size={16} /> Suspend Account (Ban)</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
            {/* Add Admin Modal */}
            {addAdminOpen && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => !addAdminLoading && setAddAdminOpen(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white rounded-3xl p-8 shadow-2xl w-[400px]">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Plus size={28} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center mb-1">Add Team Member</h3>
                        <p className="text-sm text-gray-400 text-center mb-6 font-medium">Create a new administrative account</p>

                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="admin@example.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Temporary Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-medium"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={addAdminLoading}
                                    onClick={() => setAddAdminOpen(false)}
                                    className="flex-1 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addAdminLoading}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {addAdminLoading ? <Loader2 size={16} className="animate-spin" /> : "Create Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
