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
        name: 'Data & AI',
        icon: 'brain',
        skills: [
            'Machine Learning', 'Data Science', 'Data Analysis',
            'Deep Learning', 'Computer Vision', 'NLP',
            'TensorFlow', 'PyTorch', 'Power BI', 'Tableau',
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
        name: 'Бизнес & Маркетинг',
        icon: 'briefcase',
        skills: [
            'Маркетинг', 'SEO', 'SMM', 'Copywriting', 'Email-маркетинг',
            'Google Ads', 'Таргетированная реклама', 'Контент-маркетинг',
            'Финансы', 'Бухгалтерия', 'Project Management', 'Agile/Scrum',
            'Бизнес-аналитика', 'Стартапы',
        ]
    },
    {
        name: 'Наука & Образование',
        icon: 'graduation',
        skills: [
            'Математика', 'Физика', 'Химия', 'Биология', 'Статистика',
            'Линейная алгебра', 'Мат. анализ',
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
    {
        name: 'Музыка & Творчество',
        icon: 'music',
        skills: [
            'Гитара', 'Фортепиано', 'Вокал', 'Битмейкинг',
            'Фотография', 'Видеосъёмка', 'Монтаж видео',
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
