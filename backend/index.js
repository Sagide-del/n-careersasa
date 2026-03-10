const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 8080);
const DATA_PATH = path.join(__dirname, 'data', 'app-data.json');
const allowedOrigins = (
  process.env.FRONTEND_ORIGIN ||
  'http://localhost:3000,http://127.0.0.1:3000,https://careersasa.vercel.app'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

function ensureDatabase() {
  const directory = path.dirname(DATA_PATH);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(
      DATA_PATH,
      JSON.stringify({ users: [], sessions: [], results: [] }, null, 2),
      'utf8'
    );
  }
}

function readDatabase() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeDatabase(database) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(database, null, 2), 'utf8');
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createToken() {
  return crypto.randomBytes(24).toString('hex');
}

function parseBearerToken(headerValue) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

function authenticate(request, response, next) {
  const token = parseBearerToken(request.headers.authorization);
  if (!token) {
    response.status(401).json({ message: 'Missing or invalid authorization token.' });
    return;
  }

  const database = readDatabase();
  const session = database.sessions.find((entry) => entry.token === token);
  if (!session) {
    response.status(401).json({ message: 'Session not found. Please log in again.' });
    return;
  }

  const user = database.users.find((entry) => entry.id === session.userId);
  if (!user) {
    response.status(401).json({ message: 'User not found for this session.' });
    return;
  }

  request.database = database;
  request.user = user;
  request.token = token;
  next();
}

function gradeScore(grade) {
  const scores = {
    A: 12,
    'A-': 11,
    'B+': 10,
    B: 9,
    'B-': 8,
    'C+': 7,
    C: 6,
    'C-': 5,
    'D+': 4,
    D: 3,
    'D-': 2,
    E: 1,
  };

  return scores[String(grade || '').toUpperCase()] || 0;
}

function scoreSubjects(subjects) {
  return subjects.reduce((accumulator, subject) => {
    const name = String(subject.name || '').trim().toLowerCase();
    accumulator[name] = gradeScore(subject.grade);
    return accumulator;
  }, {});
}

function getSubjectScore(subjects, subjectName) {
  return subjects[String(subjectName || '').trim().toLowerCase()] || 0;
}

function scoreList(items) {
  return items.map((item) => String(item || '').toLowerCase());
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

function buildCareerRecommendations(profile) {
  const subjectMap = scoreSubjects(profile.kcse?.subjects || []);
  const hobbies = scoreList(profile.interests?.hobbies || []);
  const socialPlatforms = profile.social?.platforms || [];
  const family = profile.family || {};
  const briggs = profile.briggs || {};
  const strengths = [];
  const growthAreas = [];

  const averageGrade =
    (profile.kcse?.subjects || []).reduce((sum, subject) => sum + gradeScore(subject.grade), 0) /
    Math.max((profile.kcse?.subjects || []).length, 1);

  if (getSubjectScore(subjectMap, 'Mathematics') >= 9) {
    strengths.push('Strong quantitative reasoning from Mathematics performance.');
  }
  if (getSubjectScore(subjectMap, 'English') >= 9 || getSubjectScore(subjectMap, 'Kiswahili') >= 9) {
    strengths.push('Clear communication ability supported by language subjects.');
  }
  if (getSubjectScore(subjectMap, 'Biology') >= 8 || getSubjectScore(subjectMap, 'Chemistry') >= 8) {
    strengths.push('Solid science foundation for technical and health pathways.');
  }
  if (hobbies.includes('leadership') || hobbies.includes('debate')) {
    strengths.push('Leadership and persuasion interests stand out strongly.');
  }
  if ((family.guardianSupport || 0) <= 2) {
    growthAreas.push('Plan for scholarships and budget-friendly programme options early.');
  }
  if (socialPlatforms.some((platform) => Number(platform.hoursPerDay || 0) >= 5)) {
    growthAreas.push('Consider reducing high daily screen time to protect focus for studies.');
  }
  if (averageGrade < 7) {
    growthAreas.push('Academic reinforcement in core subjects will widen future programme choices.');
  }
  if (!growthAreas.length) {
    growthAreas.push('Keep building consistency through projects, mentorship, and exam preparation.');
  }
  if (!strengths.length) {
    strengths.push('You already show useful self-awareness by completing a broad career profile.');
  }

  const catalogue = [
    {
      name: 'Software Engineering',
      signals: ['Mathematics', 'Computer Studies', 'Physics'],
      hobbyMatches: ['coding', 'gaming', 'fixing things', 'science experiments'],
      fit: 'Balances logical problem solving with practical digital creation.',
      programmes: ['BSc Software Engineering', 'BSc Computer Science'],
      nextSteps: ['Build one coding project this month.', 'Practice math and logic consistently.'],
    },
    {
      name: 'Medicine and Health Sciences',
      signals: ['Biology', 'Chemistry', 'English'],
      hobbyMatches: ['helping people', 'science experiments', 'reading'],
      fit: 'Strong for learners motivated by science, care, and disciplined study.',
      programmes: ['Bachelor of Medicine and Surgery', 'BSc Nursing'],
      nextSteps: ['Prioritize Biology and Chemistry revision.', 'Shadow a health professional if possible.'],
    },
    {
      name: 'Business and Entrepreneurship',
      signals: ['Business Studies', 'Mathematics', 'English'],
      hobbyMatches: ['business', 'leadership', 'debate', 'photography'],
      fit: 'A good path for learners who enjoy initiative, persuasion, and commercial thinking.',
      programmes: ['BCom', 'BSc Entrepreneurship'],
      nextSteps: ['Start a small business experiment.', 'Track costs, sales, and lessons learned.'],
    },
    {
      name: 'Law and Public Policy',
      signals: ['English', 'History', 'CRE'],
      hobbyMatches: ['debate', 'leadership', 'reading', 'writing'],
      fit: 'Fits learners who communicate clearly and enjoy structured argument.',
      programmes: ['Bachelor of Laws', 'BA Political Science'],
      nextSteps: ['Join debate or public speaking opportunities.', 'Read current affairs weekly.'],
    },
    {
      name: 'Media, Design, and Communication',
      signals: ['English', 'Art & Design', 'Music'],
      hobbyMatches: ['design', 'art', 'writing', 'photography', 'music'],
      fit: 'Strong for expressive learners who want to shape stories, brands, and experiences.',
      programmes: ['BA Communication', 'BA Graphic Design'],
      nextSteps: ['Create a simple portfolio.', 'Study how strong communicators present ideas.'],
    },
    {
      name: 'Agriculture and Environmental Systems',
      signals: ['Agriculture', 'Biology', 'Geography'],
      hobbyMatches: ['farming', 'helping people', 'science experiments'],
      fit: 'Good for students interested in food systems, sustainability, and applied science.',
      programmes: ['BSc Agriculture', 'BSc Environmental Science'],
      nextSteps: ['Explore agri-tech opportunities nearby.', 'Track one real farming or sustainability problem.'],
    },
  ];

  const scored = catalogue
    .map((career) => {
      const subjectScore = career.signals.reduce(
        (sum, subjectName) => sum + getSubjectScore(subjectMap, subjectName),
        0
      );
      const hobbyScore = career.hobbyMatches.reduce(
        (sum, hobby) => sum + (hobbies.includes(hobby) ? 4 : 0),
        0
      );
      const personalityScore = career.name.includes('Law') && briggs.E >= 55 ? 5 : 0;
      const structureScore = career.name.includes('Software') && briggs.T >= 55 ? 5 : 0;
      const careScore = career.name.includes('Medicine') && briggs.F >= 55 ? 5 : 0;
      const totalScore = subjectScore + hobbyScore + personalityScore + structureScore + careScore;

      return {
        rankScore: totalScore,
        pathway_name: career.name,
        why_fit: [
          career.fit,
          `Relevant subject score: ${subjectScore}.`,
          hobbyScore > 0
            ? 'Your interests reinforce this pathway.'
            : 'You can grow fit for this pathway by building related projects.',
        ],
        suggested_programmes: career.programmes.map((programme) => ({
          programme,
          kuccps_notes: 'Suitable to review entry clusters and cut-off trends during application.',
        })),
        next_steps: career.nextSteps,
      };
    })
    .sort((left, right) => right.rankScore - left.rankScore)
    .slice(0, 3)
    .map((career, index) => ({
      rank: index + 1,
      pathway_name: career.pathway_name,
      why_fit: career.why_fit,
      suggested_programmes: career.suggested_programmes,
      next_steps: career.next_steps,
      confidence: clamp(Math.round(career.rankScore * 2.4), 52, 96),
    }));

  return {
    student_summary: {
      strengths,
      growth_areas: growthAreas,
    },
    top_3_career_pathways: scored,
  };
}

app.get('/health', (request, response) => {
  response.status(200).json({
    status: 'healthy',
    time: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    allowedOrigins,
  });
});

app.get('/', (request, response) => {
  response.json({
    message: 'CareerSasa API is running',
    routes: [
      'POST /auth/register',
      'POST /auth/login',
      'GET /auth/me',
      'POST /payments/mpesa/stkpush',
      'POST /payments/verify',
      'GET /payments/me',
      'POST /assessment/submit',
      'GET /results/:id',
    ],
  });
});

app.post('/auth/register', (request, response) => {
  const { name, email, password } = request.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    response.status(400).json({ message: 'Name, email, and password are required.' });
    return;
  }

  const database = readDatabase();
  const existingUser = database.users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    response.status(409).json({ message: 'An account with that email already exists.' });
    return;
  }

  const user = {
    id: makeId('user'),
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    paid: false,
    paymentStatus: 'unpaid',
    lastResultId: null,
    createdAt: new Date().toISOString(),
  };

  database.users.push(user);
  writeDatabase(database);

  response.status(201).json({
    message: 'Account created successfully.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      paid: user.paid,
    },
  });
});

app.post('/auth/login', (request, response) => {
  const { email, password } = request.body || {};
  const normalizedEmail = normalizeEmail(email);
  const database = readDatabase();
  const user = database.users.find(
    (entry) => entry.email === normalizedEmail && entry.password === String(password)
  );

  if (!user) {
    response.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const token = createToken();
  database.sessions = database.sessions.filter((session) => session.userId !== user.id);
  database.sessions.push({
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
  });
  writeDatabase(database);

  response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      paid: user.paid,
      lastResultId: user.lastResultId,
    },
  });
});

app.get('/auth/me', authenticate, (request, response) => {
  response.json({
    user: {
      id: request.user.id,
      name: request.user.name,
      email: request.user.email,
      paid: request.user.paid,
      paymentStatus: request.user.paymentStatus,
      lastResultId: request.user.lastResultId,
    },
  });
});

app.post('/payments/mpesa/stkpush', authenticate, (request, response) => {
  const phone = String(request.body?.phone || '').trim();
  if (!phone) {
    response.status(400).json({ message: 'Phone number is required.' });
    return;
  }

  const database = request.database;
  const user = database.users.find((entry) => entry.id === request.user.id);
  user.paymentStatus = 'pending';
  user.lastPhone = phone;
  writeDatabase(database);

  response.json({
    message: 'STK Push simulated successfully. Use Verify Payment to unlock the assessment.',
    checkoutRequestId: makeId('checkout'),
  });
});

app.post('/payments/verify', authenticate, (request, response) => {
  const database = request.database;
  const user = database.users.find((entry) => entry.id === request.user.id);
  user.paid = true;
  user.paymentStatus = 'paid';
  user.paidAt = new Date().toISOString();
  writeDatabase(database);

  response.json({
    message: 'Payment verified successfully.',
    paid: true,
  });
});

app.get('/payments/me', authenticate, (request, response) => {
  response.json({
    paid: Boolean(request.user.paid),
    status: request.user.paymentStatus || 'unpaid',
    paidAt: request.user.paidAt || null,
  });
});

app.post('/assessment/submit', authenticate, (request, response) => {
  const profile = request.body?.student_profile;
  if (!profile) {
    response.status(400).json({ message: 'Assessment data is required.' });
    return;
  }

  if (!request.user.paid) {
    response.status(403).json({ message: 'Payment is required before submitting the assessment.' });
    return;
  }

  const recommendation = buildCareerRecommendations(profile);
  const resultId = makeId('result');
  const result = {
    id: resultId,
    userId: request.user.id,
    createdAt: new Date().toISOString(),
    profile,
    ...recommendation,
  };

  const database = request.database;
  database.results.push(result);
  const user = database.users.find((entry) => entry.id === request.user.id);
  user.lastResultId = resultId;
  writeDatabase(database);

  response.status(201).json({
    message: 'Assessment submitted successfully.',
    resultId,
  });
});

app.get('/results/:id', authenticate, (request, response) => {
  const result = request.database.results.find(
    (entry) => entry.id === request.params.id && entry.userId === request.user.id
  );

  if (!result) {
    response.status(404).json({ message: 'Result not found.' });
    return;
  }

  response.json(result);
});

ensureDatabase();
app.listen(PORT, () => {
  console.log(`CareerSasa backend listening on http://localhost:${PORT}`);
});
