
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Auto-create profile & assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  IF NEW.email = 'info@degarengarage.nl' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crochet Events
CREATE TABLE public.crochet_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_spots INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crochet_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by all" ON public.crochet_events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.crochet_events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Event Registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.crochet_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrations viewable by all" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Users register themselves" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel own registration" ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage registrations" ON public.event_registrations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Proposals
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  link TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proposals viewable by all" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "Users create proposals" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own proposals" ON public.proposals FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Proposal Votes
CREATE TABLE public.proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);
ALTER TABLE public.proposal_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes viewable by all" ON public.proposal_votes FOR SELECT USING (true);
CREATE POLICY "Users vote" ON public.proposal_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own vote" ON public.proposal_votes FOR DELETE USING (auth.uid() = user_id);

-- Inspiration Posts
CREATE TABLE public.inspiration_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inspiration_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inspiration viewable by all" ON public.inspiration_posts FOR SELECT USING (true);
CREATE POLICY "Admins manage inspiration" ON public.inspiration_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable by all" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Users ask questions" ON public.questions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Question Replies
CREATE TABLE public.question_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.question_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies viewable by all" ON public.question_replies FOR SELECT USING (true);
CREATE POLICY "Users reply" ON public.question_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community Creations
CREATE TABLE public.community_creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_creations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creations viewable by all" ON public.community_creations FOR SELECT USING (true);
CREATE POLICY "Users share creations" ON public.community_creations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Creation Likes
CREATE TABLE public.creation_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creation_id UUID NOT NULL REFERENCES public.community_creations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creation_id, user_id)
);
ALTER TABLE public.creation_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes viewable by all" ON public.creation_likes FOR SELECT USING (true);
CREATE POLICY "Users like" ON public.creation_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike" ON public.creation_likes FOR DELETE USING (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal-images', 'proposal-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('community-images', 'community-images', true);

CREATE POLICY "Public read proposal images" ON storage.objects FOR SELECT USING (bucket_id = 'proposal-images');
CREATE POLICY "Users upload proposal images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proposal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read community images" ON storage.objects FOR SELECT USING (bucket_id = 'community-images');
CREATE POLICY "Users upload community images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);
