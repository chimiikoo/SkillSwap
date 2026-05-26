// Skill matching utilities (shared logic for recommendations & search)

const SKILL_CATEGORIES = [
    { name: 'Программирование', skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'Swift', 'Kotlin', 'Go', 'Rust', 'PHP', 'C#', 'Ruby', 'SQL', 'MongoDB', 'Git', 'Docker', 'Kubernetes', 'DevOps', 'HTML/CSS', 'Vue.js', 'Angular', 'Next.js', 'Flutter', 'React Native'] },
    { name: 'Дизайн', skills: ['UI/UX Design', 'Figma', 'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', 'Blender', '3D Моделирование', 'Графический дизайн', 'Motion Design', 'Веб-дизайн'] },
    { name: 'Языки', skills: ['English', 'Немецкий', 'Испанский', 'Корейский', 'Китайский', 'Итальянский', 'Французский', 'Японский', 'Турецкий', 'Арабский', 'Кыргызский', 'Русский'] },
    { name: 'Наука & Образование', skills: ['Математика', 'Физика', 'Химия', 'Биология', 'Статистика', 'Линейная алгебра', 'Мат. анализ', 'Подготовка к ОРТ', 'IELTS', 'TOEFL', 'Duolingo', 'SAT'] },
    { name: 'Soft Skills', skills: ['Public Speaking', 'Лидерство', 'Тайм-менеджмент', 'Коммуникация', 'Критическое мышление', 'Переговоры', 'Эмоциональный интеллект'] },
];

const SKILL_ALIASES = {
    ml: 'Machine Learning',
    'machine learning': 'Machine Learning',
    'data science': 'Data Science',
    английский: 'English',
    english: 'English',
    'ui/ux': 'UI/UX Design',
    'ui ux': 'UI/UX Design',
    ux: 'UI/UX Design',
    js: 'JavaScript',
    ts: 'TypeScript',
    py: 'Python',
    speaking: 'English',
    'public speaking': 'Public Speaking',
};

const CANONICAL_SKILLS = new Set(SKILL_CATEGORIES.flatMap(c => c.skills));

export const MIN_MATCH_DISPLAY_SCORE = 35;
export const PLATFORM_FEE_PERCENT = 15;

export function normalizeSkill(skill) {
    if (!skill || typeof skill !== 'string') return '';
    const trimmed = skill.trim();
    if (!trimmed) return '';
    const lower = trimmed.toLowerCase();
    if (SKILL_ALIASES[lower]) return SKILL_ALIASES[lower];
    for (const canonical of CANONICAL_SKILLS) {
        if (canonical.toLowerCase() === lower) return canonical;
    }
    return trimmed;
}

export function normalizeSkills(skills = []) {
    return [...new Set(skills.map(normalizeSkill).filter(Boolean))];
}

export function getSkillCategory(skill) {
    const n = normalizeSkill(skill);
    for (const cat of SKILL_CATEGORIES) {
        if (cat.skills.includes(n)) return cat.name;
    }
    return 'Другое';
}

function skillsOverlap(listA, listB) {
    const setB = new Set(normalizeSkills(listB));
    const exact = normalizeSkills(listA).filter(s => setB.has(s));
    if (exact.length > 0) return { exact, categoryOnly: [] };

    const catsA = new Set(normalizeSkills(listA).map(getSkillCategory));
    const categoryOnly = normalizeSkills(listB).filter(s => {
        const cat = getSkillCategory(s);
        return cat !== 'Другое' && catsA.has(cat) && !setB.has(s);
    });
    return { exact, categoryOnly: [...new Set(categoryOnly)] };
}

export function isMarketplaceVisible(user) {
    if (!user || user.blocked || user.role === 'admin') return false;
    if (user.userType === 'tutor' || user.userType === 'school') {
        return user.tutorStatus === 'approved';
    }
    return true;
}

export function calculateMatchScore(currentUser, targetUser) {
    if (!currentUser || !targetUser) return { score: 0, reason: '', commonSkills: [], hasSkillOverlap: false };

    const myLearn = normalizeSkills(currentUser.learnSkills);
    const myTeach = normalizeSkills(currentUser.teachSkills);
    const theyTeach = normalizeSkills(targetUser.teachSkills);
    const theyLearn = normalizeSkills(targetUser.learnSkills);

    const learnTeach = skillsOverlap(myLearn, theyTeach);
    const teachLearn = skillsOverlap(myTeach, theyLearn);

    const myLearnTheyTeach = learnTeach.exact;
    const myTeachTheyLearn = teachLearn.exact;
    const categoryHits = [...new Set([...learnTeach.categoryOnly, ...teachLearn.categoryOnly])];

    const hasSkillOverlap = myLearnTheyTeach.length > 0 || myTeachTheyLearn.length > 0 || categoryHits.length > 0;
    if (!hasSkillOverlap) {
        return { score: 0, reason: '', commonSkills: [], hasSkillOverlap: false };
    }

    let skillScore = 0;
    const reasons = [];

    if (myLearnTheyTeach.length > 0) {
        skillScore += Math.min(myLearnTheyTeach.length * 12, 36);
        reasons.push(`Может научить вас: ${myLearnTheyTeach.join(', ')}`);
    }
    if (myTeachTheyLearn.length > 0) {
        skillScore += Math.min(myTeachTheyLearn.length * 12, 36);
        reasons.push(`Хочет изучить у вас: ${myTeachTheyLearn.join(', ')}`);
    }
    if (myLearnTheyTeach.length > 0 && myTeachTheyLearn.length > 0) {
        skillScore += 12;
        reasons.push('Идеальный бартер навыков!');
    }
    if (categoryHits.length > 0) {
        skillScore += Math.min(categoryHits.length * 5, 10);
        reasons.push(`Смежные навыки: ${categoryHits.slice(0, 3).join(', ')}`);
    }

    skillScore = Math.min(skillScore, 60);

    let bonusScore = 0;
    bonusScore += Math.min((targetUser.rating || 0) * 2, 10);
    if (currentUser.university && targetUser.university && currentUser.university === targetUser.university) {
        bonusScore += 8;
        reasons.push('Учится в вашем университете');
    }
    bonusScore += Math.min((targetUser.sessionsCount || 0) * 0.3, 8);
    if ((targetUser.reportCount || 0) === 0) bonusScore += 5;
    if (targetUser.isPremium) bonusScore += 5;

    if (currentUser.city && targetUser.city && currentUser.city.toLowerCase() === targetUser.city.toLowerCase()) {
        bonusScore += 5;
        reasons.push('Ваш город');
    }
    if (currentUser.teachingFormat && targetUser.teachingFormat) {
        const a = currentUser.teachingFormat;
        const b = targetUser.teachingFormat;
        if (a === b || a === 'both' || b === 'both') bonusScore += 4;
    }
    if (currentUser.maxBudget > 0 && targetUser.hourlyRate > 0 && targetUser.hourlyRate <= currentUser.maxBudget) {
        bonusScore += 6;
        reasons.push('Подходит по бюджету');
    }

    bonusScore = Math.min(bonusScore, 40);
    const score = Math.min(Math.round(skillScore + bonusScore), 100);

    return {
        score,
        reason: reasons.join('. '),
        commonSkills: [...new Set([...myLearnTheyTeach, ...myTeachTheyLearn])],
        hasSkillOverlap: true,
    };
}

export function calculateTutorStudentScore(tutorTeach, studentLearn) {
    const teach = normalizeSkills(tutorTeach);
    const learn = normalizeSkills(studentLearn);
    const overlap = teach.filter(s => learn.includes(s));
    if (overlap.length === 0) return { score: 0, overlap: [], hasOverlap: false };
    const score = Math.min(100, Math.round((overlap.length / Math.max(teach.length, 1)) * 100));
    return { score, overlap, hasOverlap: true };
}
