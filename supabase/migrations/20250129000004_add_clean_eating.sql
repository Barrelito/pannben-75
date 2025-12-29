-- Add Clean Eating diet option
-- Migration: Add Clean Eating diet for simpler approach

INSERT INTO public.diet_tracks (name, description, rules) VALUES
(
  'Clean Eating',
  'Fokus på ren, obearbetad mat. Undvik processad mat och tillsatt socker.',
  '{
    "philosophy": "Ät ren, naturlig mat",
    "focus": ["Obearbetad mat", "Halva tallriken grönsaker", "Naturliga ingredienser"],
    "avoid": ["Processad mat", "Tillsatt socker", "Snabbmat", "Läsk", "Godis"],
    "allowed": ["Grönsaker", "Frukt", "Kött", "Fisk", "Ägg", "Nötter", "Baljväxter", "Fullkorn"]
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;
