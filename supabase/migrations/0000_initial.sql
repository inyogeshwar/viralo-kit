-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: instagram_accounts
CREATE TABLE instagram_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  username TEXT,
  profile_picture_url TEXT,
  access_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  capabilities_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_account_id TEXT,
  instagram_media_id TEXT,
  media_type TEXT NOT NULL,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  permalink TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: post_media
CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  format TEXT,
  position INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: post_metrics
CREATE TABLE post_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reach INTEGER,
  impressions INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  total_interactions INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: ai_generations
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  generation_type TEXT NOT NULL,
  input_metadata JSONB,
  output TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- profiles
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- instagram_accounts
CREATE POLICY "Users can view own instagram accounts" 
ON instagram_accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own instagram accounts" 
ON instagram_accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own instagram accounts" 
ON instagram_accounts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own instagram accounts" 
ON instagram_accounts FOR DELETE 
USING (auth.uid() = user_id);

-- posts
CREATE POLICY "Users can view own posts" 
ON posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" 
ON posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
ON posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
ON posts FOR DELETE 
USING (auth.uid() = user_id);

-- post_media (derived via post_id)
-- Note: Simplified to directly check if the user owns the parent post
CREATE POLICY "Users can view own post media"
ON post_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own post media"
ON post_media FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own post media"
ON post_media FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()
  )
);

-- post_metrics
CREATE POLICY "Users can view own post metrics"
ON post_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_metrics.post_id AND posts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own post metrics"
ON post_metrics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_metrics.post_id AND posts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own post metrics"
ON post_metrics FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_metrics.post_id AND posts.user_id = auth.uid()
  )
);

-- ai_generations
CREATE POLICY "Users can view own ai generations" 
ON ai_generations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai generations" 
ON ai_generations FOR INSERT 
WITH CHECK (auth.uid() = user_id);
