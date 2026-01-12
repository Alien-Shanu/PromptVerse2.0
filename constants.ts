import { Prompt, PromptCategory, Author } from './types';

// Base timestamp for seeds (approx 1 week ago)
const BASE_TIME = Date.now() - 7 * 24 * 60 * 60 * 1000;

export const SEED_PROMPTS: Prompt[] = [
  // --- VIDEO GENERATION (VEO) ---
  {
    id: 'veo-1',
    title: 'Cyberpunk Car Chase',
    description: 'A high-speed futuristic chase scene using Veo.',
    category: PromptCategory.VIDEO,
    tags: ['Video', 'Sci-Fi', 'Veo'],
    author: 'DirectorAI',
    likes: 4200,
    modelSuggestion: 'veo-3.1-fast-generate-preview',
    createdAt: BASE_TIME + 50000,
    content: `A neon hologram of a cat driving a futuristic car at top speed through a cyberpunk city at night. Cinematic lighting, motion blur, 4k.`
  },
  {
    id: 'veo-2',
    title: 'Nature Documentary',
    description: 'Realistic drone shot of a landscape.',
    category: PromptCategory.VIDEO,
    tags: ['Video', 'Nature', 'Cinematic'],
    author: 'EarthLens',
    likes: 3100,
    modelSuggestion: 'veo-3.1-fast-generate-preview',
    createdAt: BASE_TIME + 60000,
    content: `Cinematic drone shot flying over a majestic waterfall in Iceland during sunset. The water crashes down with mist rising, golden hour lighting, photorealistic.`
  },
  
  // --- CODING & WEB DEV ---
  {
    id: '1',
    title: 'React Component Generator',
    description: 'Create robust, accessible React components with Tailwind CSS.',
    category: PromptCategory.CODING,
    tags: ['React', 'TypeScript', 'Tailwind'],
    author: 'DevMaster',
    likes: 1240,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 100000,
    content: `Act as a senior frontend engineer. Create a React component for a [COMPONENT NAME]. 
Requirements:
1. Use TypeScript.
2. Use Tailwind CSS for styling.
3. Ensure accessibility (ARIA attributes).
4. Handle loading and error states.
5. Provide a usage example.`
  },
  {
    id: '101',
    title: 'Modern SaaS Landing Page',
    description: 'Generate a high-converting landing page structure with Hero, Features, and Pricing.',
    category: PromptCategory.WEB_DEV,
    tags: ['HTML', 'Tailwind', 'Landing Page'],
    author: 'DesignGuru',
    likes: 3420,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 200000,
    content: `Create a single-file HTML/Tailwind CSS landing page for a SaaS product named "Nebula". 
Include:
1. Sticky Header with glassmorphism.
2. Hero section with a gradient headline and CTA.
3. Feature grid with icons.
4. Pricing table with 3 tiers (highlighting the "Pro" tier).
5. Footer with links.
Use a dark, modern color scheme (black, purple, cyan).`
  },
  {
    id: '102',
    title: 'Interactive Dashboard Layout',
    description: 'A responsive admin dashboard shell with sidebar and top navigation.',
    category: PromptCategory.WEB_DEV,
    tags: ['React', 'Dashboard', 'UI'],
    author: 'FrontendNinja',
    likes: 2100,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 300000,
    content: `Write a React component for a responsive Admin Dashboard layout.
- Left sidebar (collapsible on mobile).
- Top navigation bar with user profile.
- Main content area with a grid of 4 summary cards (Users, Revenue, Traffic, Errors).
Use Tailwind CSS for styling.`
  },
  {
    id: '103',
    title: 'E-commerce Product Card',
    description: 'A stylish product card with hover effects and "Add to Cart" interaction.',
    category: PromptCategory.WEB_DEV,
    tags: ['CSS', 'Component', 'E-commerce'],
    author: 'CSS_Wizard',
    likes: 1500,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 400000,
    content: `Create a highly polished E-commerce product card using HTML and Tailwind CSS.
Features:
- Product image with zoom on hover.
- Title, Price, and Star Rating.
- "Add to Cart" button that slides up on hover.
- Discount badge in the top right corner.`
  },
  {
    id: '6',
    title: 'Unit Test Writer',
    description: 'Generate Jest unit tests for a given function.',
    category: PromptCategory.CODING,
    tags: ['Testing', 'Jest', 'JavaScript'],
    author: 'QA_Hero',
    likes: 670,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 500000,
    content: `Write comprehensive unit tests using Jest for the following code snippet. Cover edge cases and happy paths.
Code: [PASTE CODE HERE]`
  },

  // --- IMAGE GENERATION ---
  {
    id: '2',
    title: 'Cyberpunk Cityscape Generator',
    description: 'Detailed visual description for generating cyberpunk art.',
    category: PromptCategory.IMAGE,
    tags: ['Art', 'Sci-Fi', 'Visual'],
    author: 'NeonDreamer',
    likes: 890,
    modelSuggestion: 'gemini-2.5-flash-image',
    createdAt: BASE_TIME + 600000,
    content: `A futuristic cyberpunk city street at night, raining, neon signs reflecting in puddles, towering skyscrapers with holographic advertisements, flying cars zooming past, cinematic lighting, photorealistic, 8k resolution, trending on ArtStation.`
  },
  {
    id: '7',
    title: 'Surrealist Dreamscape',
    description: 'Abstract and dreamlike imagery prompt.',
    category: PromptCategory.IMAGE,
    tags: ['Abstract', 'Surrealism'],
    author: 'DaliBot',
    likes: 540,
    modelSuggestion: 'gemini-2.5-flash-image',
    createdAt: BASE_TIME + 700000,
    content: `A surreal landscape where clocks melt over ancient trees, the sky is made of ocean waves, and floating islands defy gravity. Salvador Dali style, oil painting texture, vivid colors.`
  },
  {
    id: '201',
    title: 'Isometric 3D Room',
    description: 'Generate a cute, detailed isometric room design.',
    category: PromptCategory.IMAGE,
    tags: ['3D', 'Isometric', 'Blender'],
    author: 'PolyPusher',
    likes: 1800,
    modelSuggestion: 'gemini-2.5-flash-image',
    createdAt: BASE_TIME + 800000,
    content: `A cute isometric 3D render of a cozy gamer bedroom. Neon lighting, PC setup with three monitors, a cat sleeping on a beanbag, posters on the wall, night time city view through the window. Blender style, low poly but detailed, soft shadows.`
  },
  {
    id: '202',
    title: 'Studio Ghibli Landscape',
    description: 'Anime style nature background.',
    category: PromptCategory.IMAGE,
    tags: ['Anime', 'Landscape', 'Ghibli'],
    author: 'AnimeFan01',
    likes: 2500,
    modelSuggestion: 'gemini-2.5-flash-image',
    createdAt: BASE_TIME + 900000,
    content: `A lush green meadow with a small cottage in the distance, fluffy white cumulus clouds in a bright blue sky, tall grass blowing in the wind, vibrant colors, Studio Ghibli art style, hand-painted texture.`
  },
  {
    id: '203',
    title: 'Photorealistic Portrait',
    description: 'High-end photography prompt for portraits.',
    category: PromptCategory.IMAGE,
    tags: ['Portrait', 'Photography', 'Realistic'],
    author: 'ShutterBug',
    likes: 3100,
    modelSuggestion: 'gemini-2.5-flash-image',
    createdAt: BASE_TIME + 1000000,
    content: `Portrait of an elderly fisherman with a weathered face, wearing a yellow raincoat, standing on a dock during a storm. Dramatic lighting, water droplets on face, shallow depth of field, 85mm lens, 8k resolution, highly detailed skin texture.`
  },
  {
    id: '204',
    title: 'Minimalist Tech Logo',
    description: 'Prompt for creating modern startup logos.',
    category: PromptCategory.IMAGE,
    tags: ['Logo', 'Design', 'Minimalist'],
    author: 'BrandBuilder',
    likes: 950,
    modelSuggestion: 'gemini-2.5-flash-image',
    createdAt: BASE_TIME + 1100000,
    content: `A minimalist logo for an AI startup named "Core". Geometric shapes, negative space, vector style, flat design, blue and white color palette, suitable for an app icon.`
  },
  {
    id: '205',
    title: 'Double Exposure Animal',
    description: 'Artistic double exposure combining animals and nature.',
    category: PromptCategory.IMAGE,
    tags: ['Art', 'Nature', 'Creative'],
    author: 'ArtisticSoul',
    likes: 1200,
    modelSuggestion: 'gemini-2.5-flash-image',
    createdAt: BASE_TIME + 1200000,
    content: `Double exposure art of a bear silhouette combined with a pine forest and starry night sky. The forest is inside the bear's outline. misty atmosphere, vector illustration style.`
  },

  // --- BUSINESS & STRATEGY ---
  {
    id: '4',
    title: 'Email Professionalizer',
    description: 'Turn rough notes into a polite professional email.',
    category: PromptCategory.BUSINESS,
    tags: ['Productivity', 'Email'],
    author: 'OfficeWizard',
    likes: 450,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 1300000,
    content: `Rewrite the following draft into a professional, polite, and concise business email. 
Draft: [PASTE DRAFT HERE]
Tone: Professional and slightly warm.`
  },
  {
    id: '8',
    title: 'SaaS Product Idea Validator',
    description: 'Analyze a business idea for potential pitfalls.',
    category: PromptCategory.BUSINESS,
    tags: ['Startup', 'Analysis'],
    author: 'FounderMind',
    likes: 2100,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 1500000,
    content: `Act as a venture capitalist. Critique the following SaaS idea. List 3 potential strengths and 3 critical risks.
Idea: [DESCRIBE IDEA]`
  },
  {
    id: 'b1',
    title: 'Cold Outreach Email',
    description: 'Generate a persuasive cold email to potential clients.',
    category: PromptCategory.BUSINESS,
    tags: ['Sales', 'Email', 'Marketing'],
    author: 'SalesGuru',
    likes: 850,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 2300000,
    content: `Write a cold email to a potential client [CLIENT NAME/COMPANY] offering [SERVICE/PRODUCT].
Key Points:
1. Catchy subject line.
2. Personalized opening.
3. Clear value proposition.
4. Specific call to action (e.g., 15-min call).
Keep it under 150 words.`
  },
  {
    id: 'b2',
    title: 'Effective Meeting Agenda',
    description: 'Create a structured agenda for a productive meeting.',
    category: PromptCategory.BUSINESS,
    tags: ['Productivity', 'Management'],
    author: 'OfficeWizard',
    likes: 620,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 2350000,
    content: `Draft a meeting agenda for a [MEETING TYPE] about [TOPIC].
Duration: [TIME].
Attendees: [ROLES].
Include:
1. Objectives.
2. Discussion points with time allocations.
3. Action item review.
4. Next steps.`
  },
  {
    id: 'b3',
    title: 'SWOT Analysis Generator',
    description: 'Perform a SWOT analysis for a specific business or product.',
    category: PromptCategory.BUSINESS,
    tags: ['Strategy', 'Analysis'],
    author: 'FounderMind',
    likes: 1450,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 2400000,
    content: `Conduct a detailed SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for [COMPANY/PRODUCT NAME].
Industry: [INDUSTRY].
Focus on current market trends and potential competitive advantages.`
  },
  {
    id: 'b4',
    title: 'Job Description Writer',
    description: 'Write a compelling job description to attract top talent.',
    category: PromptCategory.BUSINESS,
    tags: ['HR', 'Hiring'],
    author: 'HRPro',
    likes: 980,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 2450000,
    content: `Write a job description for a [JOB TITLE] at [COMPANY TYPE].
Include:
1. Engaging company overview.
2. Key responsibilities (bullet points).
3. Required qualifications (skills/experience).
4. "Why join us" section.`
  },
  {
    id: 'b5',
    title: 'Crisis Communication Statement',
    description: 'Draft a public statement addressing a company crisis.',
    category: PromptCategory.BUSINESS,
    tags: ['PR', 'Communication'],
    author: 'PRStrategist',
    likes: 1100,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 2500000,
    content: `Draft a press statement regarding [CRISIS EVENT].
Tone: Empathetic, transparent, and action-oriented.
Structure:
1. Acknowledge the issue.
2. Apologize sincerely.
3. Explain steps being taken to resolve it.
4. Reassure stakeholders.`
  },
  {
    id: 'b6',
    title: 'Quarterly OKR Planner',
    description: 'Define Objectives and Key Results for a team.',
    category: PromptCategory.BUSINESS,
    tags: ['Management', 'Goals', 'Strategy'],
    author: 'AgileCoach',
    likes: 1300,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 2550000,
    content: `Help me define 3 OKRs (Objectives and Key Results) for a [TEAM TYPE] team for the upcoming quarter.
Focus: [MAIN GOAL/THEME].
Ensure Key Results are measurable and ambitious.`
  },

  // --- WRITING & STORYTELLING ---
  {
    id: '5',
    title: 'Fantasy World Builder',
    description: 'Generate lore for a D&D campaign setting.',
    category: PromptCategory.WRITING,
    tags: ['RPG', 'Storytelling'],
    author: 'DungeonMasterX',
    likes: 1100,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 1400000,
    content: `Create a unique fantasy region name and description. Include:
1. Geography and Climate.
2. Main Factions/Political structure.
3. A current conflict or mystery.
4. Two notable NPCs.`
  },
  {
    id: '301',
    title: 'SEO Blog Post Generator',
    description: 'Create a structured, SEO-friendly blog post outline and intro.',
    category: PromptCategory.WRITING,
    tags: ['Marketing', 'SEO', 'Blog'],
    author: 'ContentKing',
    likes: 1600,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 1700000,
    content: `Write a comprehensive blog post outline for the keyword "[KEYWORD]".
Include:
1. Catchy Title (H1).
2. Introduction with a hook.
3. H2 and H3 subheadings covering key questions.
4. FAQ section.
5. Conclusion.`
  },

  // --- LEARNING & EDUCATION ---
  {
    id: '3',
    title: 'Complex Concept Simplifier',
    description: 'Explain difficult topics like a 5-year-old.',
    category: PromptCategory.LEARNING,
    tags: ['Education', 'ELI5'],
    author: 'TeacherAI',
    likes: 3500,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 1600000,
    content: `Explain the concept of [CONCEPT] to me as if I were a 5-year-old. Use simple analogies, avoid jargon, and keep the tone playful and encouraging.`
  },
  {
    id: '401',
    title: 'Socratic Tutor',
    description: 'Learn any topic through guided questioning.',
    category: PromptCategory.LEARNING,
    tags: ['Education', 'Philosophy', 'Critical Thinking'],
    author: 'TeacherAI',
    likes: 1200,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 1800000,
    content: `Act as a Socratic tutor. I want to learn about [TOPIC]. 
Do not just give me the answers. Instead, ask me probing questions that guide me to discover the principles myself. 
Correct me gently if I'm wrong, but encourage me to think. Start with a simple question.`
  },
  {
    id: '402',
    title: 'Language Conversationalist',
    description: 'Practice a foreign language with a patient partner.',
    category: PromptCategory.LEARNING,
    tags: ['Language', 'Practice', 'Spanish', 'French'],
    author: 'PolyglotPal',
    likes: 1850,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 1850000,
    content: `Act as a native speaker of [LANGUAGE] who is helpful and patient. 
We will have a conversation about [TOPIC].
Please correct any grammatical errors I make at the end of each response, explaining why it was incorrect.
Start by asking me a question in [LANGUAGE].`
  },
  {
    id: '403',
    title: 'Debate Club Opponent',
    description: 'Sharpen your arguments by debating an AI.',
    category: PromptCategory.LEARNING,
    tags: ['Debate', 'Logic', 'Argumentation'],
    author: 'LogicLord',
    likes: 950,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 1900000,
    content: `I want to debate the topic: "[TOPIC]".
You will take the opposing stance. 
Present your arguments logically. Keep your responses concise (under 150 words). 
Point out logical fallacies in my arguments if you find them.
Start with your opening statement.`
  },
  {
    id: '404',
    title: 'Historical Roast',
    description: 'Learn history through a roast of a historical figure.',
    category: PromptCategory.LEARNING,
    tags: ['History', 'Comedy', 'Facts'],
    author: 'HistoryBuff',
    likes: 2100,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 1950000,
    content: `Roast the historical figure [NAME] based on actual historical facts. 
Be funny and biting, but accurate. 
Mention their failures, questionable decisions, and weird habits. 
At the end, list the 3 historical facts referenced in the roast.`
  },

  // --- FUN & GAMES ---
  {
    id: '501',
    title: 'Text Adventure Game',
    description: 'Play a text-based RPG in any setting you choose.',
    category: PromptCategory.FUN,
    tags: ['Game', 'RPG', 'Interactive'],
    author: 'GameMasterPrime',
    likes: 4200,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 2000000,
    content: `Act as a text-based adventure game engine. 
The setting is [SETTING: e.g., a haunted Victorian mansion, a cyberpunk dystopia, a fantasy kingdom].
Describe my surroundings in vivid detail.
Present me with 3-4 choices for what to do next, or let me type my own action.
Keep track of my inventory and health.
Start the game now.`
  },
  {
    id: '502',
    title: 'Emoji Translator',
    description: 'Translate any sentence into a string of emojis.',
    category: PromptCategory.FUN,
    tags: ['Social', 'Emoji', 'Fun'],
    author: 'EmojiQueen',
    likes: 3100,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 2050000,
    content: `Translate the following text into a creative string of emojis. 
Do not use words, only emojis.
Text: "[TEXT HERE]"`
  },
  {
    id: '503',
    title: 'Stand-Up Comedian',
    description: 'Generate a short stand-up routine about any topic.',
    category: PromptCategory.FUN,
    tags: ['Comedy', 'Writing', 'Humor'],
    author: 'JokesterAI',
    likes: 1500,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 2100000,
    content: `Write a short stand-up comedy routine (approx. 200 words) about the topic: "[TOPIC]".
Include a setup, a few punchlines, and a call-back at the end.
Style: Observational humor like Seinfeld.`
  },
  {
    id: '504',
    title: 'Character Roleplay',
    description: 'Chat with a famous fictional character.',
    category: PromptCategory.FUN,
    tags: ['Roleplay', 'Chat', 'Fiction'],
    author: 'MethodActor',
    likes: 2800,
    modelSuggestion: 'gemini-3-pro-preview',
    createdAt: BASE_TIME + 2150000,
    content: `Stay in character as [CHARACTER NAME, e.g., Sherlock Holmes, Yoda, Tony Stark].
Respond to all my questions exactly as this character would, using their catchphrases, mannerisms, and worldview.
Never break character.
My first question is: [QUESTION]`
  },
  {
    id: '505',
    title: 'Rap Battle Generator',
    description: 'Create a rap battle between two unlikely opponents.',
    category: PromptCategory.FUN,
    tags: ['Music', 'Rap', 'Comedy'],
    author: 'BeatBoxer',
    likes: 1900,
    modelSuggestion: 'gemini-3-flash-preview',
    createdAt: BASE_TIME + 2200000,
    content: `Write a rap battle script between [PERSON A] and [PERSON B].
Each person gets 2 verses (4 lines each).
Include rhymes, flow, and personal digs relevant to the characters.
Decide who wins at the end.`
  }
];

export const MOCK_AUTHORS: Author[] = [
  { 
    name: 'DevMaster', 
    bio: 'Frontend wizard.', 
    joinedDate: '2023-11-15', 
    avatarColor: 'from-blue-500 to-cyan-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=DevMaster&backgroundColor=3b82f6'
  },
  { 
    name: 'NeonDreamer', 
    bio: 'Digital artist.', 
    joinedDate: '2024-01-10', 
    avatarColor: 'from-purple-500 to-pink-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=NeonDreamer&backgroundColor=a855f7'
  },
  { 
    name: 'TeacherAI', 
    bio: 'Passionate educator.', 
    joinedDate: '2023-09-01', 
    avatarColor: 'from-green-400 to-emerald-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=TeacherAI&backgroundColor=4ade80'
  },
  { 
    name: 'OfficeWizard', 
    bio: 'Productivity hacker.', 
    joinedDate: '2023-12-05', 
    avatarColor: 'from-orange-400 to-amber-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=OfficeWizard&backgroundColor=fb923c'
  },
  { 
    name: 'DungeonMasterX', 
    bio: 'World builder.', 
    joinedDate: '2023-10-20', 
    avatarColor: 'from-red-500 to-orange-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=DungeonMasterX&backgroundColor=ef4444'
  },
  { 
    name: 'QA_Hero', 
    bio: 'Code quality expert.', 
    joinedDate: '2024-02-01', 
    avatarColor: 'from-teal-500 to-blue-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=QA_Hero&backgroundColor=14b8a6'
  },
  { 
    name: 'DaliBot', 
    bio: 'Surrealist AI.', 
    joinedDate: '2023-12-15', 
    avatarColor: 'from-indigo-500 to-purple-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=DaliBot&backgroundColor=6366f1'
  },
  { 
    name: 'FounderMind', 
    bio: 'Business strategist.', 
    joinedDate: '2023-11-05', 
    avatarColor: 'from-yellow-500 to-orange-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=FounderMind&backgroundColor=eab308'
  },
  { 
    name: 'DesignGuru', 
    bio: 'UI/UX Specialist.', 
    joinedDate: '2024-03-01', 
    avatarColor: 'from-pink-500 to-rose-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=DesignGuru&backgroundColor=ec4899'
  },
  { 
    name: 'FrontendNinja', 
    bio: 'React enthusiast.', 
    joinedDate: '2024-02-15', 
    avatarColor: 'from-cyan-400 to-blue-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=FrontendNinja&backgroundColor=22d3ee'
  },
  { 
    name: 'CSS_Wizard', 
    bio: 'Styling expert.', 
    joinedDate: '2024-01-20', 
    avatarColor: 'from-violet-500 to-purple-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=CSS_Wizard&backgroundColor=8b5cf6'
  },
  { 
    name: 'PolyPusher', 
    bio: '3D Artist.', 
    joinedDate: '2024-02-28', 
    avatarColor: 'from-emerald-400 to-teal-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=PolyPusher&backgroundColor=34d399'
  },
  { 
    name: 'AnimeFan01', 
    bio: 'Animation lover.', 
    joinedDate: '2024-03-10', 
    avatarColor: 'from-red-400 to-pink-400',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=AnimeFan01&backgroundColor=f87171'
  },
  { 
    name: 'ShutterBug', 
    bio: 'Photographer.', 
    joinedDate: '2023-08-15', 
    avatarColor: 'from-gray-500 to-slate-700',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=ShutterBug&backgroundColor=6b7280'
  },
  { 
    name: 'BrandBuilder', 
    bio: 'Logo designer.', 
    joinedDate: '2023-09-20', 
    avatarColor: 'from-blue-600 to-indigo-700',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=BrandBuilder&backgroundColor=2563eb'
  },
  { 
    name: 'ArtisticSoul', 
    bio: 'Creative spirit.', 
    joinedDate: '2023-12-01', 
    avatarColor: 'from-fuchsia-500 to-purple-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=ArtisticSoul&backgroundColor=d946ef'
  },
  { 
    name: 'ContentKing', 
    bio: 'SEO Specialist.', 
    joinedDate: '2023-10-05', 
    avatarColor: 'from-amber-400 to-orange-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=ContentKing&backgroundColor=fbbb07'
  },
  // New Authors for new categories
  {
    name: 'SalesGuru',
    bio: 'Closing deals since 2010.',
    joinedDate: '2024-01-20',
    avatarColor: 'from-green-600 to-teal-700',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=SalesGuru&backgroundColor=059669'
  },
  {
    name: 'HRPro',
    bio: 'People and culture specialist.',
    joinedDate: '2024-03-05',
    avatarColor: 'from-rose-500 to-pink-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=HRPro&backgroundColor=e11d48'
  },
  {
    name: 'PRStrategist',
    bio: 'Master of public relations.',
    joinedDate: '2024-02-15',
    avatarColor: 'from-indigo-400 to-blue-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=PRStrategist&backgroundColor=6366f1'
  },
  {
    name: 'AgileCoach',
    bio: 'Scrum master and efficiency expert.',
    joinedDate: '2024-04-01',
    avatarColor: 'from-orange-500 to-red-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=AgileCoach&backgroundColor=f97316'
  },
  {
    name: 'PolyglotPal',
    bio: 'Language learning enthusiast.',
    joinedDate: '2024-04-01',
    avatarColor: 'from-blue-400 to-indigo-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=PolyglotPal&backgroundColor=60a5fa'
  },
  {
    name: 'GameMasterPrime',
    bio: 'Interactive fiction writer.',
    joinedDate: '2024-03-15',
    avatarColor: 'from-red-600 to-orange-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=GameMasterPrime&backgroundColor=dc2626'
  },
  {
    name: 'HistoryBuff',
    bio: 'Time traveler (conceptually).',
    joinedDate: '2024-02-20',
    avatarColor: 'from-amber-600 to-yellow-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=HistoryBuff&backgroundColor=d97706'
  },
  {
    name: 'EmojiQueen',
    bio: 'Speaking in symbols.',
    joinedDate: '2024-04-10',
    avatarColor: 'from-pink-400 to-rose-400',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=EmojiQueen&backgroundColor=fb7185'
  },
  {
    name: 'LogicLord',
    bio: 'Master of debates.',
    joinedDate: '2024-01-05',
    avatarColor: 'from-gray-600 to-gray-800',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=LogicLord&backgroundColor=4b5563'
  },
  {
    name: 'MethodActor',
    bio: 'Becoming the character.',
    joinedDate: '2024-03-25',
    avatarColor: 'from-purple-600 to-violet-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=MethodActor&backgroundColor=7c3aed'
  },
  {
    name: 'BeatBoxer',
    bio: 'Rhyme synthesizer.',
    joinedDate: '2024-04-05',
    avatarColor: 'from-cyan-500 to-teal-500',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=BeatBoxer&backgroundColor=06b6d4'
  },
  {
    name: 'JokesterAI',
    bio: 'Trying to be funny.',
    joinedDate: '2024-04-12',
    avatarColor: 'from-yellow-400 to-orange-400',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=JokesterAI&backgroundColor=fbbf24'
  },
  // New Authors for Video
  {
    name: 'DirectorAI',
    bio: 'Visionary filmmaker.',
    joinedDate: '2024-05-01',
    avatarColor: 'from-red-600 to-rose-600',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=DirectorAI&backgroundColor=e11d48'
  },
  {
    name: 'EarthLens',
    bio: 'Capturing the planet.',
    joinedDate: '2024-05-05',
    avatarColor: 'from-green-500 to-emerald-700',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=EarthLens&backgroundColor=059669'
  }
];

// --- PROCEDURAL GENERATION ---

// Helper lists for combinatorial generation
const TOPICS = [
  'Space Station', 'Underwater City', 'Medieval Castle', 'Cyberpunk Street', 'Enchanted Forest', 
  'Mars Colony', 'Steampunk Lab', 'Zen Garden', 'Haunted House', 'Crystal Cave',
  'Coffee Shop', 'Mountain Peak', 'Desert Oasis', 'Arctic Base', 'Volcano Lair',
  'Nebula Cloud', 'Quantum Computer', 'Ancient Ruins', 'Sky Fortress', 'Digital Void'
];

const STYLES = [
  'Photorealistic', 'Anime', 'Oil Painting', 'Watercolor', 'Pixel Art', 
  'Low Poly 3D', 'Isometric', 'Vector Flat', 'Synthwave', 'Noir',
  'Gothic', 'Minimalist', 'Abstract Expressionism', 'Claymation', 'Ukiyo-e',
  'Vaporwave', 'Cybernetic', 'Renaissance', 'Bauhaus', 'Glitch Art'
];

const VIDEO_STYLES = [
  'Cinematic', 'Drone Shot', 'Handheld Camera', 'Slow Motion', 'Timelapse', 'Macro', 'Wide Angle'
];

const WEB_COMPONENTS = [
  'Navbar', 'Footer', 'Hero Section', 'Pricing Table', 'Contact Form',
  'Testimonial Carousel', 'Login Modal', 'Sidebar', 'User Profile Card', 'Analytics Chart',
  'Kanban Board', 'Chat Widget', 'File Uploader', 'Settings Panel', 'Notification Toast'
];

const WEB_FRAMEWORKS = ['React', 'Vue', 'Svelte', 'HTML/CSS', 'Angular', 'SolidJS', 'Qwik'];
const WEB_STYLES = ['Tailwind CSS', 'Bootstrap', 'CSS Modules', 'Styled Components', 'Sass', 'Emotion', 'Vanilla CSS'];

const ADJECTIVES = [
  'Advanced', 'Simple', 'Professional', 'Creative', 'Funny', 'Deep', 'Quick', 
  'Detailed', 'Futuristic', 'Historic', 'Abstract', 'Technical', 'Modern', 'Retro',
  'Complex', 'Beginner-Friendly', 'Optimized', 'Dynamic', 'Interactive', 'Static'
];

// Replaced static array export with a batch generator function
export const generatePromptBatch = (startIndex: number, count: number): Prompt[] => {
  const prompts: Prompt[] = [];
  const authors = MOCK_AUTHORS.map(a => a.name);

  // Generate prompts for this specific batch
  for (let i = 0; i < count; i++) {
    const globalId = startIndex + i;
    
    // Determine category distribution
    const rand = Math.random();
    let category: PromptCategory;
    
    if (rand < 0.30) category = PromptCategory.IMAGE; 
    else if (rand < 0.45) category = PromptCategory.WEB_DEV; 
    else if (rand < 0.55) category = PromptCategory.CODING; 
    else if (rand < 0.65) category = PromptCategory.WRITING; 
    else if (rand < 0.75) category = PromptCategory.BUSINESS; 
    else if (rand < 0.85) category = PromptCategory.LEARNING; 
    else if (rand < 0.95) category = PromptCategory.FUN;
    else category = PromptCategory.VIDEO; // 5% Video

    let title = '';
    let description = '';
    let content = '';
    let tags: string[] = [];
    let modelSuggestion = 'gemini-3-flash-preview';

    if (category === PromptCategory.IMAGE) {
      const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const style = STYLES[Math.floor(Math.random() * STYLES.length)];
      title = `${style} ${topic}`;
      description = `Generate a ${style.toLowerCase()} image of a ${topic.toLowerCase()}.`;
      content = `A ${style.toLowerCase()} depiction of a ${topic.toLowerCase()}. High detail, dramatic lighting, 8k resolution, trending on ArtStation.`;
      tags = ['Art', style, 'Visual', 'Generated'];
      modelSuggestion = 'gemini-2.5-flash-image';
    } 
    else if (category === PromptCategory.VIDEO) {
      const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const style = VIDEO_STYLES[Math.floor(Math.random() * VIDEO_STYLES.length)];
      title = `${style} ${topic}`;
      description = `Create a ${style.toLowerCase()} video of a ${topic.toLowerCase()}.`;
      content = `A ${style.toLowerCase()} video clip of a ${topic.toLowerCase()}. High quality, realistic texture, 4k resolution.`;
      tags = ['Video', style, 'Veo'];
      modelSuggestion = 'veo-3.1-fast-generate-preview';
    }
    else if (category === PromptCategory.WEB_DEV) {
      const component = WEB_COMPONENTS[Math.floor(Math.random() * WEB_COMPONENTS.length)];
      const fw = WEB_FRAMEWORKS[Math.floor(Math.random() * WEB_FRAMEWORKS.length)];
      const st = WEB_STYLES[Math.floor(Math.random() * WEB_STYLES.length)];
      title = `${fw} ${component}`;
      description = `Create a responsive ${component} using ${fw} and ${st}.`;
      content = `Write the code for a ${component} component.
Stack: ${fw} + ${st}.
Requirements:
1. Responsive design.
2. Modern UI with good spacing.
3. Accessibility features.`;
      tags = [fw, st, 'Web', 'UI'];
    }
    else {
      // Generic fallback for other categories using Seed permutations
      const seedIndex = globalId % SEED_PROMPTS.length;
      const seed = SEED_PROMPTS[seedIndex];
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      title = `${adj} ${seed.title}`;
      description = seed.description;
      content = seed.content;
      tags = [...seed.tags, adj];
      modelSuggestion = seed.modelSuggestion || 'gemini-3-flash-preview';
    }

    const randomLikes = Math.floor(Math.random() * 5000) + 1; // Slightly lower max likes for distribution
    const newAuthor = authors[Math.floor(Math.random() * authors.length)];
    
    // Spread creation time out over the past 30 days
    const randomTimeOffset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    const createdAt = Date.now() - randomTimeOffset;

    prompts.push({
      id: globalId.toString(),
      title: title,
      description: description,
      content: content,
      category: category,
      tags: tags,
      author: newAuthor,
      likes: randomLikes,
      modelSuggestion: modelSuggestion,
      createdAt: createdAt
    });
  }
  
  return prompts;
};