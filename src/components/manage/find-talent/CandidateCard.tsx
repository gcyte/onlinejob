"use client";

import { MapPin, Banknote, Star, Check } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface CandidateProps {
    id: string;
    initials: string;
    avatarUrl?: string;
    name: string;
    title: string;
    bio: string;
    location: string;
    salary: string;
    rating: number;
    isVerified?: boolean;
}

export default function CandidateCard({ candidate }: { candidate: CandidateProps }) {
    return (
        <div className="bg-white border border-gray-200 rounded-[10px] p-5 lg:p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row gap-5 lg:gap-6">
                {/* Avatar — real photo with initials fallback */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[10px] shrink-0 overflow-hidden border border-gray-100/50 bg-[#F0F4F8] flex items-center justify-center">
                    {candidate.avatarUrl ? (
                        <img
                            src={candidate.avatarUrl}
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-xl lg:text-2xl font-bold text-blue-600 tracking-tight">
                            {candidate.initials}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-2 lg:mb-3 gap-3">
                        <div>
                            <h3 className="text-lg lg:text-[20px] font-bold text-blue-600 leading-tight mb-0.5">{candidate.name}</h3>
                            <p className="text-blue-700 font-bold text-[13px] tracking-wide">{candidate.title}</p>
                        </div>

                        {/* ID Proof badge only */}
                        {candidate.isVerified !== undefined && (
                            <div className={`text-center shadow-sm rounded-[10px] px-3 py-1.5 min-w-[64px] flex flex-col items-center justify-center border shrink-0 self-start xl:self-auto ${candidate.isVerified ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-gray-50 border-gray-200'}`}>
                                <p className={`text-[8px] font-bold uppercase tracking-widest mb-[3px] ${candidate.isVerified ? 'text-[#16A34A]' : 'text-gray-400'}`}>ID Proof</p>
                                <div className={`${candidate.isVerified ? 'bg-[#10B981]' : 'bg-gray-300'} rounded-full w-3.5 h-3.5 flex items-center justify-center text-white`}>
                                    <Check size={9} strokeWidth={4} />
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-600 text-[13px] leading-[1.6] mb-5 lg:mb-6 pr-0 xl:pr-10 line-clamp-2">
                        {candidate.bio}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] lg:text-[13px] text-gray-500 font-semibold tracking-wide">
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400 stroke-[2]" /> {candidate.location}</span>
                            <span className="flex items-center gap-1.5"><Banknote size={14} className="text-gray-400 stroke-[2]" /> {candidate.salary}</span>
                            <span className="flex items-center gap-1.5 text-amber-400">
                                <div className="flex space-x-[1px]">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={12} fill={star <= candidate.rating ? "currentColor" : "transparent"} strokeWidth={star <= candidate.rating ? 0 : 1.5} className={star > candidate.rating ? "text-gray-300" : ""} />
                                    ))}
                                </div>
                                <span className="text-gray-400 text-[11px] ml-0.5">({candidate.rating.toFixed(1)})</span>
                            </span>
                        </div>

                        <Link href={`/freelancers/${candidate.id}`} className="bg-blue-600 !text-white px-5 lg:px-6 py-2 rounded-[10px] text-[13px] font-bold hover:bg-blue-700 transition-colors text-center shrink-0 shadow-sm block sm:w-auto">
                            View Full Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
