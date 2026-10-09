CREATE TABLE auto_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id TEXT NOT NULL UNIQUE,
  instagram_account_id TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
