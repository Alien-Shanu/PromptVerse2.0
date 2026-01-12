import crypto from 'crypto';
import express from 'express';
import cookieParser from 'cookie-parser';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const existing = req.cookies?.pv_client_id;
  const clientId = typeof existing === 'string' && existing.length > 0 ? existing : crypto.randomUUID();
  if (!existing) {
    res.cookie('pv_client_id', clientId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 5,
      path: '/',
    });
  }
  req.clientId = clientId;
  next();
});

const db = new Database('promptverse.sqlite');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags_json TEXT NOT NULL,
    author TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    copies INTEGER NOT NULL DEFAULT 0,
    modelSuggestion TEXT,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompt_likes (
    promptId TEXT NOT NULL,
    clientId TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    PRIMARY KEY (promptId, clientId),
    FOREIGN KEY (promptId) REFERENCES prompts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS prompt_ratings (
    promptId TEXT NOT NULL,
    clientId TEXT NOT NULL,
    rating INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    PRIMARY KEY (promptId, clientId),
    FOREIGN KEY (promptId) REFERENCES prompts(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
  CREATE INDEX IF NOT EXISTS idx_prompts_createdAt ON prompts(createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_prompts_likes ON prompts(likes DESC);
  CREATE INDEX IF NOT EXISTS idx_prompt_likes_client ON prompt_likes(clientId);

  CREATE TABLE IF NOT EXISTS admin_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    clientId TEXT PRIMARY KEY,
    tokenId INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (tokenId) REFERENCES admin_tokens(id) ON DELETE CASCADE
  );
`);

const normalizePromptRow = (row) => {
  const tags = (() => {
    try {
      const parsed = JSON.parse(row.tags_json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    content: row.content,
    category: row.category,
    tags,
    author: row.author,
    likes: Number(row.likes) || 0,
    copies: Number(row.copies) || 0,
    modelSuggestion: row.modelSuggestion || undefined,
    createdAt: Number(row.createdAt) || Date.now(),
    likedByMe: !!row.likedByMe,
    myRating: row.myRating ? Number(row.myRating) : 0,
  };
};

const DEFAULT_ADMIN_TOKEN_SHA256 = 'e94d79bc0c5c85a18b566b6b4d761cd8703173b14b03a3520a302f2370771e92';

const ensureAdminToken = () => {
  const existing = db.prepare('SELECT 1 FROM admin_tokens WHERE token_hash = ?').get(DEFAULT_ADMIN_TOKEN_SHA256);
  if (existing) return;
  db.prepare('INSERT INTO admin_tokens (token_hash, createdAt) VALUES (?, ?)').run(DEFAULT_ADMIN_TOKEN_SHA256, Date.now());
};

ensureAdminToken();

const sha256Hex = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

const isClientAdmin = (clientId) => {
  const row = db.prepare('SELECT 1 FROM admin_sessions WHERE clientId = ?').get(clientId);
  return !!row;
};

const TARGET_PROMPT_COUNT = Number.isFinite(Number(process.env.TARGET_PROMPT_COUNT))
  ? Math.max(0, Math.floor(Number(process.env.TARGET_PROMPT_COUNT)))
  : 5_000_005;

const SEED_BATCH_SIZE = Number.isFinite(Number(process.env.SEED_BATCH_SIZE))
  ? Math.max(1, Math.floor(Number(process.env.SEED_BATCH_SIZE)))
  : 500;

let isSeeding = false;

const CATEGORIES = [
  'Image Generation',
  'Image Generation',
  'Image Generation',
  'Fun',
  'Fun',
  'Learning',
  'Learning',
  'Video Generation',
  'Video Generation',
  'Web Development',
  'Web Development',
  '3D Generation',
  '3D Generation',
  'Cartoon',
  'Cartoon',
  'Coding',
  'Creative Writing',
  'Business',
];

const AUTHORS = [
  'PromptVerse',
  'Community',
  'AlienShanu',
  'DirectorAI',
  'EarthLens',
  'CodeWizard',
  'StorySmith',
  'PixelForge',
  'BizPro',
  'TutorAI',
];

const ADJECTIVES = [
  'Actionable',
  'Practical',
  'Advanced',
  'Beginner',
  'Concise',
  'Detailed',
  'Creative',
  'Cinematic',
  'Professional',
  'Playful',
  'Structured',
  'High-Impact',
];

const TOPICS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'SQL',
  'Three.js',
  'Blender',
  'Low Poly',
  'Character Design',
  'Cartoon Style',
  'Storyboard',
  'Shot List',
  'Video Prompt',
  'Landing Page',
  'API Design',
  'Bug Fix',
  'Lesson Plan',
  'Study Guide',
  'Quiz Generator',
  'Marketing',
  'Resume',
  'Email',
  'Product Spec',
  'Prompt Engineering',
];

const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash-image',
  'veo-3.1-fast-generate-preview',
];

const pick = (arr, n) => arr[Math.floor(((n % 1_000_000) * 9301 + 49297) % 233280) % arr.length];

const pseudoRand = (n) => {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
};

const generatePrompt = (n) => {
  const adjective = pick(ADJECTIVES, n);
  const topic = pick(TOPICS, n * 7 + 13);
  const category = pick(CATEGORIES, n * 11 + 3);
  const author = pick(AUTHORS, n * 5 + 19);
  const modelSuggestion = (() => {
    if (category === 'Video Generation') return 'veo-3.1-fast-generate-preview';
    if (category === 'Image Generation' || category === '3D Generation' || category === 'Cartoon') return 'gemini-2.5-flash-image';
    return pick(MODELS, n * 17 + 23);
  })();
  const likes = Math.floor(pseudoRand(n * 29 + 31) * 5000);
  const createdAt = Date.now() - Math.floor(pseudoRand(n * 37 + 41) * 120 * 24 * 60 * 60 * 1000);
  const tags = [
    'Community',
    topic.replace(/\s+/g, ''),
    category.split(' ')[0],
    adjective.replace(/\s+/g, ''),
  ].slice(0, 4);

  return {
    id: `gen-${n}`,
    title: `${adjective} ${topic} Prompt`,
    description: `A ${adjective.toLowerCase()} prompt for ${topic.toLowerCase()} workflows.`,
    content: [
      `You are an expert assistant specialized in ${topic}.`,
      `Goal: <goal>`,
      `Constraints: <constraints>`,
      `Context: <context>`,
      `Output format: <format>`,
      `Now produce the best possible result.`,
    ].join('\n'),
    category,
    tags_json: JSON.stringify(tags),
    author,
    likes,
    copies: 0,
    modelSuggestion,
    createdAt,
  };
};

const startBackgroundSeeding = () => {
  if (isSeeding) return;
  const current = db.prepare('SELECT COUNT(*) AS c FROM prompts').get().c;
  if (current >= TARGET_PROMPT_COUNT) return;

  isSeeding = true;
  let cursor = Math.max(0, Number(current) || 0);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO prompts (id, title, description, content, category, tags_json, author, likes, copies, modelSuggestion, createdAt)
    VALUES (@id, @title, @description, @content, @category, @tags_json, @author, @likes, @copies, @modelSuggestion, @createdAt)
  `);

  const tx = db.transaction((rows) => {
    rows.forEach((r) => insert.run(r));
  });

  const step = () => {
    const remaining = TARGET_PROMPT_COUNT - cursor;
    if (remaining <= 0) {
      isSeeding = false;
      return;
    }

    const take = Math.min(SEED_BATCH_SIZE, remaining);
    const rows = new Array(take);
    for (let i = 0; i < take; i += 1) {
      rows[i] = generatePrompt(cursor + i);
    }

    try {
      tx(rows);
      cursor += take;
    } catch (err) {
      console.error('Seed failed', err);
      isSeeding = false;
      return;
    }

    setTimeout(step, 0);
  };

  setTimeout(step, 0);
};

const ensureSeedData = () => {
  const count = db.prepare('SELECT COUNT(*) AS c FROM prompts').get().c;
  if (count > 0) return;

  const now = Date.now();
  const seed = [
    {
      title: 'React Component Generator',
      description: 'Generate a React component with props and tests.',
      content: 'Create a React component named <Name> that accepts <props> and includes unit tests.',
      category: 'Coding',
      tags: ['React', 'Frontend', 'Community'],
      author: 'PromptVerse',
      likes: 0,
      modelSuggestion: 'gemini-3-flash-preview',
    },
    {
      title: 'Business Email Rewriter',
      description: 'Rewrite an email to sound professional and concise.',
      content: 'Rewrite the email below to be professional, clear, and polite:\n\n<email>',
      category: 'Business',
      tags: ['Email', 'Business', 'Community'],
      author: 'PromptVerse',
      likes: 0,
      modelSuggestion: 'gemini-3-pro-preview',
    },
    {
      title: 'Creative Story Hook',
      description: 'Create 5 hooks for a short story in this genre.',
      content: 'Give 5 story hooks for a short story in the genre: <genre>. Keep each hook under 2 sentences.',
      category: 'Creative Writing',
      tags: ['Writing', 'Ideas', 'Community'],
      author: 'PromptVerse',
      likes: 0,
      modelSuggestion: 'gemini-3-pro-preview',
    },
  ];

  const insert = db.prepare(`
    INSERT INTO prompts (id, title, description, content, category, tags_json, author, likes, copies, modelSuggestion, createdAt)
    VALUES (@id, @title, @description, @content, @category, @tags_json, @author, @likes, 0, @modelSuggestion, @createdAt)
  `);

  const tx = db.transaction(() => {
    seed.forEach((p, i) => {
      insert.run({
        id: crypto.randomUUID(),
        title: p.title,
        description: p.description,
        content: p.content,
        category: p.category,
        tags_json: JSON.stringify(p.tags),
        author: p.author,
        likes: p.likes,
        modelSuggestion: p.modelSuggestion,
        createdAt: now - i * 1000,
      });
    });
  });

  tx();
};

ensureSeedData();
startBackgroundSeeding();

app.get('/api/prompts', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize, 10) || 40));
  const category = typeof req.query.category === 'string' ? req.query.category : 'All';
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  const clientId = req.clientId;

  const where = [];
  const params = {};

  if (category && category !== 'All') {
    where.push('p.category = @category');
    params.category = category;
  }

  if (query) {
    where.push('(LOWER(p.title) LIKE @q OR LOWER(p.tags_json) LIKE @q)');
    params.q = `%${query.toLowerCase()}%`;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;

  const promptsStmt = db.prepare(`
    SELECT
      p.*,
      CASE WHEN pl.clientId IS NULL THEN 0 ELSE 1 END AS likedByMe,
      pr.rating AS myRating
    FROM prompts p
    LEFT JOIN prompt_likes pl ON pl.promptId = p.id AND pl.clientId = @clientId
    LEFT JOIN prompt_ratings pr ON pr.promptId = p.id AND pr.clientId = @clientId
    ${whereSql}
    ORDER BY p.createdAt DESC
    LIMIT @limit OFFSET @offset
  `);

  const totalStmt = db.prepare(`SELECT COUNT(*) AS c FROM prompts p ${whereSql}`);

  const rows = promptsStmt.all({ ...params, clientId, limit: pageSize, offset });
  const total = totalStmt.get(params).c;
  res.json({ prompts: rows.map(normalizePromptRow), total });
});

app.get('/api/prompts/recent', (req, res) => {
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const clientId = req.clientId;
  const stmt = db.prepare(`
    SELECT
      p.*,
      CASE WHEN pl.clientId IS NULL THEN 0 ELSE 1 END AS likedByMe,
      pr.rating AS myRating
    FROM prompts p
    LEFT JOIN prompt_likes pl ON pl.promptId = p.id AND pl.clientId = @clientId
    LEFT JOIN prompt_ratings pr ON pr.promptId = p.id AND pr.clientId = @clientId
    ORDER BY p.createdAt DESC
    LIMIT @limit
  `);
  const rows = stmt.all({ clientId, limit });
  res.json(rows.map(normalizePromptRow));
});

app.get('/api/prompts/popular', (req, res) => {
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const clientId = req.clientId;
  const stmt = db.prepare(`
    SELECT
      p.*,
      CASE WHEN pl.clientId IS NULL THEN 0 ELSE 1 END AS likedByMe,
      pr.rating AS myRating
    FROM prompts p
    LEFT JOIN prompt_likes pl ON pl.promptId = p.id AND pl.clientId = @clientId
    LEFT JOIN prompt_ratings pr ON pr.promptId = p.id AND pr.clientId = @clientId
    ORDER BY p.likes DESC, p.createdAt DESC
    LIMIT @limit
  `);
  const rows = stmt.all({ clientId, limit });
  res.json(rows.map(normalizePromptRow));
});

app.get('/api/prompts/category-counts', (_req, res) => {
  const rows = db.prepare('SELECT category, COUNT(*) AS c FROM prompts GROUP BY category').all();
  const total = db.prepare('SELECT COUNT(*) AS c FROM prompts').get().c;
  const counts = { All: total };
  rows.forEach((r) => {
    counts[r.category] = r.c;
  });
  res.json(counts);
});

app.get('/api/admin/status', (req, res) => {
  res.json({ unlocked: isClientAdmin(req.clientId) });
});

app.post('/api/admin/unlock', (req, res) => {
  const raw = typeof req.body?.token === 'string' ? req.body.token : '';
  const token = raw.trim();
  if (!token || token.length > 256) {
    res.status(400).send('Invalid token');
    return;
  }

  const tokenHash = sha256Hex(token);
  const tokenRow = db.prepare('SELECT id FROM admin_tokens WHERE token_hash = ?').get(tokenHash);
  if (!tokenRow) {
    res.status(401).send('Unauthorized');
    return;
  }

  const upsert = db.prepare(`
    INSERT INTO admin_sessions (clientId, tokenId, createdAt)
    VALUES (@clientId, @tokenId, @createdAt)
    ON CONFLICT(clientId) DO UPDATE SET tokenId = excluded.tokenId, createdAt = excluded.createdAt
  `);

  upsert.run({ clientId: req.clientId, tokenId: tokenRow.id, createdAt: Date.now() });
  res.json({ unlocked: true });
});

app.post('/api/prompts', (req, res) => {
  const now = Date.now();
  const body = req.body || {};

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';
  const category = typeof body.category === 'string' ? body.category : 'Coding';
  const author = typeof body.author === 'string' ? body.author.trim() : '';
  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim()) : ['Community'];
  const wantsLikes = Number.isFinite(body.likes) ? Math.max(0, Math.floor(body.likes)) : 0;
  const likes = isClientAdmin(req.clientId) ? wantsLikes : 0;
  const modelSuggestion = typeof body.modelSuggestion === 'string' ? body.modelSuggestion : null;

  if (!title || !description || !content || !author) {
    res.status(400).send('Missing required fields');
    return;
  }

  const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : crypto.randomUUID();
  const createdAt = Number.isFinite(body.createdAt) ? Math.floor(body.createdAt) : now;

  const insert = db.prepare(`
    INSERT INTO prompts (id, title, description, content, category, tags_json, author, likes, copies, modelSuggestion, createdAt)
    VALUES (@id, @title, @description, @content, @category, @tags_json, @author, @likes, 0, @modelSuggestion, @createdAt)
  `);

  try {
    insert.run({
      id,
      title,
      description,
      content,
      category,
      tags_json: JSON.stringify(tags.length ? tags : ['Community']),
      author,
      likes,
      modelSuggestion,
      createdAt,
    });
  } catch (err) {
    res.status(500).send('Failed to insert prompt');
    return;
  }

  const row = db.prepare('SELECT p.*, 0 AS likedByMe, NULL AS myRating FROM prompts p WHERE p.id = ?').get(id);
  res.json(normalizePromptRow(row));
});

app.put('/api/prompts/:id', (req, res) => {
  const id = String(req.params.id);
  const body = req.body || {};

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';
  const category = typeof body.category === 'string' ? body.category : 'Coding';

  if (!title || !description || !content) {
    res.status(400).send('Missing required fields');
    return;
  }

  const update = db.prepare(`
    UPDATE prompts
    SET title = @title, description = @description, content = @content, category = @category
    WHERE id = @id
  `);

  const info = update.run({ id, title, description, content, category });
  if (info.changes === 0) {
    res.status(404).send('Prompt not found');
    return;
  }

  const clientId = req.clientId;
  const row = db.prepare(`
    SELECT
      p.*,
      CASE WHEN pl.clientId IS NULL THEN 0 ELSE 1 END AS likedByMe,
      pr.rating AS myRating
    FROM prompts p
    LEFT JOIN prompt_likes pl ON pl.promptId = p.id AND pl.clientId = @clientId
    LEFT JOIN prompt_ratings pr ON pr.promptId = p.id AND pr.clientId = @clientId
    WHERE p.id = @id
  `).get({ id, clientId });

  res.json(normalizePromptRow(row));
});

app.post('/api/prompts/:id/like-toggle', (req, res) => {
  const promptId = String(req.params.id);
  const clientId = req.clientId;
  const now = Date.now();

  const existsPrompt = db.prepare('SELECT 1 FROM prompts WHERE id = ?').get(promptId);
  if (!existsPrompt) {
    res.status(404).send('Prompt not found');
    return;
  }

  const existsLike = db.prepare('SELECT 1 FROM prompt_likes WHERE promptId = ? AND clientId = ?').get(promptId, clientId);

  const insertLike = db.prepare('INSERT INTO prompt_likes (promptId, clientId, createdAt) VALUES (?, ?, ?)');
  const deleteLike = db.prepare('DELETE FROM prompt_likes WHERE promptId = ? AND clientId = ?');
  const incLikes = db.prepare('UPDATE prompts SET likes = likes + 1 WHERE id = ?');
  const decLikes = db.prepare('UPDATE prompts SET likes = CASE WHEN likes > 0 THEN likes - 1 ELSE 0 END WHERE id = ?');
  const getLikes = db.prepare('SELECT likes FROM prompts WHERE id = ?');

  const tx = db.transaction(() => {
    if (existsLike) {
      deleteLike.run(promptId, clientId);
      decLikes.run(promptId);
      return { liked: false, likes: getLikes.get(promptId).likes };
    }
    insertLike.run(promptId, clientId, now);
    incLikes.run(promptId);
    return { liked: true, likes: getLikes.get(promptId).likes };
  });

  const out = tx();
  res.json({ liked: !!out.liked, likes: Number(out.likes) || 0 });
});

app.post('/api/prompts/:id/copy', (req, res) => {
  const promptId = String(req.params.id);
  const existsPrompt = db.prepare('SELECT 1 FROM prompts WHERE id = ?').get(promptId);
  if (!existsPrompt) {
    res.status(404).send('Prompt not found');
    return;
  }

  db.prepare('UPDATE prompts SET copies = copies + 1 WHERE id = ?').run(promptId);
  const copies = db.prepare('SELECT copies FROM prompts WHERE id = ?').get(promptId).copies;
  res.json({ copies: Number(copies) || 0 });
});

app.post('/api/prompts/:id/rating', (req, res) => {
  const promptId = String(req.params.id);
  const clientId = req.clientId;
  const now = Date.now();
  const rating = Math.max(1, Math.min(5, parseInt(req.body?.rating, 10) || 0));

  const existsPrompt = db.prepare('SELECT 1 FROM prompts WHERE id = ?').get(promptId);
  if (!existsPrompt) {
    res.status(404).send('Prompt not found');
    return;
  }

  if (!rating) {
    res.status(400).send('Invalid rating');
    return;
  }

  const upsert = db.prepare(`
    INSERT INTO prompt_ratings (promptId, clientId, rating, createdAt, updatedAt)
    VALUES (@promptId, @clientId, @rating, @now, @now)
    ON CONFLICT(promptId, clientId) DO UPDATE SET rating = excluded.rating, updatedAt = excluded.updatedAt
  `);

  upsert.run({ promptId, clientId, rating, now });
  res.json({ rating });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send('Server error');
});

const staticRoot = typeof process.env.STATIC_ROOT === 'string' && process.env.STATIC_ROOT.trim()
  ? process.env.STATIC_ROOT.trim()
  : null;

if (staticRoot) {
  app.use(express.static(staticRoot));
  app.get('/index.css', (_req, res) => {
    res.type('text/css').send('');
  });
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(staticRoot, 'index.html'));
  });
}

const port = parseInt(process.env.PORT, 10) || 8787;
app.listen(port, '0.0.0.0', () => {
  console.log(`API server listening on http://localhost:${port}`);
});
