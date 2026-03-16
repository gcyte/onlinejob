"use client";

import { useState, useRef } from "react";
import {
    CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Sub-components
import ContactInfo from "@/components/jobs/apply/ContactInfo";
import ResumeUpload from "@/components/jobs/apply/ResumeUpload";
import CoverLetter from "@/components/jobs/apply/CoverLetter";
import AdditionalAttachments from "@/components/jobs/apply/AdditionalAttachments";
import FooterActions from "@/components/jobs/apply/FooterActions";

interface ApplicationFormPremiumProps {
    jobId: string;
    initialData: {
        fullName: string;
        email: string;
        phoneNumber: string;
        linkedinUrl: string;
    };
}

export default function ApplicationFormPremium({ jobId, initialData }: ApplicationFormPremiumProps) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Editable contact info state
    const [formData, setFormData] = useState({
        fullName: initialData.fullName,
        email: initialData.email,
        phoneNumber: initialData.phoneNumber,
        linkedinUrl: initialData.linkedinUrl
    });

    const [resume, setResume] = useState<File | null>(null);
    const [attachments, setAttachments] = useState<{ id: string, file: File, type: 'portfolio' | 'certificate' }[]>([]);
    const [coverLetter, setCoverLetter] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const [attachmentType, setAttachmentType] = useState<'portfolio' | 'certificate'>('portfolio');

    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newAttachment = {
                id: Math.random().toString(36).substr(2, 9),
                file: e.target.files[0],
                type: attachmentType
            };
            setAttachments(prev => [...prev, newAttachment]);
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setResume(e.dataTransfer.files[0]);
        }
    };

    const uploadFileToServer = async (file: File, category: string): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed || !resume) return;

        setLoading(true);
        setUploading(true);

        try {
            // 1. Upload Resume
            const uploadedResumeUrl = await uploadFileToServer(resume, "resumes");

            // 2. Upload Attachments
            const uploadedAttachments = await Promise.all(
                attachments.map(async (attr) => {
                    const url = await uploadFileToServer(attr.file, "verifications");
                    return { name: attr.file.name, url, type: attr.type };
                })
            );

            // 3. Submit Application
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId,
                    coverLetter,
                    resumeUrl: uploadedResumeUrl,
                    attachments: JSON.stringify(uploadedAttachments),
                    ...formData
                }),
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => router.push("/dashboard"), 3000);
            } else {
                const error = await res.text();
                alert(error || "Submission failed");
            }
        } catch (err) {
            console.error("Submission failed", err);
            alert("An error occurred during submission. Please try again.");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white rounded-[10px] p-16 text-center border border-gray-100 shadow-xl shadow-blue-100/20 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-emerald-100 shadow-lg shadow-emerald-100/50">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Application Submitted!</h2>
                <p className="text-gray-500 font-bold text-lg mb-8">
                    Your application has been sent successfully. We'll notify you once the employer reviews it.
                </p>
                <div className="bg-gray-50 rounded-[10px] p-4 inline-block text-sm text-gray-400 font-black uppercase tracking-widest">
                    Redirecting to dashboard...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <ContactInfo
                formData={formData}
                onChange={handleInputChange}
            />

            <ResumeUpload
                resume={resume}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                onDrop={handleDrop}
                onChange={handleFileChange}
                onRemove={() => setResume(null)}
                inputRef={fileInputRef}
            />

            <CoverLetter
                value={coverLetter}
                onChange={setCoverLetter}
            />

            <input
                type="file"
                ref={attachmentInputRef}
                onChange={handleAttachmentChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.png"
            />

            <AdditionalAttachments
                attachments={attachments}
                onRemove={removeAttachment}
                onAdd={(type) => { setAttachmentType(type); attachmentInputRef.current?.click(); }}
                inputRef={attachmentInputRef}
            />

            <FooterActions
                agreed={agreed}
                setAgreed={setAgreed}
                loading={loading}
                uploading={uploading}
                canSubmit={!loading && !!resume && agreed}
                onCancel={() => router.back()}
            />
        </form>
    );
}
