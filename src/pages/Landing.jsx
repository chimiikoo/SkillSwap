import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
    PythonIcon, ReactIcon, FigmaIcon, JavaScriptIcon, DockerIcon,
    BrainIcon, ShieldCheckIcon, StarIcon, AlertTriangleIcon,
    SearchIcon, CoinIcon, SparklesIcon, RocketIcon, GlobeIcon,
    EnglishIcon, KoreanIcon, ChineseIcon, GermanIcon,
} from '../components/Icons';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    })
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i = 0) => ({
        opacity: 1,
        scale: 1,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    })
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
};

function AnimatedSection({ children, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={stagger}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function Landing() {
    const { t, lang } = useLanguage();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

    // Translate skill name helper — programming languages and tech stay the same
    const ts = (skill) => {
        // Check if it's in skillNames translations
        const translated = t(`skillNames.${skill}`);
        // If the key path didn't resolve, return original
        return translated === `skillNames.${skill}` ? skill : translated;
    };

    return (
        <div className="min-h-screen bg-dark overflow-hidden">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-grid">
                {/* Background glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-neon/8 via-neon/2 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-neon/5 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-gradient-radial from-purple-500/5 to-transparent blur-3xl pointer-events-none" />

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute rounded-full ${i % 3 === 0 ? 'w-1.5 h-1.5 bg-neon/40' : 'w-1 h-1 bg-neon/20'}`}
                            style={{
                                left: `${8 + i * 7.5}%`,
                                top: `${15 + (i % 4) * 20}%`,
                            }}
                            animate={{
                                y: [0, -40 - i * 5, 0],
                                x: [0, (i % 2 === 0 ? 10 : -10), 0],
                                opacity: [0.1, 0.7, 0.1],
                                scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 4 + i * 0.4,
                                repeat: Infinity,
                                delay: i * 0.25,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 pt-20"
                >
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeUp} custom={0}>
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon/5 border border-neon/20 text-neon text-sm font-medium backdrop-blur-sm">
                                <SparklesIcon size={16} />
                                {t('landing.badge')}
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            variants={fadeUp}
                            custom={1}
                            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight"
                        >
                            <span className="block">{t('landing.titleLine1')}</span>
                            <span className="block neon-text mt-2">{t('landing.titleLine2')}</span>
                            <span className="block text-white/30 mt-2">{t('landing.titleLine3')}</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            variants={fadeUp}
                            custom={2}
                            className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto leading-relaxed"
                        >
                            {t('landing.subtitle')}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/register" className="neon-btn text-lg px-8 py-4 rounded-2xl flex items-center gap-2 group">
                                <RocketIcon size={20} />
                                <span>{t('landing.ctaStart')}</span>
                                <motion.span
                                    className="inline-block"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    →
                                </motion.span>
                            </Link>
                            <a href="#how-it-works" className="neon-btn-outline text-lg px-8 py-4 rounded-2xl flex items-center gap-2">
                                {t('landing.ctaHow')}
                            </a>
                        </motion.div>

                        {/* Stats */}
                        <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-8 md:gap-16 pt-8">
                            <StatsItem value="500+" label={t('landing.students')} />
                            <div className="w-px h-12 bg-white/10"></div>
                            <StatsItem value="1200+" label={t('landing.sessions')} />
                            <div className="w-px h-12 bg-white/10"></div>
                            <StatsItem value="95%" label={t('landing.matchRate')} />
                        </motion.div>
                    </motion.div>

                    {/* Hero visual - floating skill cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-20 relative"
                    >
                        <div className="flex justify-center gap-4 flex-wrap">
                            <SkillCard name="Python" icon={<PythonIcon size={24} />} color="from-blue-500/20 to-cyan-500/10" />
                            <SkillCard name="UI/UX" icon={<FigmaIcon size={24} />} color="from-purple-500/20 to-pink-500/10" delay={0.1} />
                            <SkillCard name="React" icon={<ReactIcon size={24} />} color="from-cyan-500/20 to-blue-500/10" delay={0.2} />
                            <SkillCard name={ts('Корейский')} icon={<KoreanIcon size={24} />} color="from-red-500/20 to-blue-500/10" delay={0.3} />
                            <SkillCard name="ML/AI" icon={<BrainIcon size={24} />} color="from-green-500/20 to-emerald-500/10" delay={0.4} />
                            <SkillCard name="English" icon={<EnglishIcon size={24} />} color="from-blue-600/20 to-red-500/10" delay={0.5} />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center pt-2">
                        <motion.div
                            className="w-1 h-2.5 rounded-full bg-neon/50"
                            animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-28 relative">
                <div className="absolute inset-0 bg-glow-center pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <AnimatedSection className="text-center mb-16">
                        <motion.span variants={fadeUp} className="badge-neon mb-4 inline-flex items-center gap-1.5">
                            <SparklesIcon size={14} />
                            {t('landing.processLabel')}
                        </motion.span>
                        <motion.h2 variants={fadeUp} className="section-title">
                            {t('landing.howTitle')} <span className="neon-text">{t('landing.howTitleHL')}</span>?
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-white/35 mt-4 max-w-xl mx-auto">
                            {t('landing.howSubtitle')}
                        </motion.p>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-4 gap-6">
                        <StepCard step="01" title={t('landing.step1Title')} desc={t('landing.step1Desc')} icon={<UsersStepIcon />} />
                        <StepCard step="02" title={t('landing.step2Title')} desc={t('landing.step2Desc')} icon={<BrainIcon size={28} />} />
                        <StepCard step="03" title={t('landing.step3Title')} desc={t('landing.step3Desc')} icon={<CalendarStepIcon />} />
                        <StepCard step="04" title={t('landing.step4Title')} desc={t('landing.step4Desc')} icon={<StarIcon size={28} />} />
                    </AnimatedSection>

                    {/* Connection line */}
                    <div className="hidden md:block relative -mt-[140px] mb-[80px] mx-12">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="h-px bg-gradient-to-r from-transparent via-neon/20 to-transparent origin-left"
                        />
                    </div>
                </div>
            </section>

            {/* Skills Showcase */}
            <section className="py-16 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedSection className="text-center mb-12">
                        <motion.span variants={fadeUp} className="badge-neon mb-4 inline-flex items-center gap-1.5">
                            <GlobeIcon size={14} />
                            {t('landing.skillsLabel')}
                        </motion.span>
                        <motion.h2 variants={fadeUp} className="section-title">
                            {t('landing.skillsTitle')} <span className="neon-text">{t('landing.skillsTitleHL')}</span>
                        </motion.h2>
                    </AnimatedSection>

                    {/* Scrolling skills marquee */}
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-dark to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-dark to-transparent z-10 pointer-events-none" />
                        <motion.div
                            className="flex gap-3 mb-3"
                            animate={{ x: [0, -1000] }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        >
                            {['Python', 'React', 'Figma', ts('Корейский'), 'ML/AI', 'English', 'Docker', ts('Немецкий'), 'Java', 'Photoshop', ts('Китайский'), 'TypeScript', 'SEO', ts('Испанский'),
                                'Python', 'React', 'Figma', ts('Корейский'), 'ML/AI', 'English', 'Docker', ts('Немецкий'), 'Java', 'Photoshop', ts('Китайский'), 'TypeScript', 'SEO', ts('Испанский')
                            ].map((skill, i) => (
                                <MarqueeSkillTag key={i} skill={skill} />
                            ))}
                        </motion.div>
                        <motion.div
                            className="flex gap-3"
                            animate={{ x: [-1000, 0] }}
                            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                        >
                            {['UI/UX Design', ts('Итальянский'), 'Node.js', ts('Математика'), 'Git', ts('Французский'), 'C++', 'Public Speaking', ts('Маркетинг'), ts('Японский'), 'Data Science', ts('Гитара'),
                                'UI/UX Design', ts('Итальянский'), 'Node.js', ts('Математика'), 'Git', ts('Французский'), 'C++', 'Public Speaking', ts('Маркетинг'), ts('Японский'), 'Data Science', ts('Гитара')
                            ].map((skill, i) => (
                                <MarqueeSkillTag key={i} skill={skill} />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-28 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedSection className="text-center mb-16">
                        <motion.span variants={fadeUp} className="badge-neon mb-4 inline-flex items-center gap-1.5">
                            <RocketIcon size={14} />
                            {t('landing.featuresLabel')}
                        </motion.span>
                        <motion.h2 variants={fadeUp} className="section-title">
                            {t('landing.featuresTitle')} <span className="neon-text">{t('landing.featuresTitleHL')}</span>?
                        </motion.h2>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-3 gap-6">
                        <FeatureCard title={t('landing.feature1Title')} desc={t('landing.feature1Desc')} icon={<BrainIcon size={24} />} />
                        <FeatureCard title={t('landing.feature2Title')} desc={t('landing.feature2Desc')} icon={<ShieldCheckIcon size={24} />} />
                        <FeatureCard title={t('landing.feature3Title')} desc={t('landing.feature3Desc')} icon={<StarIcon size={24} />} />
                        <FeatureCard title={t('landing.feature4Title')} desc={t('landing.feature4Desc')} icon={<AlertTriangleIcon size={24} />} />
                        <FeatureCard title={t('landing.feature5Title')} desc={t('landing.feature5Desc')} icon={<SearchIcon size={24} />} />
                        <FeatureCard title={t('landing.feature6Title')} desc={t('landing.feature6Desc')} icon={<CoinIcon size={24} />} />
                    </AnimatedSection>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-28 relative">
                <div className="absolute inset-0 bg-glow-top pointer-events-none" />
                <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <AnimatedSection>
                        <motion.div variants={scaleIn} className="glass-card p-12 md:p-16 border border-neon/10 relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-radial from-neon/10 to-transparent blur-3xl pointer-events-none" />
                            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 relative">
                                {t('landing.ctaTitle')} <span className="neon-text">{t('landing.ctaTitleHL')}</span>?
                            </h2>
                            <p className="text-white/40 text-lg mb-8 relative">
                                {t('landing.ctaSubtitle')}
                            </p>
                            <Link to="/register" className="neon-btn text-lg px-10 py-4 rounded-2xl inline-flex items-center gap-2 relative">
                                <RocketIcon size={20} />
                                {t('landing.ctaBtn')}
                            </Link>
                        </motion.div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8">
                                <img src="/vite.svg" alt="SkillSwap AI" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-display font-bold text-sm">
                                <span className="text-neon">Skill</span><span className="text-white">Swap</span><span className="ml-1 text-white/50">AI</span>
                            </span>
                        </div>
                        <p className="text-white/25 text-sm">
                            {t('landing.rights')}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function StatsItem({ value, label }) {
    return (
        <div className="text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-2xl md:text-3xl font-bold neon-text"
            >
                {value}
            </motion.div>
            <div className="text-sm text-white/35 mt-1">{label}</div>
        </div>
    );
}

function SkillCard({ name, icon, color, delay = 0 }) {
    return (
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
            whileHover={{ scale: 1.05, y: -15 }}
            className={`glass-card px-5 py-3.5 flex items-center gap-3 bg-gradient-to-br ${color} cursor-default group`}
        >
            <div className="group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <span className="font-medium text-white/80 group-hover:text-white transition-colors">{name}</span>
        </motion.div>
    );
}

function MarqueeSkillTag({ skill }) {
    return (
        <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-sm font-medium whitespace-nowrap hover:border-neon/20 hover:text-neon/60 transition-colors cursor-default">
            {skill}
        </div>
    );
}

function StepCard({ step, title, desc, icon }) {
    return (
        <motion.div variants={fadeUp} className="glass-card-hover p-7 text-center group relative">
            <div className="w-14 h-14 rounded-2xl bg-neon/5 border border-neon/10 flex items-center justify-center mx-auto mb-4 group-hover:border-neon/30 group-hover:shadow-neon transition-all duration-500">
                {icon}
            </div>
            <div className="text-neon/30 text-xs font-mono mb-2 tracking-wider">{step}</div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-neon transition-colors duration-300">{title}</h3>
            <p className="text-white/35 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function FeatureCard({ title, desc, icon }) {
    return (
        <motion.div variants={fadeUp} className="glass-card-hover p-7 group">
            <div className="w-12 h-12 rounded-xl bg-neon/5 border border-neon/10 flex items-center justify-center mb-4 group-hover:border-neon/30 group-hover:shadow-neon transition-all duration-500">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-neon transition-colors duration-300">{title}</h3>
            <p className="text-white/35 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
}

// Step icons (inline SVGs)
function UsersStepIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function CalendarStepIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
    );
}
