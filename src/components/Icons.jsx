import React from 'react';

// ============ BRAND / TECH ICONS ============

export function PythonIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <defs>
                <linearGradient id="pyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#387EB8" />
                    <stop offset="100%" stopColor="#366994" />
                </linearGradient>
                <linearGradient id="pyYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFC836" />
                    <stop offset="100%" stopColor="#FFD43B" />
                </linearGradient>
            </defs>
            <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.868s-.109-3.403 3.35-3.403h5.766s3.24.052 3.24-3.133V3.195S18.28 0 11.914 0zM8.708 1.85c.578 0 1.046.468 1.046 1.046s-.468 1.047-1.046 1.047-1.047-.469-1.047-1.047.469-1.046 1.047-1.046z" fill="url(#pyBlue)" />
            <path d="M12.087 24c6.093 0 5.713-2.656 5.713-2.656l-.007-2.752h-5.814v-.826h8.121s3.9.445 3.9-5.735c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.868s.109 3.403-3.35 3.403H9.45s-3.24-.052-3.24 3.133v5.33S5.72 24 12.087 24zm3.206-1.85c-.578 0-1.046-.468-1.046-1.046s.468-1.047 1.046-1.047 1.047.469 1.047 1.047-.469 1.046-1.047 1.046z" fill="url(#pyYellow)" />
        </svg>
    );
}

export function ReactIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#61DAFB" className={className}>
            <circle cx="12" cy="12" r="2.2" />
            <path d="M12 21.5c-1.2 0-2.5-.3-3.8-.8C5.5 19.5 3.5 17.5 2.3 15c-1.3-2.7-1.3-5.3 0-8C3.5 4.5 5.5 2.5 8.2 1.3c1.3-.5 2.6-.8 3.8-.8s2.5.3 3.8.8c2.7 1.2 4.7 3.2 5.9 5.7 1.3 2.7 1.3 5.3 0 8-1.2 2.5-3.2 4.5-5.9 5.7-1.3.5-2.6.8-3.8.8z" fill="none" stroke="#61DAFB" strokeWidth="1" />
            <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="#61DAFB" strokeWidth="1" />
            <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(120 12 12)" />
        </svg>
    );
}

export function JavaScriptIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="3" fill="#F7DF1E" />
            <path d="M6.4 19.2l1.8-1.1c.3.6.7 1 1.4 1 .7 0 1.2-.3 1.2-1.3V11h2.2v6.8c0 2.2-1.3 3.2-3.1 3.2-1.7 0-2.7-.9-3.2-1.9l-.3.1zm7.4-.3l1.8-1c.4.7 1 1.2 2 1.2.8 0 1.4-.4 1.4-1s-.6-1-1.6-1.4l-.5-.2c-1.6-.7-2.6-1.5-2.6-3.3 0-1.6 1.3-2.9 3.2-2.9 1.4 0 2.4.5 3.1 1.8l-1.7 1.1c-.4-.7-.8-1-1.4-1s-1 .4-1 .9.4.9 1.3 1.3l.5.2c1.9.8 2.9 1.6 2.9 3.4 0 2-1.5 3-3.6 3-2 0-3.3-1-3.8-2.1z" fill="#333" />
        </svg>
    );
}

export function NodeIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#339933" className={className}>
            <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.7.46 1.4 0 2.2-.85 2.2-2.33V8.44c0-.12-.1-.22-.22-.22h-.93c-.12 0-.22.1-.22.22V16.5c0 .66-.68 1.31-1.79.76L4.43 16.1c-.08-.04-.12-.13-.12-.22V7.71c0-.09.05-.17.12-.22l7.44-4.3c.07-.04.16-.04.24 0l7.44 4.3c.08.04.12.13.12.22v8.18c0 .09-.05.17-.12.22l-7.44 4.3c-.07.04-.16.04-.24 0l-1.9-1.13c-.06-.04-.14-.05-.2-.02-.55.31-.65.35-1.17.53-.13.05-.32.12.07.34l2.48 1.47c.24.14.5.2.78.2s.55-.07.78-.2l7.44-4.3c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.24-.13-.5-.2-.78-.2z" />
        </svg>
    );
}

export function FigmaIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83" />
            <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF" />
            <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z" fill="#F24E1E" />
            <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262" />
            <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE" />
        </svg>
    );
}

export function TypeScriptIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="3" fill="#3178C6" />
            <path d="M5.5 12.5h3v7.2h2.2v-7.2h3v-1.8h-8.2v1.8zm9.3 7.2c.5.3 1.1.5 1.9.5 1.8 0 3-1 3-2.5s-.8-2-2.3-2.5l-.7-.2c-.7-.3-1-.5-1-1s.4-.8 1-.8c.5 0 .9.2 1.3.6l1.2-1c-.6-.7-1.4-1.1-2.4-1.1-1.6 0-2.7.9-2.7 2.3 0 1.4.8 2 2.1 2.5l.7.2c.7.3 1.1.5 1.1 1.1 0 .5-.5.9-1.2.9-.7 0-1.3-.3-1.7-.9l-1.3.9c.6 1 1.5 1.5 2.7 1.5l.3-.4z" fill="white" />
        </svg>
    );
}

export function JavaIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#E76F00" className={className}>
            <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.762.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0 0-8.216 2.051-4.292 6.573" />
            <path d="M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.585c-4.432 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.89 3.776-.89M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.356.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.929 4.562 0 0 .07-.062.091-.118" />
            <path d="M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.889 4.832 0 6.836-2.274-2.053-3.943-3.858-2.824-5.54 1.644-2.469 6.197-3.665 5.189-7.626" />
        </svg>
    );
}

export function CppIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#00599C" className={className}>
            <path d="M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.508-.29-1.34-.29-1.848 0L2.26 5.31c-.508.29-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.689l8.816 5.091c.508.29 1.34.29 1.848 0l8.816-5.091c.254-.146.485-.399.652-.689.167-.29.271-.616.271-.91V6.91c.002-.294-.102-.62-.269-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.109-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.567 3.567 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z" />
        </svg>
    );
}

export function DockerIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#2496ED" className={className}>
            <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185zm-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186zm-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186zm-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186zm5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185zm-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185zm-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185zm-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.185.185v1.888c0 .102.083.185.185.185zm23.693 1.174c-.573-.428-1.885-.65-2.892-.412-.128-1.003-.614-1.874-1.297-2.618l-.44-.49-.49.44c-.735.66-1.095 1.677-.997 2.628.037.36.143.745.326 1.087-.49.258-1.282.404-2.41.396H.526a.525.525 0 00-.525.525 8.56 8.56 0 00.517 3.135c.461 1.208 1.145 2.103 2.036 2.66 1 .625 2.637.997 4.479.997 1.168 0 2.376-.143 3.555-.504 1.458-.445 2.742-1.133 3.81-2.043a11.566 11.566 0 002.47-2.993c.775-1.257 1.237-2.646 1.466-3.854h.128c.896 0 1.442-.365 1.747-.68.203-.213.376-.462.502-.733l.166-.433-.345-.24z" />
        </svg>
    );
}

export function GitIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#F05032" className={className}>
            <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.66 2.66c.645-.222 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.72.719-1.886.719-2.604 0-.527-.526-.658-1.3-.395-1.94l-2.48-2.48v6.53c.175.087.34.202.488.348.713.721.713 1.883 0 2.604-.719.719-1.884.719-2.604 0-.719-.72-.719-1.883 0-2.604.177-.175.37-.308.58-.398V8.882c-.21-.09-.403-.222-.58-.398-.545-.545-.662-1.347-.352-2.003L7.662 3.734.453 10.943c-.604.601-.604 1.582 0 2.185L10.93 23.61c.602.604 1.582.604 2.186 0l10.43-10.43c.604-.603.604-1.583 0-2.186" />
        </svg>
    );
}

export function PhotoshopIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="3" fill="#31A8FF" />
            <path d="M5.5 17V7.5h3c.9 0 1.5.1 2 .4.5.3.8.6 1 1 .2.5.4 1 .4 1.5 0 .6-.1 1.1-.4 1.6-.3.5-.6.8-1.1 1-.5.3-1.1.4-1.8.4h-1.3V17H5.5zm1.8-5.2h1.1c.6 0 1.1-.1 1.4-.4.3-.3.5-.7.5-1.2 0-.5-.2-.9-.5-1.1-.3-.3-.8-.4-1.4-.4H7.3v3.1zM14.5 17.2c-.5 0-.9-.1-1.3-.2-.4-.1-.7-.3-.9-.5l.6-1.2c.2.2.5.3.8.4.3.1.6.2.9.2.4 0 .6-.1.8-.2.2-.1.3-.3.3-.5 0-.2-.1-.3-.2-.4-.1-.1-.3-.2-.5-.3l-1-.4c-.5-.2-.9-.4-1.2-.7-.3-.3-.4-.7-.4-1.2 0-.4.1-.7.3-1 .2-.3.5-.5.9-.7.4-.2.8-.3 1.3-.3.4 0 .8.1 1.2.2.4.1.7.3.9.5l-.6 1.1c-.4-.3-.8-.5-1.4-.5-.3 0-.6.1-.7.2-.2.1-.2.3-.2.5 0 .2.1.3.2.4.1.1.4.2.7.4l1 .4c.5.2.9.4 1.1.7.3.3.4.7.4 1.1 0 .4-.1.7-.3 1-.2.3-.5.6-.9.7-.4.2-.9.3-1.5.3z" fill="white" />
        </svg>
    );
}

export function IllustratorIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="3" fill="#FF9A00" />
            <path d="M12.2 7l-3.8 10h1.9l.9-2.6h3.8l.9 2.6h2L14 7h-1.8zm-.5 5.8l1.3-3.9 1.3 3.9h-2.6zM17 8.3c0-.6.5-1 1-1s1 .4 1 1-.4 1-1 1-1-.5-1-1zM17.3 17V10h1.5v7h-1.5z" fill="white" />
        </svg>
    );
}

// ============ LANGUAGE FLAGS (stylized icons) ============

export function EnglishIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="12" fill="#012169" />
            <path d="M0 0l24 24M24 0L0 24" stroke="white" strokeWidth="3" />
            <path d="M0 0l24 24M24 0L0 24" stroke="#C8102E" strokeWidth="1.5" />
            <path d="M12 0v24M0 12h24" stroke="white" strokeWidth="5" />
            <path d="M12 0v24M0 12h24" stroke="#C8102E" strokeWidth="3" />
        </svg>
    );
}

export function GermanIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="8" fill="#000" rx="3" />
            <rect y="8" width="24" height="8" fill="#DD0000" />
            <rect y="16" width="24" height="8" fill="#FFCC00" rx="3" />
        </svg>
    );
}

export function SpanishIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="6" fill="#C60B1E" rx="3" />
            <rect y="6" width="24" height="12" fill="#FFC400" />
            <rect y="18" width="24" height="6" fill="#C60B1E" rx="3" />
        </svg>
    );
}

export function KoreanIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="12" fill="white" />
            <circle cx="12" cy="12" r="5" fill="none" stroke="#CD2E3A" strokeWidth="0" />
            <path d="M7 12a5 5 0 0 1 10 0" fill="#CD2E3A" />
            <path d="M7 12a5 5 0 0 0 10 0" fill="#0047A0" />
            <path d="M9.5 12a2.5 2.5 0 0 0 5 0" fill="#CD2E3A" />
            <path d="M9.5 12a2.5 2.5 0 0 1 5 0" fill="#0047A0" />
        </svg>
    );
}

export function ChineseIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="3" fill="#DE2910" />
            <g fill="#FFDE00">
                <polygon points="5,3 6,6 3.5,4.5 6.5,4.5 4,6" />
                <polygon points="9,1.5 9.5,2.5 8.5,2 10,2 8.5,2.5" transform="scale(0.8) translate(3,0)" />
                <polygon points="11,3 11.5,4 10.5,3.5 12,3.5 10.5,4" transform="scale(0.8) translate(3,1)" />
                <polygon points="11,6 11.5,7 10.5,6.5 12,6.5 10.5,7" transform="scale(0.8) translate(3,0)" />
                <polygon points="9,8 9.5,9 8.5,8.5 10,8.5 8.5,9" transform="scale(0.8) translate(3,0)" />
            </g>
        </svg>
    );
}

export function ItalianIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="8" height="24" fill="#009246" rx="3" />
            <rect x="8" width="8" height="24" fill="white" />
            <rect x="16" width="8" height="24" fill="#CE2B37" rx="3" />
        </svg>
    );
}

export function FrenchIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="8" height="24" fill="#002395" rx="3" />
            <rect x="8" width="8" height="24" fill="white" />
            <rect x="16" width="8" height="24" fill="#ED2939" rx="3" />
        </svg>
    );
}

export function JapaneseIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="3" fill="white" />
            <circle cx="12" cy="12" r="5" fill="#BC002D" />
        </svg>
    );
}

export function TurkishIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <rect width="24" height="24" rx="3" fill="#E30A17" />
            <circle cx="10" cy="12" r="5" fill="white" />
            <circle cx="11.5" cy="12" r="4" fill="#E30A17" />
            <polygon points="16,12 14.5,11 14.5,13" fill="white" />
        </svg>
    );
}

// ============ CATEGORY / UI ICONS ============

export function CodeIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
    );
}

export function PaletteIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="13.5" cy="6.5" r="0.5" fill="#A3FF12" /><circle cx="17.5" cy="10.5" r="0.5" fill="#A3FF12" /><circle cx="8.5" cy="7.5" r="0.5" fill="#A3FF12" /><circle cx="6.5" cy="12.5" r="0.5" fill="#A3FF12" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.5 0-.4-.2-.7-.4-1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.9-10-10z" />
        </svg>
    );
}

export function BrainIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2" />
        </svg>
    );
}

export function GlobeIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

export function BriefcaseIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    );
}

export function GraduationIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    );
}

export function UsersIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function MusicIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
    );
}

export function ShieldCheckIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
        </svg>
    );
}

export function StarIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

export function AlertTriangleIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

export function SearchIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

export function CoinIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12" /><path d="M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" />
        </svg>
    );
}

export function SparklesIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
            <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
        </svg>
    );
}

export function RocketIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3" />
        </svg>
    );
}

export function SendIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

export function TrashIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    );
}

export function MicIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
    );
}

export function PaperclipIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
    );
}

export function ImageIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
    );
}

export function FileIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
    );
}

export function PencilIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
    );
}

export function PlayIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    );
}

export function PauseIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
    );
}

export function CameraIcon({ size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
    );
}

// ============ SKILL ICON RESOLVER ============

const SKILL_ICON_MAP = {
    'Python': PythonIcon,
    'React': ReactIcon,
    'JavaScript': JavaScriptIcon,
    'Node.js': NodeIcon,
    'TypeScript': TypeScriptIcon,
    'Java': JavaIcon,
    'C++': CppIcon,
    'Figma': FigmaIcon,
    'Docker': DockerIcon,
    'Git': GitIcon,
    'Photoshop': PhotoshopIcon,
    'Illustrator': IllustratorIcon,
    'English': EnglishIcon,
    'Немецкий': GermanIcon,
    'Испанский': SpanishIcon,
    'Корейский': KoreanIcon,
    'Китайский': ChineseIcon,
    'Итальянский': ItalianIcon,
    'Французский': FrenchIcon,
    'Японский': JapaneseIcon,
    'Турецкий': TurkishIcon,
};

const CATEGORY_ICON_MAP = {
    'code': CodeIcon,
    'palette': PaletteIcon,
    'brain': BrainIcon,
    'globe': GlobeIcon,
    'briefcase': BriefcaseIcon,
    'graduation': GraduationIcon,
    'users': UsersIcon,
    'music': MusicIcon,
};

export function getSkillIcon(skillName) {
    return SKILL_ICON_MAP[skillName] || null;
}

export function getCategoryIcon(categoryKey) {
    return CATEGORY_ICON_MAP[categoryKey] || CodeIcon;
}

export function SkillIcon({ skill, size = 16, className = '' }) {
    const Icon = SKILL_ICON_MAP[skill];
    if (Icon) {
        return <Icon size={size} className={className} />;
    }
    return null;
}
