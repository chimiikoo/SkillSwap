import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_secret_key_2026';
const DB_PATH = join(__dirname, 'skillswap.db');

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use('/api/uploads', express.static(join(__dirname, 'uploads')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Initialize SQL.js and database
let db;

async function initDB() {
    const SQL = await initSqlJs();

    if (existsSync(DB_PATH)) {
        const fileBuffer = readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      university TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      teachSkills TEXT DEFAULT '[]',
      learnSkills TEXT DEFAULT '[]',
      rating REAL DEFAULT 0,
      reviewsCount INTEGER DEFAULT 0,
      skillCoins INTEGER DEFAULT 5,
      sessionsCount INTEGER DEFAULT 0,
      reportCount INTEGER DEFAULT 0,
      blocked INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      isVerified INTEGER DEFAULT 0,
      verificationCode TEXT DEFAULT '',
      avatarUrl TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

    // Ensure columns exist for older DBs
    try {
        db.run('ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0');
        db.run('ALTER TABLE users ADD COLUMN verificationCode TEXT DEFAULT ""');
    } catch (e) { }
    try {
        db.run('ALTER TABLE users ADD COLUMN avatarUrl TEXT DEFAULT ""');
    } catch (e) { }

    db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      requesterId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      skill TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      requesterConfirmed INTEGER DEFAULT 0,
      providerConfirmed INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      authorId TEXT NOT NULL,
      targetId TEXT NOT NULL,
      sessionId TEXT,
      rating INTEGER NOT NULL,
      text TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporterId TEXT NOT NULL,
      targetId TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      text TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      fileUrl TEXT DEFAULT '',
      fileName TEXT DEFAULT '',
      fileSize INTEGER DEFAULT 0,
      duration REAL DEFAULT 0,
      isRead INTEGER DEFAULT 0,
      isEdited INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

    // Ensure columns exist for older DBs
    try {
        db.run('ALTER TABLE messages ADD COLUMN type TEXT DEFAULT "text"');
        db.run('ALTER TABLE messages ADD COLUMN fileUrl TEXT DEFAULT ""');
        db.run('ALTER TABLE messages ADD COLUMN fileName TEXT DEFAULT ""');
        db.run('ALTER TABLE messages ADD COLUMN fileSize INTEGER DEFAULT 0');
        db.run('ALTER TABLE messages ADD COLUMN duration REAL DEFAULT 0');
        db.run('ALTER TABLE messages ADD COLUMN isEdited INTEGER DEFAULT 0');
    } catch (e) { }

    saveDB();

    // Seed admin user if not exists
    const adminEmail = 'adminskillswap@gmail.com';
    const adminCheck = db.exec(`SELECT id FROM users WHERE email = '${adminEmail}'`);
    if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
        // Remove old admin if exists
        db.run("DELETE FROM users WHERE email = 'admin@skillswap.kg'");

        const adminId = uuidv4();
        const hashedPassword = bcrypt.hashSync('SkillSwap007', 10);
        db.run(`
      INSERT INTO users (id, email, password, name, university, bio, teachSkills, learnSkills, role, rating, skillCoins, sessionsCount, isVerified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            adminId, adminEmail, hashedPassword, 'System Admin',
            'SkillSwap HQ', 'Администратор платформы',
            JSON.stringify(['JavaScript', 'React', 'Node.js']),
            JSON.stringify(['Python', 'Machine Learning']),
            'admin', 5.0, 999, 100, 1 // verified
        ]);
        console.log(`Admin user created: ${adminEmail} / SkillSwap007`);
    }

    // Seed demo users
    const demoUsers = [
        { name: 'Айдана Касымова', email: 'aidana@mail.kg', university: 'КГТУ им. И. Раззакова', bio: 'Frontend разработчик с 3-летним опытом. Специализируюсь на Python и ML.', teach: ['Python', 'Machine Learning', 'Data Science', 'SQL'], learn: ['React', 'JavaScript', 'TypeScript'], rating: 4.8 },
        { name: 'Бекзат Алиев', email: 'bekzat@mail.kg', university: 'Американский Университет Центральной Азии (АУЦА)', bio: 'Дизайнер с опытом в Figma и Adobe. Создаю UI/UX для стартапов.', teach: ['UI/UX Design', 'Figma', 'Photoshop'], learn: ['Node.js', 'React', 'JavaScript'], rating: 4.5 },
        { name: 'Нурай Темирова', email: 'nuray@mail.kg', university: 'Кыргызско-Российский Славянский университет (КРСУ)', bio: 'Data Scientist, работаю с Python и ML. Хочу освоить веб.', teach: ['Data Science', 'Python', 'Machine Learning'], learn: ['JavaScript', 'React'], rating: 4.9 },
        { name: 'Тимур Батырканов', email: 'timur@mail.kg', university: 'Международный университет «Ала-Тоо»', bio: 'Fullstack разработчик Node.js / React.', teach: ['React', 'Node.js', 'TypeScript', 'DevOps'], learn: ['Machine Learning', 'Python'], rating: 4.6 },
        { name: 'Асель Жумабекова', email: 'asel@mail.kg', university: 'Бишкекский гуманитарный университет им. К. Карасаева (БГУ)', bio: 'Маркетолог и копирайтер. SEO и SMM.', teach: ['Маркетинг', 'SEO', 'Copywriting', 'English'], learn: ['Python', 'Data Science'], rating: 4.3 },
        { name: 'Эмир Турсунов', email: 'emir@mail.kg', university: 'Кыргызско-Турецкий университет «Манас»', bio: 'Java разработчик, интересуюсь фронтендом.', teach: ['Java', 'C++', 'SQL', 'Git'], learn: ['React', 'UI/UX Design', 'Figma'], rating: 4.4 },
        { name: 'Марат Сатыбалдиев', email: 'marat@mail.kg', university: 'Кыргызский Национальный университет им. Ж. Баласагына (КНУ)', bio: 'Начинающий разработчик.', teach: ['HTML', 'CSS'], learn: ['JavaScript', 'React'], rating: 3.5 },
        { name: 'Камила Оморова', email: 'kamila@mail.kg', university: 'Кыргызская Государственная медицинская академия им. И.К. Ахунбаева (КГМА)', bio: 'Медик, учу английский для стажировки.', teach: ['Биология', 'Химия'], learn: ['English', 'German'], rating: 4.7 },
    ];

    for (const u of demoUsers) {
        const check = db.exec(`SELECT id FROM users WHERE email = '${u.email}'`);
        if (check.length === 0 || check[0].values.length === 0) {
            db.run(`
        INSERT INTO users (id, email, password, name, university, bio, teachSkills, learnSkills, rating, reviewsCount, skillCoins, sessionsCount, isVerified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                uuidv4(), u.email, bcrypt.hashSync('demo123', 10), u.name,
                u.university, u.bio,
                JSON.stringify(u.teach), JSON.stringify(u.learn),
                u.rating, Math.floor(Math.random() * 20) + 5,
                Math.floor(Math.random() * 20) + 3,
                Math.floor(Math.random() * 30) + 5,
                1 // Verified
            ]);
        }
    }

    saveDB();
    console.log('Database initialized with demo data');
}

function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
}

// Helper: run query and get all rows as objects
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

// Helper: run query and get first row as object
function queryOne(sql, params = []) {
    const rows = queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

function parseUser(row) {
    if (!row) return null;
    return {
        ...row,
        teachSkills: JSON.parse(row.teachSkills || '[]'),
        learnSkills: JSON.parse(row.learnSkills || '[]'),
        blocked: !!row.blocked,
    };
}

// Auth middleware
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function adminAuth(req, res, next) {
    auth(req, res, () => {
        if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        next();
    });
}


// Email configuration — create transporter lazily to ensure env vars are loaded
let transporter = null;

function getTransporter() {
    if (!transporter) {
        console.log('📧 Creating email transporter...');
        console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '***' : 'NOT SET'}`);
        console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET'}`);

        transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true,
            logger: false
        });
    }
    return transporter;
}

async function sendVerificationEmail(email, code) {
    console.log(`\n📧 Attempting to send email to ${email}...`);
    console.log(`   EMAIL_USER env: "${process.env.EMAIL_USER || 'NOT SET'}"`);
    console.log(`   EMAIL_PASS env: ${process.env.EMAIL_PASS ? 'SET (' + process.env.EMAIL_PASS.length + ' chars)' : 'NOT SET'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your-email@gmail.com') {
        console.log(`⚠️ [EMAIL SIMULATION] Email credentials not configured!`);
        console.log(`📧 Verification code for ${email}: ${code}\n`);
        return { sent: false, simulated: true, code };
    }

    try {
        const transport = getTransporter();

        // Verify connection first
        console.log('   Verifying SMTP connection...');
        await transport.verify();
        console.log('   ✅ SMTP connection verified!');

        const info = await transport.sendMail({
            from: `"SkillSwap AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Код подтверждения регистрации — SkillSwap AI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Добро пожаловать в SkillSwap AI!</h2>
                    <p style="text-align: center; color: #555;">Для завершения регистрации введите этот код:</p>
                    <div style="background: #A3FF12; color: #000; padding: 15px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 10px; border-radius: 8px; margin: 25px 0; font-family: monospace;">
                        ${code}
                    </div>
                    <p style="color: #888; font-size: 12px; text-align: center;">Если вы не регистрировались на нашей платформе, просто удалите это письмо.</p>
                </div>
            `
        });
        console.log(`✅ Email sent successfully to ${email}`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        return { sent: true };
    } catch (error) {
        console.error(`❌ Error sending email to ${email}:`);
        console.error(`   Error code: ${error.code}`);
        console.error(`   Error message: ${error.message}`);
        console.error(`   Full error:`, error);
        if (error.code === 'EAUTH') {
            console.error('   ⚠️ CRITICAL: Gmail authentication failed!');
            console.error('   Make sure you are using an App Password (not your regular password).');
            console.error('   Go to: https://myaccount.google.com/apppasswords');
        }
        if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
            console.error('   ⚠️ Network/connection error — Render might be blocking SMTP port 465.');
        }
        console.log(`\n📧 [EMAIL FALLBACK] Verification code for ${email}: ${code}\n`);
        throw error; // Re-throw so caller knows it failed
    }
}

// =================== AUTH ROUTES ===================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, university, bio, teachSkills, learnSkills } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, пароль и имя обязательны' });
        }

        const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(400).json({ error: 'Email уже зарегистрирован' });

        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

        db.run(`
      INSERT INTO users (id, email, password, name, university, bio, teachSkills, learnSkills, isVerified, verificationCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, email, hashedPassword, name, university || '', bio || '',
            JSON.stringify(teachSkills || []), JSON.stringify(learnSkills || []),
            0, verificationCode]); // isVerified = 0

        saveDB();

        // Actually wait for email to be sent
        let emailSent = false;
        let emailSimulated = false;
        try {
            const result = await sendVerificationEmail(email, verificationCode);
            emailSent = result?.sent || false;
            emailSimulated = result?.simulated || false;
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr.message);
            emailSent = false;
        }

        if (emailSent) {
            res.json({ message: 'Code sent', email });
        } else if (emailSimulated) {
            // Dev mode — email not configured, code logged to console
            res.json({ message: 'Code sent', email, debug: true, code: verificationCode });
        } else {
            // Email failed but user was created — return code so they can still verify
            console.log(`⚠️ Returning verification code in response because email failed`);
            res.json({
                message: 'Code sent',
                email,
                emailError: true,
                code: verificationCode
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        if (user.isVerified) return res.status(400).json({ error: 'Аккаунт уже подтвержден' });
        if (user.verificationCode !== code) return res.status(400).json({ error: 'Неверный код подтверждения' });

        // Mark as verified
        db.run('UPDATE users SET isVerified = 1, verificationCode = "" WHERE id = ?', [user.id]);
        saveDB();

        const parsed = parseUser(user);
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { ...parsed, isVerified: 1, password: undefined } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) return res.status(400).json({ error: 'Неверный email или пароль' });
        if (user.blocked) return res.status(403).json({ error: 'Аккаунт заблокирован' });

        // Check verification (skip for old users where isVerified might be null/undefined/0 but allow admins/demo users for now? Let's assume admins are verified)
        // Actually, we should check if isVerified is strictly 0.
        // Demo users created at start have isVerified null (default 0).
        // I will update Demo users to be verified in initDB, but for now:
        if (user.isVerified === 0 && user.role !== 'admin') {
            // Optional: allow re-sending code here if needed, but for now just block login
            return res.status(403).json({ error: 'Email не подтвержден. Проверьте почту.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Неверный email или пароль' });

        const parsed = parseUser(user);
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { ...parsed, password: undefined } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', auth, (req, res) => {
    const user = parseUser(queryOne('SELECT * FROM users WHERE id = ?', [req.userId]));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { ...user, password: undefined } });
});

// =================== USER ROUTES ===================

app.get('/api/users/stats', auth, (req, res) => {
    const user = parseUser(queryOne('SELECT * FROM users WHERE id = ?', [req.userId]));
    res.json({
        skillCoins: user?.skillCoins || 0,
        sessionsCount: user?.sessionsCount || 0,
        avgRating: user?.rating || 0,
        reviewsCount: user?.reviewsCount || 0,
    });
});

app.put('/api/users/profile', auth, (req, res) => {
    try {
        const existing = queryOne('SELECT * FROM users WHERE id = ?', [req.userId]);
        if (!existing) return res.status(404).json({ error: 'User not found' });

        const { name, university, bio, teachSkills, learnSkills, avatarUrl } = req.body;

        db.run(`
            UPDATE users SET 
                name = ?, 
                university = ?, 
                bio = ?, 
                teachSkills = ?, 
                learnSkills = ?, 
                avatarUrl = ?
            WHERE id = ?
        `, [
            name !== undefined ? name : existing.name,
            university !== undefined ? university : existing.university,
            bio !== undefined ? bio : existing.bio,
            teachSkills !== undefined ? JSON.stringify(teachSkills) : existing.teachSkills,
            learnSkills !== undefined ? JSON.stringify(learnSkills) : existing.learnSkills,
            avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
            req.userId
        ]);

        saveDB();
        const user = parseUser(queryOne('SELECT * FROM users WHERE id = ?', [req.userId]));
        res.json({ user: { ...user, password: undefined } });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/search', auth, (req, res) => {
    const users = queryAll("SELECT * FROM users WHERE id != ? AND blocked = 0 AND role != 'admin'", [req.userId]);
    const currentUser = parseUser(queryOne('SELECT * FROM users WHERE id = ?', [req.userId]));

    const scoredUsers = users.map(u => {
        const parsed = parseUser(u);
        const matchResult = calculateMatchScore(currentUser, parsed);
        return {
            ...parsed,
            password: undefined,
            matchScore: matchResult.score,
            matchReason: matchResult.reason,
        };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ users: scoredUsers });
});

app.get('/api/users/:id', auth, (req, res) => {
    const user = parseUser(queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]));
    if (!user || user.role === 'admin') return res.status(404).json({ error: 'User not found' });

    const currentUser = parseUser(queryOne('SELECT * FROM users WHERE id = ?', [req.userId]));
    const matchResult = calculateMatchScore(currentUser, user);

    const reviews = queryAll(`
    SELECT r.*, u.name as authorName FROM reviews r
    JOIN users u ON r.authorId = u.id
    WHERE r.targetId = ? ORDER BY r.createdAt DESC LIMIT 10
  `, [req.params.id]);

    res.json({
        user: {
            ...user,
            password: undefined,
            matchScore: matchResult.score,
            matchReason: matchResult.reason,
            reviews: reviews.map(r => ({
                author: r.authorName,
                rating: r.rating,
                text: r.text,
                date: r.createdAt,
            }))
        }
    });
});

// =================== AI MATCHING ===================

function calculateMatchScore(currentUser, targetUser) {
    if (!currentUser || !targetUser) return { score: 0, reason: '', commonSkills: [] };

    let score = 0;
    const reasons = [];

    // 1. Skill barter match (most important - 40 points)
    const myLearnTheyTeach = currentUser.learnSkills.filter(s => targetUser.teachSkills.includes(s));
    const myTeachTheyLearn = currentUser.teachSkills.filter(s => targetUser.learnSkills.includes(s));

    if (myLearnTheyTeach.length > 0) {
        score += Math.min(myLearnTheyTeach.length * 10, 20);
        reasons.push(`Может научить вас: ${myLearnTheyTeach.join(', ')}`);
    }

    if (myTeachTheyLearn.length > 0) {
        score += Math.min(myTeachTheyLearn.length * 10, 20);
        reasons.push(`Хочет изучить у вас: ${myTeachTheyLearn.join(', ')}`);
    }

    // Perfect barter bonus
    if (myLearnTheyTeach.length > 0 && myTeachTheyLearn.length > 0) {
        score += 15;
        reasons.push('Идеальный бартер навыков!');
    }

    // 2. Rating bonus (up to 15 points)
    score += Math.min((targetUser.rating || 0) * 3, 15);

    // 3. Same university bonus (10 points)
    if (currentUser.university && targetUser.university && currentUser.university === targetUser.university) {
        score += 10;
        reasons.push('Учится в вашем университете');
    }

    // 4. Experience/sessions bonus (up to 10 points)
    score += Math.min((targetUser.sessionsCount || 0) * 0.5, 10);

    // 5. Low report count bonus (up to 10 points)
    if ((targetUser.reportCount || 0) === 0) {
        score += 10;
    } else if (targetUser.reportCount < 2) {
        score += 5;
    }

    score = Math.min(Math.round(score), 100);

    const reason = reasons.length > 0
        ? reasons.join('. ')
        : `Рейтинг ${targetUser.rating?.toFixed(1)}, ${targetUser.sessionsCount || 0} проведённых сессий`;

    return {
        score,
        reason,
        commonSkills: [...new Set([...myLearnTheyTeach, ...myTeachTheyLearn])],
    };
}

// =================== MATCHING ROUTES ===================

app.get('/api/matching/recommendations', auth, (req, res) => {
    const currentUser = parseUser(queryOne('SELECT * FROM users WHERE id = ?', [req.userId]));
    const users = queryAll("SELECT * FROM users WHERE id != ? AND blocked = 0 AND role != 'admin'", [req.userId]);

    const matches = users.map(u => {
        const parsed = parseUser(u);
        const match = calculateMatchScore(currentUser, parsed);
        return {
            id: parsed.id,
            name: parsed.name,
            university: parsed.university,
            rating: parsed.rating,
            teachSkills: parsed.teachSkills,
            learnSkills: parsed.learnSkills,
            matchScore: match.score,
            reason: match.reason,
            commonSkills: match.commonSkills,
            avatarUrl: parsed.avatarUrl
        };
    })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

    res.json({ matches });
});

// =================== SESSION ROUTES ===================

app.post('/api/sessions/book', auth, (req, res) => {
    const { partnerId, date, time, skill } = req.body;

    // Anti-abuse: max 1 hour per day per person
    const existingToday = queryOne(`
    SELECT COUNT(*) as count FROM sessions
    WHERE requesterId = ? AND providerId = ? AND date = ? AND status != 'cancelled'
  `, [req.userId, partnerId, date]);

    if (existingToday && existingToday.count >= 1) {
        return res.status(400).json({ error: 'Можно записаться только на 1 час в день к одному человеку' });
    }

    // Anti-abuse: max 3 bookings per day to one provider
    const providerBookingsToday = queryOne(`
    SELECT COUNT(*) as count FROM sessions
    WHERE providerId = ? AND date = ? AND status != 'cancelled'
  `, [partnerId, date]);

    if (providerBookingsToday && providerBookingsToday.count >= 3) {
        return res.status(400).json({ error: 'К этому пользователю уже записались 3 человека на этот день' });
    }

    // Anti-abuse: max 2 times per week to same person
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weeklyCount = queryOne(`
    SELECT COUNT(*) as count FROM sessions
    WHERE requesterId = ? AND providerId = ? AND date >= ? AND status != 'cancelled'
  `, [req.userId, partnerId, weekAgo]);

    if (weeklyCount && weeklyCount.count >= 2) {
        return res.status(400).json({ error: 'Нельзя записываться к одному человеку чаще 2 раз в неделю' });
    }

    const id = uuidv4();
    db.run(`
    INSERT INTO sessions (id, requesterId, providerId, skill, date, time)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, req.userId, partnerId, skill || '', date, time || '']);

    saveDB();
    res.json({ session: { id, status: 'pending' } });
});

app.get('/api/sessions/my', auth, (req, res) => {
    const sessions = queryAll(`
    SELECT s.*,
      CASE WHEN s.requesterId = ? THEN p.name ELSE r.name END as partnerName
    FROM sessions s
    LEFT JOIN users p ON s.providerId = p.id
    LEFT JOIN users r ON s.requesterId = r.id
    WHERE s.requesterId = ? OR s.providerId = ?
    ORDER BY s.date DESC LIMIT 20
  `, [req.userId, req.userId, req.userId]);

    res.json({
        sessions: sessions.map(s => ({
            ...s,
            partnerName: s.partnerName || 'Unknown',
        }))
    });
});

app.post('/api/sessions/:id/confirm', auth, (req, res) => {
    const session = queryOne('SELECT * FROM sessions WHERE id = ?', [req.params.id]);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.requesterId === req.userId) {
        db.run('UPDATE sessions SET requesterConfirmed = 1 WHERE id = ?', [req.params.id]);
    } else if (session.providerId === req.userId) {
        db.run('UPDATE sessions SET providerConfirmed = 1 WHERE id = ?', [req.params.id]);
    }

    const updated = queryOne('SELECT * FROM sessions WHERE id = ?', [req.params.id]);
    if (updated.requesterConfirmed && updated.providerConfirmed) {
        db.run("UPDATE sessions SET status = 'completed' WHERE id = ?", [req.params.id]);
        db.run('UPDATE users SET skillCoins = skillCoins + 1, sessionsCount = sessionsCount + 1 WHERE id = ?', [updated.requesterId]);
        db.run('UPDATE users SET skillCoins = skillCoins + 1, sessionsCount = sessionsCount + 1 WHERE id = ?', [updated.providerId]);
    }

    saveDB();
    res.json({ success: true });
});

// =================== REVIEW ROUTES ===================

app.post('/api/reviews/create', auth, (req, res) => {
    const { userId, rating, text } = req.body;

    // Simple toxicity filter
    const toxicWords = ['дурак', 'идиот', 'тупой', 'кретин', 'мусор'];
    const hasToxic = toxicWords.some(w => text?.toLowerCase().includes(w));
    if (hasToxic) {
        return res.status(400).json({ error: 'Отзыв содержит недопустимые выражения' });
    }

    const id = uuidv4();
    db.run(`
    INSERT INTO reviews (id, authorId, targetId, rating, text)
    VALUES (?, ?, ?, ?, ?)
  `, [id, req.userId, userId, rating, text || '']);

    // Update target average rating
    const avgResult = queryOne('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE targetId = ?', [userId]);
    db.run('UPDATE users SET rating = ?, reviewsCount = ? WHERE id = ?', [
        avgResult?.avg || 0, avgResult?.count || 0, userId
    ]);

    saveDB();
    res.json({ success: true });
});

// =================== REPORT ROUTES ===================

app.post('/api/reports/create', auth, (req, res) => {
    const { userId, reason } = req.body;

    const id = uuidv4();
    db.run(`
    INSERT INTO reports (id, reporterId, targetId, reason)
    VALUES (?, ?, ?, ?)
  `, [id, req.userId, userId, reason]);

    db.run('UPDATE users SET reportCount = reportCount + 1 WHERE id = ?', [userId]);

    // Auto-block if 3+ reports
    const user = queryOne('SELECT reportCount FROM users WHERE id = ?', [userId]);
    if (user && user.reportCount >= 3) {
        db.run('UPDATE users SET blocked = 1 WHERE id = ?', [userId]);
    }

    saveDB();
    res.json({ success: true });
});

// =================== ADMIN ROUTES ===================

app.get('/api/admin/stats', adminAuth, (req, res) => {
    const activeUsers = queryOne('SELECT COUNT(*) as count FROM users WHERE blocked = 0');
    const totalSessions = queryOne('SELECT COUNT(*) as count FROM sessions');
    const avgRating = queryOne('SELECT AVG(rating) as avg FROM users WHERE rating > 0');
    const pendingReports = queryOne("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'");

    res.json({
        activeUsers: activeUsers?.count || 0,
        totalSessions: totalSessions?.count || 0,
        avgRating: avgRating?.avg || 0,
        pendingReports: pendingReports?.count || 0,
    });
});

app.get('/api/admin/users', adminAuth, (req, res) => {
    const users = queryAll('SELECT * FROM users ORDER BY createdAt DESC');
    res.json({ users: users.map(u => ({ ...parseUser(u), password: undefined })) });
});

app.get('/api/admin/reports', adminAuth, (req, res) => {
    const reports = queryAll(`
    SELECT r.*,
      reporter.name as reporterName,
      target.name as targetName
    FROM reports r
    LEFT JOIN users reporter ON r.reporterId = reporter.id
    LEFT JOIN users target ON r.targetId = target.id
    ORDER BY r.createdAt DESC
  `);

    res.json({ reports });
});

app.post('/api/admin/users/:id/block', adminAuth, (req, res) => {
    const user = queryOne('SELECT blocked FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    db.run('UPDATE users SET blocked = ? WHERE id = ?', [user.blocked ? 0 : 1, req.params.id]);
    saveDB();
    res.json({ success: true });
});

app.delete('/api/admin/users/:id', adminAuth, (req, res) => {
    const userId = req.params.id;

    // Prevent self-deletion if needed, though adminAuth ensures it's an admin
    // but just in case we don't want admin to delete themselves via this route
    if (userId === req.userId) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Delete user and all related data
    db.run('DELETE FROM users WHERE id = ?', [userId]);
    db.run('DELETE FROM sessions WHERE requesterId = ? OR providerId = ?', [userId, userId]);
    db.run('DELETE FROM reviews WHERE authorId = ? OR targetId = ?', [userId, userId]);
    db.run('DELETE FROM reports WHERE reporterId = ? OR targetId = ?', [userId, userId]);
    db.run('DELETE FROM messages WHERE senderId = ? OR receiverId = ?', [userId, userId]);

    saveDB();
    res.json({ success: true, message: 'User and all associated data deleted' });
});

app.post('/api/admin/reports/:id/resolve', adminAuth, (req, res) => {
    db.run("UPDATE reports SET status = 'resolved' WHERE id = ?", [req.params.id]);
    saveDB();
    res.json({ success: true });
});

// =================== CHAT & BARTER ROUTES ===================

app.get('/api/chat/conversations', auth, (req, res) => {
    // Get list of users with whom the current user has exchanged messages
    // This is a bit complex in SQLite without DISTINCT ON, so we fetch all relative messages
    const messages = queryAll(`
        SELECT * FROM messages 
        WHERE senderId = ? OR receiverId = ?
        ORDER BY createdAt DESC
    `, [req.userId, req.userId]);

    const partnerIds = new Set();
    const conversations = [];

    for (const m of messages) {
        const partnerId = m.senderId === req.userId ? m.receiverId : m.senderId;
        if (!partnerIds.has(partnerId)) {
            partnerIds.add(partnerId);
            const partner = parseUser(queryOne('SELECT id, name, university, rating, avatarUrl FROM users WHERE id = ?', [partnerId]));
            if (partner) {
                conversations.push({
                    partner,
                    lastMessage: m.text,
                    lastMessageDate: m.createdAt,
                    unreadCount: m.receiverId === req.userId && !m.isRead ? 1 : 0 // Simplified count
                });
            }
        }
    }

    res.json({ conversations });
});

app.get('/api/chat/history/:partnerId', auth, (req, res) => {
    const { partnerId } = req.params;

    // Mark as read
    db.run('UPDATE messages SET isRead = 1 WHERE receiverId = ? AND senderId = ?', [req.userId, partnerId]);
    saveDB();

    const messages = queryAll(`
        SELECT * FROM messages 
        WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
        ORDER BY createdAt ASC
    `, [req.userId, partnerId, partnerId, req.userId]);

    // Check for active barter session
    const activeSession = queryOne(`
        SELECT * FROM sessions 
        WHERE ((requesterId = ? AND providerId = ?) OR (requesterId = ? AND providerId = ?))
        AND status IN ('pending', 'offered')
    `, [req.userId, partnerId, partnerId, req.userId]);

    res.json({ messages, activeSession });
});

app.get('/api/chat/unread-count', auth, (req, res) => {
    const unread = queryOne('SELECT COUNT(*) as count FROM messages WHERE receiverId = ? AND isRead = 0', [req.userId]);
    res.json({ count: unread?.count || 0 });
});

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

app.post('/api/chat/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/api/uploads/${req.file.filename}`;
    res.json({
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        type: req.file.mimetype.startsWith('image/') ? 'image' :
            req.file.mimetype.startsWith('audio/') ? 'voice' : 'file'
    });
});

app.post('/api/users/avatar', auth, upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const avatarUrl = `/api/uploads/${req.file.filename}`;

        // Auto-update user profile with new avatar
        db.run('UPDATE users SET avatarUrl = ? WHERE id = ?', [avatarUrl, req.userId]);
        saveDB();

        res.json({ success: true, avatarUrl });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chat/send', auth, (req, res) => {
    const { receiverId, text, type, fileUrl, fileName, fileSize, duration } = req.body;
    const id = uuidv4();

    db.run(`
        INSERT INTO messages (id, senderId, receiverId, text, type, fileUrl, fileName, fileSize, duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, req.userId, receiverId, text || '', type || 'text', fileUrl || '', fileName || '', fileSize || 0, duration || 0]);

    saveDB();
    res.json({
        success: true,
        message: {
            id, senderId: req.userId, receiverId, text, type, fileUrl, fileName, fileSize, duration,
            createdAt: new Date().toISOString()
        }
    });
});

app.put('/api/chat/messages/:id', auth, (req, res) => {
    const { text } = req.body;
    const { id } = req.params;

    const message = queryOne('SELECT senderId FROM messages WHERE id = ?', [id]);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.senderId !== req.userId) return res.status(403).json({ error: 'Unauthorized to edit this message' });

    db.run('UPDATE messages SET text = ?, isEdited = 1 WHERE id = ?', [text, id]);
    saveDB();

    res.json({ success: true, text });
});

app.delete('/api/chat/messages/:id', auth, (req, res) => {
    const { id } = req.params;

    const message = queryOne('SELECT senderId FROM messages WHERE id = ?', [id]);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.senderId !== req.userId) return res.status(403).json({ error: 'Unauthorized to delete this message' });

    db.run('DELETE FROM messages WHERE id = ?', [id]);
    saveDB();

    res.json({ success: true });
});

// =================== CHAT & BARTER HANDSHAKE ===================

app.post('/api/barter/propose', auth, (req, res) => {
    try {
        const { partnerId, date, time } = req.body;
        if (!date) return res.status(400).json({ error: 'Выберите дату для бартера' });

        // Check if there is already an active/pending session
        const existing = queryOne(`
            SELECT * FROM sessions 
            WHERE ((requesterId = ? AND providerId = ?) OR (requesterId = ? AND providerId = ?))
            AND status IN ('offered', 'active', 'pending')
        `, [req.userId, partnerId, partnerId, req.userId]);

        if (existing) {
            return res.status(400).json({ error: 'У вас уже есть активное предложение или бартер с этим пользователем' });
        }

        const id = uuidv4();
        db.run(`
            INSERT INTO sessions (id, requesterId, providerId, skill, date, time, status, requesterConfirmed, providerConfirmed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, req.userId, partnerId, 'Barter', date, time || '', 'offered', 1, 0]);

        // Send a system message to chat
        const msgId = uuidv4();
        const dateStr = new Date(date).toLocaleDateString('ru-RU');
        const timeStr = time ? ` в ${time}` : '';

        db.run(`INSERT INTO messages (id, senderId, receiverId, text, type, fileName) VALUES (?, ?, ?, ?, ?, ?)`,
            [msgId, req.userId, partnerId, `Предлагает бартер на ${dateStr}${timeStr}`, 'barter_offer', id]);

        saveDB();
        res.json({ success: true, message: 'Предложение отправлено', sessionId: id });
    } catch (err) {
        console.error('Barter propose error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/barter/accept', auth, (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = queryOne('SELECT * FROM sessions WHERE id = ?', [sessionId]);

        if (!session) return res.status(404).json({ error: 'Предложение не найдено' });
        if (session.status !== 'offered') return res.status(400).json({ error: 'Это предложение уже не активно' });

        // Update session
        db.run("UPDATE sessions SET providerConfirmed = 1, status = 'active' WHERE id = ?", [sessionId]);

        // Send confirmation message
        const msgId = uuidv4();
        const dateStr = new Date(session.date).toLocaleDateString('ru-RU');
        const timeStr = session.time ? ` в ${session.time}` : '';

        db.run(`INSERT INTO messages (id, senderId, receiverId, text, type) VALUES (?, ?, ?, ?, ?)`,
            [msgId, req.userId, session.requesterId, `Принял ваш бартер на ${dateStr}${timeStr}. Бартер запланирован!`, 'barter_status']);

        saveDB();
        res.json({ success: true, message: 'Бартер успешно подтвержден!' });
    } catch (err) {
        console.error('Barter accept error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/barter/reject', auth, (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = queryOne('SELECT * FROM sessions WHERE id = ?', [sessionId]);

        if (!session) return res.status(404).json({ error: 'Предложение не найдено' });

        db.run("UPDATE sessions SET status = 'cancelled' WHERE id = ?", [sessionId]);

        // Send rejection message
        const msgId = uuidv4();
        db.run(`INSERT INTO messages (id, senderId, receiverId, text, type) VALUES (?, ?, ?, ?, ?)`,
            [msgId, req.userId, session.requesterId === req.userId ? session.providerId : session.requesterId,
                'Предложение бартера отклонено', 'barter_status']);

        saveDB();
        res.json({ success: true, message: 'Предложение отклонено' });
    } catch (err) {
        console.error('Barter reject error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        message: err.message
    });
});

// Start server
async function start() {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 SkillSwap AI Server running on:`);
        console.log(`   - Local:   http://localhost:${PORT}`);
        console.log(`   - Network: http://0.0.0.0:${PORT} (use your IP)`);
        console.log(`👥 Demo users: aidana@mail.kg, bekzat@mail.kg, etc. / demo123\n`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
