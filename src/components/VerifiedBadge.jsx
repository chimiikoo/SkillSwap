import React from 'react';

/**
 * Verified badge — only for admin-approved tutors.
 */
export function VerifiedBadge({ size = 16, className = '', show = true, title }) {
    if (!show) return null;
    return (
        <span
            className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
            title={title || 'Проверенный репетитор'}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 1L14.59 3.41L18 3L18.59 6.41L21.5 8.5L20.09 11.41L21.5 14.5L18.59 16.59L18 20L14.59 20.59L12 23L9.41 20.59L6 20L5.41 16.59L2.5 14.5L3.91 11.41L2.5 8.5L5.41 6.41L6 3L9.41 3.41L12 1Z"
                    fill="#A3FF12"
                />
                <path
                    d="M9 12.5L11 14.5L15.5 10"
                    stroke="#0a0a0a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

export function isTutorVerified(user) {
    if (!user || (user.userType !== 'tutor' && user.userType !== 'school')) return false;
    return user.tutorStatus === 'approved' || (!user.tutorStatus && user.isVerified);
}

/**
 * Tutor info badge — shows format + experience
 */
export function TutorInfoBadge({ format, experience, city, className = '' }) {
    const formatLabel = format === 'online' ? '🌐 Онлайн' : format === 'offline' ? '🏫 Офлайн' : format === 'both' ? '🔀 Онлайн/Офлайн' : '';
    return (
        <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
            {formatLabel && (
                <span className="px-2 py-0.5 rounded-md text-[11px] bg-neon/5 text-neon/70 border border-neon/10">
                    {formatLabel}
                </span>
            )}
            {experience && (
                <span className="px-2 py-0.5 rounded-md text-[11px] bg-white/5 text-white/50 border border-white/5">
                    📅 {experience} лет опыта
                </span>
            )}
            {city && (
                <span className="px-2 py-0.5 rounded-md text-[11px] bg-white/5 text-white/50 border border-white/5">
                    📍 {city}
                </span>
            )}
        </div>
    );
}

export function PremiumBadge({ size = 16, className = '' }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold shadow-lg shadow-purple-500/20 ${className}`}
            title="Premium Member"
        >
            <svg width={size - 4} height={size - 4} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            PREMIUM
        </span>
    );
}
