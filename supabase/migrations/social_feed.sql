-- Phase 15: Squad Feed & Likes
-- 1. Create feed_posts table
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create feed_likes table
CREATE TABLE IF NOT EXISTS public.feed_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Prevent double likes
);

-- 3. Enable RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Posts
-- View: Members of the squad can view posts
CREATE POLICY "Squad members can view posts"
  ON public.feed_posts FOR SELECT
  USING (
    EXISTS (
        SELECT 1 FROM public.squad_members
        WHERE squad_id = feed_posts.squad_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.squads
        WHERE id = feed_posts.squad_id AND created_by = auth.uid()
    )
  );

-- Insert: Members of the squad can post
CREATE POLICY "Squad members can post"
  ON public.feed_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
        EXISTS (
            SELECT 1 FROM public.squad_members
            WHERE squad_id = feed_posts.squad_id AND user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.squads
            WHERE id = feed_posts.squad_id AND created_by = auth.uid()
        )
    )
  );

  -- Delete: Authors and Squad Admins/Creators can delete (Simplified to Author for MVP)
CREATE POLICY "Authors can delete posts"
  ON public.feed_posts FOR DELETE
  USING (auth.uid() = user_id);


-- 5. Policies for Likes
-- View: Members can view likes
CREATE POLICY "Squad members can view likes"
  ON public.feed_likes FOR SELECT
  USING (
    EXISTS (
        SELECT 1 FROM public.feed_posts
        WHERE id = feed_likes.post_id AND (
            EXISTS (
                SELECT 1 FROM public.squad_members
                WHERE squad_id = feed_posts.squad_id AND user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM public.squads
                WHERE id = feed_posts.squad_id AND created_by = auth.uid()
            )
        )
    )
  );

-- Insert: Members can toggle likes
CREATE POLICY "Squad members can like"
  ON public.feed_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM public.feed_posts
        WHERE id = feed_likes.post_id AND (
            EXISTS (
                SELECT 1 FROM public.squad_members
                WHERE squad_id = feed_posts.squad_id AND user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM public.squads
                WHERE id = feed_posts.squad_id AND created_by = auth.uid()
            )
        )
    )
  );

-- Delete: User can remove their own like
CREATE POLICY "Users can unlike"
  ON public.feed_likes FOR DELETE
  USING (auth.uid() = user_id);
