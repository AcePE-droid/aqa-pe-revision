-- Allow users to delete their own question_progress rows.
--
-- The original table (20260907000000) shipped select/insert/update only, so
-- "Reset flashcard & question progress" silently cleared flashcard_progress
-- and localStorage while leaving every cloud question row in place. My
-- Progress reads question_progress directly, so question strength figures
-- survived a reset that claimed to clear them.
--
-- Both halves are required: automatic Data API exposure is disabled at the
-- project level, so an RLS policy alone still leaves the delete unreachable.

create policy "Users can delete their own question progress"
  on public.question_progress for delete to authenticated
  using (auth.uid() = user_id);

grant delete on public.question_progress to authenticated;
