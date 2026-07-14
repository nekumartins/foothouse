// Local fallback so /work is correct even when Sanity has no project docs.
// Mirrors the Sanity paste block in PLAN.md's copy-correction pass exactly.
export const FALLBACK_PROJECTS = [
  {
    id: 'dysseo',
    name: 'Dysseo',
    tagline: 'A fitness engine that argues back.',
    problem:
      'Every calorie calculator hands you a number computed for a mythical average body, then never checks whether it worked.',
    approach:
      'A nutrition-first app that treats the target as a hypothesis. Burn estimates are MET-based and use your real weight, not a 70 kg default. When your measured rate of change drifts from your goal rate, the engine re-aims your recommended intake instead of pretending.',
    outcome: 'In active build toward the first milestone.',
    repo_url: undefined,
    live_url: undefined,
  },
  {
    id: 'voice-debate-coach',
    name: 'Debate Coach',
    tagline: 'Real-time, full-duplex AI sparring partner.',
    problem:
      "Voice AI is turn-based: it waits for your silence, then monologues. Real argument isn't. The moment you interrupt a turn-based agent, the illusion and the training value both collapse.",
    approach:
      'A concurrent STT to LLM to TTS pipeline over WebSockets with live barge-in: cut the AI off mid-response and it yields and adapts, using an adaptive silence threshold instead of a fixed timer. Containerized with Docker, deployed on an Azure VM with independent service boundaries for speech, inference, and synthesis.',
    outcome:
      'About 1.4 seconds end to end from your voice to its reply. Scoring validated against human evaluators using Pearson correlation. Paper submitted to SIJSET.',
    repo_url: undefined,
    live_url: undefined,
  },
  {
    id: 'gdg-babcock',
    name: 'GDG on Campus Babcock',
    tagline: 'Infrastructure and institutions. Organizer, 2024 – 2026.',
    problem:
      'A 1,500-member community with products scattered across ad-hoc deploys, and a campus tech ecosystem with no publication, no recognition system, no election platform.',
    approach:
      "I founded RADAR (a Next.js and Sanity publication for the ecosystem), Babcock 100 (an annual cross-campus recognition platform, which drew over 400 nominations in its founding cycle), and BabcockVotes.",
    outcome:
      "Five products in production. ORBIT 1.0, the chapter's industry summit, drew 500+ to the conference and 1,000+ to the career fair, headlined by Moniepoint.",
    repo_url: undefined,
    live_url: undefined,
  },
];
