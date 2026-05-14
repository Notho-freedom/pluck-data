
CREATE TABLE public.quotas (
  plan TEXT PRIMARY KEY,
  monthly_rows BIGINT NOT NULL DEFAULT 0,
  monthly_ai_calls INTEGER NOT NULL DEFAULT 0,
  rate_limit_per_min INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quotas readable by everyone"
ON public.quotas FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.quotas (plan, monthly_rows, monthly_ai_calls, rate_limit_per_min) VALUES
  ('free', 10000, 100, 30),
  ('pro', 1000000, 5000, 120),
  ('enterprise', 100000000, 100000, 600);

-- Trigger to auto-create profile on signup (was missing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
