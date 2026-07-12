// Local fallback so /work is correct even when Sanity has no project docs.
// Mirrors the Sanity paste block in PLAN.md Phase 4 exactly.
export const FALLBACK_PROJECTS = [
  {
    id: 'dysseo',
    name: 'Dysseo',
    tagline: 'A fitness app that adapts to what your body actually does. Building now.',
    problem:
      'Calorie apps hand you a fixed target and never check whether it is working. Real weight change drifts off plan within weeks.',
    approach:
      'A nutrition-first fitness app with an adaptive TDEE engine: it watches your actual rate of loss and re-targets your calorie recommendation when reality diverges from the goal rate. Python, FastAPI, PostgreSQL, Docker.',
    outcome: 'In active development. This is the thing I build at night.',
    repo_url: undefined,
    live_url: undefined,
  },
  {
    id: 'voice-debate-coach',
    name: 'AI voice debate coach',
    tagline: 'Argue out loud. It argues back.',
    problem:
      'Practicing debate needs a sharp opponent who is always available. Almost nobody has one.',
    approach:
      'A real-time, full-duplex voice debate coach: FastAPI and WebSockets carrying a live STT to LLM to TTS pipeline, containerized with Docker and deployed on Azure.',
    outcome: 'Shipped and working end to end. Paper submitted to a journal.',
    repo_url: undefined,
    live_url: undefined,
  },
  {
    id: 'gdg-babcock',
    name: 'GDG on Campus Babcock',
    tagline: 'A campus community that ships.',
    problem: 'Babcock had talented students and no serious builder community to grow them.',
    approach:
      'Founded and led GDG on Campus Babcock, growing it to 1,500+ members. With the team, shipped five products: RADAR (a publication), ORBIT (a summit), Babcock 100, BabcockVotes, and an application portal.',
    outcome: 'ORBIT drew 500+ conference attendees and a career fair of 1,000+. Handed leadership to the next team in 2026.',
    repo_url: undefined,
    live_url: undefined,
  },
];
