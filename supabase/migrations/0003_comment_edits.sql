-- ---------------------------------------------------------------------------
-- 0003_comment_edits
--
-- Adds an edited_at timestamp to comments so the UI can show an "(edited)"
-- marker. Safe to run more than once.
--
-- The app works without this migration — comment editing still saves, it just
-- won't display the edited marker. Running it is recommended but not required.
-- ---------------------------------------------------------------------------

alter table public.creative_comments
  add column if not exists edited_at timestamptz;
