// Centralized skill definitions with categories
export const SKILL_CATEGORIES = [
    {
        name: 'Программирование',
        icon: 'code',
        skills: [
            'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java',
            'C++', 'Swift', 'Kotlin', 'Go', 'Rust', 'PHP', 'C#', 'Ruby',
            'SQL', 'MongoDB', 'Git', 'Docker', 'Kubernetes', 'DevOps',
            'HTML/CSS', 'Vue.js', 'Angular', 'Next.js', 'Flutter', 'React Native',
        ]
    },
    {
        name: 'Дизайн',
        icon: 'palette',
        skills: [
            'UI/UX Design', 'Figma', 'Photoshop', 'Illustrator',
            'After Effects', 'Premiere Pro', 'Blender', '3D Моделирование',
            'Графический дизайн', 'Motion Design', 'Веб-дизайн',
        ]
    },
    {
        name: 'Языки',
        icon: 'globe',
        skills: [
            'English', 'Немецкий', 'Испанский', 'Корейский',
            'Китайский', 'Итальянский', 'Французский', 'Японский',
            'Турецкий', 'Арабский', 'Кыргызский', 'Русский',
        ]
    },
    {
        name: 'Наука & Образование',
        icon: 'graduation',
        skills: [
            'Математика', 'Физика', 'Химия', 'Биология', 'Статистика',
            'Линейная алгебра', 'Мат. анализ', 'Подготовка к ОРТ',
            'IELTS', 'TOEFL', 'Duolingo', 'SAT',
        ]
    },
    {
        name: 'Soft Skills',
        icon: 'users',
        skills: [
            'Public Speaking', 'Лидерство', 'Тайм-менеджмент',
            'Коммуникация', 'Критическое мышление', 'Переговоры',
            'Эмоциональный интеллект',
        ]
    },
];

// Flat list of all skills
export const ALL_SKILLS = SKILL_CATEGORIES.flatMap(c => c.skills);

// Skill to category mapping
export const getSkillCategory = (skill) => {
    for (const cat of SKILL_CATEGORIES) {
        if (cat.skills.includes(skill)) return cat.name;
    }
    return 'Другое';
};
