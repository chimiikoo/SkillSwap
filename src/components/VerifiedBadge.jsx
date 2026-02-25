import React from 'react';

/**
 * Instagram-style verified badge, neon-lime themed.
 * Shows next to tutor names to distinguish them from students.
 */
export function VerifiedBadge({ size = 16, className = '' }) {
    return (
        <span
            className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
            title="Verified Tutor"
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background shield/badge shape — like Instagram verified */}
                <path
                    d="M12 1L14.59 3.41L18 3L18.59 6.41L21.5 8.5L20.09 11.41L21.5 14.5L18.59 16.59L18 20L14.59 20.59L12 23L9.41 20.59L6 20L5.41 16.59L2.5 14.5L3.91 11.41L2.5 8.5L5.41 6.41L6 3L9.41 3.41L12 1Z"
                    fill="#A3FF12"
                />
                {/* Checkmark */}
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
