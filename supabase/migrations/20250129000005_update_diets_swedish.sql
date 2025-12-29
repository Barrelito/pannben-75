-- Migration: Translate diets to Swedish and add "Other" option

-- 1. Update Calorie Counting
UPDATE public.diet_tracks
SET 
  name = 'Kaloriräkning',
  description = 'Flexibel diet med fokus på kaloriunderskott för viktnedgång och kroppskomposition.',
  rules = '{
    "philosophy": "Energibalans - kalorier in vs kalorier ut",
    "focus": ["Kaloriunderskott", "Proteinintag", "Logga macros"],
    "strategy": ["Logga all mat", "Nå proteinmål", "Håll underskott"],
    "allowed": ["All mat som ryms i din budget"],
    "tips": ["Använd matvåg", "Logga allt", "Prioritera protein"]
  }'::jsonb
WHERE name = 'Calorie Counting';

-- 2. Update Strict Keto
UPDATE public.diet_tracks
SET 
description = 'Strikt ketogen kost med minimalt kolhydratsintag för att uppnå ketos.',
  rules = '{
    "carbs_max_grams": 20,
    "focus": ["Högt fettintag", "Måttligt protein", "Minimalt kolhydrater"],
    "avoid": ["Socker", "Spannmål", "Frukt", "Baljväxter", "Rotfrukter"],
    "allowed": ["Kött", "Fisk", "Ägg", "Ost", "Ovanjordsgrönsaker", "Naturligt fett"]
  }'::jsonb
WHERE name = 'Strict Keto';

-- 3. Update Paleo
UPDATE public.diet_tracks
SET 
  description = 'Stenålderskost. Fokus på ren, naturlig mat som våra förfäder åt.',
  rules = '{
    "philosophy": "Ät som en jägare/samlare",
    "focus": ["Ren mat", "Magert kött", "Grönsaker", "Frukt", "Nötter"],
    "avoid": ["Spannmål", "Baljväxter", "Mejeriprodukter", "Processad mat", "Socker"],
    "allowed": ["Kött", "Fisk", "Ägg", "Grönsaker", "Frukt", "Nötter", "Frön"]
  }'::jsonb
WHERE name = 'Paleo';

-- 4. Update Carnivore (just to be safe if English exists)
UPDATE public.diet_tracks
SET 
  description = 'Köttätaren. Den ultimata uteslutningsdieten. Bara animaliska produkter.',
  rules = '{
    "philosophy": "Noll kolhydrater, baserat på animalier",
    "focus": ["Kött", "Fisk", "Ägg", "Animaliskt fett"],
    "avoid": ["Växtriket", "Spannmål", "Grönsaker", "Frukt"],
    "allowed": ["Nötkött", "Fläsk", "Kyckling", "Fisk", "Ägg", "Inälvsmat", "Benbuljong"]
  }'::jsonb
WHERE name = 'Carnivore';

-- 5. Update LCHF (just to be safe)
UPDATE public.diet_tracks
SET 
  description = 'Low Carb High Fat. En livsstil med mindre kolhydrater och mer naturligt fett.',
  rules = '{
    "carbs_max_grams": 50,
    "focus": ["Naturligt fett", "Protein", "Ovanjordsgrönsaker"],
    "avoid": ["Socker", "Mjöl", "Processad mat", "Lättprodukter"],
    "allowed": ["Kött", "Fisk", "Ägg", "Mejeri", "Nötter", "Grönsaker", "Bär"]
  }'::jsonb
WHERE name = 'LCHF';

-- 6. Update Mediterranean (just to be safe)
UPDATE public.diet_tracks
SET 
  name = 'Medelhavskost',
  description = 'Balanserad kost baserad på traditionell mat från medelhavsområdet.',
  rules = '{
    "philosophy": "Balanserat och hållbart",
    "focus": ["Fullkorn", "Grönsaker", "Frukt", "Fisk", "Olivolja", "Baljväxter"],
    "moderate": ["Kyckling", "Ägg", "Mejeri", "Rödvin"],
    "avoid": ["Processad mat", "Socker", "Mycket rött kött"],
    "allowed": ["Fisk", "Grönsaker", "Frukt", "Fullkorn", "Olivolja", "Nötter"]
  }'::jsonb
WHERE name = 'Mediterranean';


-- 7. Add "Annan" (Other) option
INSERT INTO public.diet_tracks (name, description, rules) VALUES
(
  'Annan (Egen diet)',
  'Välj din egen diet. Men du måste hålla dig till den till 100%. Syftet är disciplin och ansvarstagande.',
  '{
    "philosophy": "Frihet under ansvar",
    "focus": ["Disciplin", "Ansvar", "Hålla din plan"],
    "avoid": ["Fusk", "Ursäkter", "Undantag"],
    "allowed": ["Din valda plan", "Dina regler"]
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;
