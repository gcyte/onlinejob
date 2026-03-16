"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import {
    Search,
    Send,
    User,
    MessageSquare,
    Clock,
    Loader2,
    ChevronLeft,
    MoreVertical,
    Building2,
    ArrowLeft,
    Paperclip,
    FileText,
    Download,
    X,
    ImageIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    createdAt: string;
    sender: {
        name: string;
        role: string;
        image?: string;
    };
}

interface Thread {
    otherUser: {
        id: string;
        name: string;
        role: string;
        image?: string;
    };
    lastMessage: string;
    timestamp: string;
}

function MessagesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get("userId");
    
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<Thread | null>(null);
    const [isNewConversation, setIsNewConversation] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        if (session) {
            fetchThreads();
        }
    }, [session, status]);

    // Handle initial user lookup from query param
    useEffect(() => {
        if (targetUserId && !loading) {
            const existingThread = threads.find(t => t.otherUser.id === targetUserId);
            if (existingThread) {
                setActiveThread(existingThread);
                setIsNewConversation(false);
            } else {
                // Fetch user info for a potential new conversation
                fetchUserInfo(targetUserId);
            }
        }
    }, [targetUserId, threads, loading]);

    const fetchUserInfo = async (userId: string) => {
        try {
            const res = await fetch(`/api/public/profiles/freelancer/${userId}`);
            if (!res.ok) {
                // Try employer profile if freelancer fails
                const resEmp = await fetch(`/api/public/profiles/employer/${userId}`);
                if (!resEmp.ok) return;
                const data = await resEmp.json();
                startTemporaryThread(data.user, 'EMPLOYER');
            } else {
                const data = await res.json();
                startTemporaryThread(data.user, 'FREELANCER');
            }
        } catch (err) {
            console.error("Failed to fetch target user info", err);
        }
    };

    const startTemporaryThread = (user: any, role: string) => {
        const tempThread: Thread = {
            otherUser: {
                id: user.id,
                name: user.name,
                role: role,
                image: user.image
            },
            lastMessage: "Start a new conversation",
            timestamp: new Date().toISOString()
        };
        setMessages([]); // Clear messages for new conversation
        setActiveThread(tempThread);
        setIsNewConversation(true);
    };

    useEffect(() => {
        if (activeThread && !isNewConversation) {
            fetchMessages(activeThread.otherUser.id);

            // Setup polling for new messages every 5 seconds
            const interval = setInterval(() => {
                fetchMessages(activeThread.otherUser.id);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [activeThread, isNewConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchThreads = async () => {
        try {
            const res = await fetch("/api/conversations");
            if (res.ok) {
                const data = await res.json();
                setThreads(data);
                if (data.length > 0 && !activeThread) {
                    // Don't auto-set active thread to avoid unsolicited loading
                }
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch threads", err);
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId: string) => {
        try {
            const res = await fetch(`/api/messages?userId=${otherUserId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                
                // Mark as read
                if (data.some((m: any) => !m.isRead && m.senderId === otherUserId)) {
                    await fetch("/api/messages", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ otherUserId }),
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB");
            return;
        }

        setSelectedFile(file);
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeThread || sending) return;

        setSending(true);
        try {
            let fileData = null;

            if (selectedFile) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("category", "messages");

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (uploadRes.ok) {
                    const { url } = await uploadRes.json();
                    fileData = {
                        url,
                        name: selectedFile.name,
                        type: selectedFile.type,
                    };
                }
                setIsUploading(false);
            }

            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: activeThread.otherUser.id,
                    content: newMessage || (fileData ? `Sent an attachment: ${fileData.name}` : ""),
                    fileUrl: fileData?.url,
                    fileName: fileData?.name,
                    fileType: fileData?.type,
                }),
            });

            if (res.ok) {
                const msg = await res.json();
                setMessages([...messages, msg]);
                setNewMessage("");
                clearSelectedFile();
                if (isNewConversation) {
                    setIsNewConversation(false);
                    fetchThreads();
                }
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
            setIsUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 pt-20 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`${activeThread ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col bg-white border-r border-gray-100`}>
                    <div className="p-6 border-b border-gray-50">
                        <h1 className="text-2xl font-black text-gray-900 mb-6">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {threads.map((thread) => (
                            <button
                                key={thread.otherUser.id}
                                onClick={() => setActiveThread(thread)}
                                className={`w-full p-6 flex gap-4 hover:bg-gray-50 transition-all border-b border-gray-50 text-left ${activeThread?.otherUser.id === thread.otherUser.id ? 'bg-blue-50/50 border-r-4 border-r-blue-600' : ''}`}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-50 shrink-0 overflow-hidden">
                                    {thread.otherUser.image ? (
                                        <img src={thread.otherUser.image} alt={thread.otherUser.name} className="w-full h-full object-cover" />
                                    ) : thread.otherUser.role === 'EMPLOYER' ? (
                                        <Building2 size={24} className="text-blue-600" />
                                    ) : (
                                        <User size={24} className="text-indigo-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-black text-gray-900 truncate uppercase tracking-tighter text-sm">{thread.otherUser.name}</h3>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{thread.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate font-medium">{thread.lastMessage}</p>
                                </div>
                            </button>
                        ))}

                        {threads.length === 0 && (
                            <div className="text-center py-20 px-10">
                                <MessageSquare size={48} className="text-gray-100 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No conversations</h3>
                                <p className="text-gray-500 text-sm font-medium">When you contact employers or they contact you, messages will appear here.</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Chat Area */}
                <main className={`${activeThread ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white overflow-hidden`}>
                    {activeThread ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setActiveThread(null)} className="md:hidden p-2 text-gray-400 hover:text-gray-900">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
                                        {activeThread.otherUser.image ? (
                                            <img src={activeThread.otherUser.image} alt={activeThread.otherUser.name} className="w-full h-full object-cover" />
                                        ) : activeThread.otherUser.role === 'EMPLOYER' ? (
                                            <Building2 size={20} className="text-blue-600" />
                                        ) : (
                                            <User size={20} className="text-indigo-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-tighter text-sm">{activeThread.otherUser.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-300 hover:text-gray-900 rounded-xl transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === (session?.user as any)?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0 mb-6 shadow-sm">
                                                    {msg.sender.image ? (
                                                        <img src={msg.sender.image} alt={msg.sender.name} className="w-full h-full object-cover" />
                                                    ) : msg.sender.role === 'EMPLOYER' ? (
                                                        <Building2 size={16} className="text-blue-600" />
                                                    ) : (
                                                        <User size={16} className="text-indigo-600" />
                                                    )}
                                                </div>
                                            )}
                                            <div className={`max-w-[70%] group`}>
                                                <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${isMe ? 'bg-blue-600 text-white rounded-br-none shadow-blue-100' : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'}`}>
                                                    {msg.fileUrl && (
                                                        <div className="mb-3">
                                                            {msg.fileType?.startsWith('image/') ? (
                                                                <div className="relative group/img rounded-[10px] overflow-hidden border border-white/20">
                                                                    <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full h-auto block" />
                                                                    <a 
                                                                        href={msg.fileUrl} 
                                                                        download={msg.fileName}
                                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2"
                                                                    >
                                                                        <Download size={20} className="text-white" />
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <a 
                                                                    href={msg.fileUrl} 
                                                                    download={msg.fileName}
                                                                    className={`flex items-center gap-3 p-3 rounded-[10px] border transition-all ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                                                                >
                                                                    <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20 text-white' : 'bg-white text-blue-600 shadow-sm'}`}>
                                                                        <FileText size={20} />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className={`text-xs font-black truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>{msg.fileName}</p>
                                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-gray-400'}`}>Click to download</p>
                                                                    </div>
                                                                    <Download size={16} className={isMe ? 'text-white/60' : 'text-gray-400'} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.content}
                                                </div>
                                                <div className={`mt-2 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <Clock size={10} /> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {isMe && (
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden flex-shrink-0 mb-6 shadow-sm shadow-blue-50">
                                                    {msg.sender.image ? (
                                                        <img src={msg.sender.image} alt={msg.sender.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={16} className="text-blue-600" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />

                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 border border-blue-100">
                                            <MessageSquare size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Start the Conversation</h3>
                                        <p className="text-gray-500 text-sm font-medium max-w-sm">Be professional and clear in your communication to build trust.</p>
                                    </div>
                                )}
                            </div>

                             {/* Input Area */}
                             <div className="p-6 bg-white border-t border-gray-100">
                                 {selectedFile && (
                                     <div className="mb-4 p-4 bg-gray-50 rounded-[10px] border border-gray-100 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                                         <div className="flex items-center gap-4 min-w-0">
                                             {filePreview ? (
                                                 <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                                     <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                                 </div>
                                             ) : (
                                                 <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                                     <FileText size={24} />
                                                 </div>
                                             )}
                                             <div className="min-w-0">
                                                 <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tighter">{selectedFile.name}</p>
                                                 <p className="text-[10px] font-bold text-gray-400 uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to send</p>
                                             </div>
                                         </div>
                                         <button 
                                            onClick={clearSelectedFile}
                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                         >
                                             <X size={20} />
                                         </button>
                                     </div>
                                 )}
                                 <form onSubmit={handleSendMessage} className="flex gap-4">
                                     <input 
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                     />
                                     <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all flex items-center justify-center border border-gray-100"
                                     >
                                         <Paperclip size={24} />
                                     </button>
                                     <input
                                         value={newMessage}
                                         onChange={(e) => setNewMessage(e.target.value)}
                                         placeholder={selectedFile ? "Add a caption..." : "Type your message here..."}
                                         className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium transition-all"
                                     />
                                     <button
                                         type="submit"
                                         disabled={sending || isUploading || (!newMessage.trim() && !selectedFile)}
                                         className="px-8 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                     >
                                         {sending || isUploading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={20} /> <span className="hidden sm:inline">Send</span></>}
                                     </button>
                                 </form>
                             </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                            <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-8 border border-gray-50">
                                <MessageSquare size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Your Inbox</h2>
                            <p className="text-gray-500 font-medium max-w-sm text-sm">Select a conversation from the sidebar to start messaging. All conversations are logged for security.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
