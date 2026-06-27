-- Foothouse seed data
-- Run after schema.sql to populate sample rows

-- now (single row)
insert into now (listening_text, reading_title, reading_author, building_text, status_line)
values (
  'whatever''s on, a bit too loudly',
  'The Beginning of Infinity',
  'David Deutsch',
  'something that bends light, currently fighting Safari',
  'packing for Europe and pretending I''m ready'
);

-- series
insert into series (slug, title, blurb, kind, sort) values
  ('isms', 'isms', 'philosophy, slowly. solipsism, nihilism, absurdism, and whatever else keeps me up.', 'philosophy', 1);

-- posts
insert into posts (slug, title, excerpt, body, series_id, canonical, medium_url, status, published_at, reading_min)
values
  (
    'solipsism',
    'Solipsism, or the loneliest idea',
    'What if you are the only mind that exists, and everything else is furniture?',
    E'# Solipsism, or the loneliest idea\n\nWhat if you are the only mind that exists, and everything else is furniture?\n\nI first ran into solipsism in a lecture hall, second year, while someone was explaining Descartes. The professor said something like, "You can doubt everything except that you are doubting," and I thought: okay, but what about everyone else in this room?\n\nSolipsism is the position that only your own mind is sure to exist. Everything else, every other person, every rock, every star, could be a projection of your consciousness. It is not a popular position. It is not even a useful one. But it is surprisingly hard to refute.\n\n## The problem with proof\n\nYou cannot prove another mind exists from the inside. You can see behavior, hear words, watch tears fall, but you cannot access the experience behind them. You infer. You assume. And assumption is not proof.\n\nThis is not a comfortable thought. Most people hear it and move on quickly, which is probably healthy. But I stayed with it for a while, turning it over, because the discomfort felt like it pointed somewhere.\n\n## Why it matters (a little)\n\nSolipsism is not a worldview anyone actually holds. It is a stress test. It asks: how much of what you believe about other people rests on faith rather than evidence? The answer is: almost all of it. And that is not a crisis. That is just honesty about the shape of what we know.\n\nThe interesting move is not to refute solipsism but to notice what you do after hearing it. You keep talking to people. You keep caring. You act as though other minds are real because the alternative is unbearable, and maybe that is enough.\n\nSometimes the best reason to believe something is that the world works better when you do.',
    (select id from series where slug = 'isms'),
    'self',
    null,
    'published',
    '2025-03-15T10:00:00Z',
    4
  ),
  (
    'nihilism',
    'Nihilism is not the end of the conversation',
    'Most people stop at "nothing matters." The interesting part is what comes after.',
    null,
    (select id from series where slug = 'isms'),
    'medium',
    'https://medium.com/@nekumartins/nihilism-is-not-the-end-of-the-conversation',
    'published',
    '2025-05-20T10:00:00Z',
    6
  ),
  (
    'absurdism',
    'Absurdism, and the rock',
    'Camus said imagine Sisyphus happy. I think he was onto something, but not for the reason people think.',
    E'# Absurdism, and the rock\n\nCamus said imagine Sisyphus happy. I think he was onto something, but not for the reason people think.\n\nThe usual reading of "The Myth of Sisyphus" goes like this: life is meaningless, but you should keep going anyway, and somehow find joy in the repetition. That reading is fine. It is also a little too tidy.\n\n## What Camus actually said\n\nCamus was not saying "be happy despite suffering." He was saying something stranger: that the moment Sisyphus watches the boulder roll back down, that pause at the top, is where consciousness lives. The awareness of the absurd is itself the victory. Not happiness in the greeting-card sense, but lucidity.\n\nThe absurd is not a feeling. It is a relationship between what we want (meaning, order, justice) and what the universe offers (silence). Camus said the honest response is to hold both sides of that contradiction without collapsing into denial or despair.\n\n## The practical part\n\nI think about this when a project fails, or when I am doing the same task for the third time, or when someone asks "what is the point?" The point is that you noticed the question. The noticing is the point.\n\nAbsurdism is not resignation. It is the opposite. It says: the world will not hand you a reason, so you have to make one, knowing full well it is made. And that is more honest than pretending you found one lying around.',
    (select id from series where slug = 'isms'),
    'self',
    'https://medium.com/@nekumartins/absurdism-and-the-rock',
    'published',
    '2025-07-10T10:00:00Z',
    5
  );

-- unfiled medium link-out
insert into posts (slug, title, excerpt, series_id, canonical, medium_url, status, published_at, reading_min)
values (
  'on-building-in-public',
  'On building in public',
  'Why showing your work is harder than doing it, and why it matters anyway.',
  null,
  'medium',
  'https://medium.com/@nekumartins/on-building-in-public',
  'published',
  '2025-01-10T10:00:00Z',
  3
);

-- places
insert into places (name, lat, lng, arrived_on, kind, pin_type, note, sort) values
  ('Lagos', 6.5244, 3.3792, '2000-01-01', 'home', 'place', 'Where it all started.', 1),
  ('Ilishan-Remo', 6.8949, 3.7131, '2021-09-01', 'home', 'place', 'University years at Babcock.', 2),
  ('Prague', 50.0755, 14.4378, '2025-06-15', 'travel', 'moment', 'First time in Europe.', 3);

-- place_media for Lagos
insert into place_media (place_id, storage_path, caption, taken_on, sort) values
  ((select id from places where name = 'Lagos'), 'places/lagos-01.webp', 'Third Mainland Bridge at dusk.', '2024-06-01', 1),
  ((select id from places where name = 'Lagos'), 'places/lagos-02.webp', 'Lekki Conservation Centre, canopy walkway.', '2024-08-15', 2);

-- place_media for Prague (moment, single image)
insert into place_media (place_id, storage_path, caption, taken_on, sort) values
  ((select id from places where name = 'Prague'), 'places/prague-01.webp', 'Charles Bridge, early morning.', '2025-06-16', 1);

-- projects
insert into projects (name, tagline, repo_url, live_url, github_sync, status, featured, sort) values
  ('Debate Coach', 'A sparring partner you argue with out loud, to get better at thinking on your feet.', 'https://github.com/nekumartins/debate-coach', null, true, 'active', true, 1),
  ('Foothouse', 'A personal site that bends light and follows your clock.', 'https://github.com/nekumartins/foothouse', null, true, 'active', true, 2);
