-- ============================================================
-- FinanceAI PWA — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FUNCIÓN: updated_at trigger automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLA: accounts (Billeteras / Cuentas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'digital_wallet', 'investment', 'crypto', 'other')),
  balance       NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'ARS',
  color         TEXT NOT NULL DEFAULT '#6366F1',
  icon          TEXT NOT NULL DEFAULT 'wallet',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_user_active ON public.accounts(user_id, is_active);

-- ============================================================
-- TABLA: categories (Categorías — predefinidas + custom)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = categoría global
  name          TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT 'tag',
  color         TEXT NOT NULL DEFAULT '#6366F1',
  type          TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')) DEFAULT 'expense',
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- Categorías predefinidas globales (user_id = NULL)
INSERT INTO public.categories (id, user_id, name, icon, color, type, is_default) VALUES
  (gen_random_uuid(), NULL, 'Comida y bebida',   'utensils',        '#F59E0B', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Transporte',         'car',             '#3B82F6', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Entretenimiento',    'film',            '#8B5CF6', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Salud',              'heart-pulse',     '#EF4444', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Ropa y calzado',     'shirt',           '#EC4899', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Supermercado',       'shopping-cart',   '#10B981', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Servicios',          'zap',             '#F97316', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Educación',          'book-open',       '#0EA5E9', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Tecnología',         'laptop',          '#6366F1', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Hogar',              'home',            '#84CC16', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Mascotas',           'paw-print',       '#A78BFA', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Viajes',             'plane',           '#22D3EE', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Gym / Deporte',      'dumbbell',        '#F43F5E', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Impuestos / Tasas',  'receipt',         '#94A3B8', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Otros gastos',       'more-horizontal', '#6B7280', 'expense', TRUE),
  (gen_random_uuid(), NULL, 'Sueldo',             'briefcase',       '#10B981', 'income',  TRUE),
  (gen_random_uuid(), NULL, 'Freelance',          'code-2',          '#22D3EE', 'income',  TRUE),
  (gen_random_uuid(), NULL, 'Inversiones',        'trending-up',     '#84CC16', 'income',  TRUE),
  (gen_random_uuid(), NULL, 'Regalo / Bonus',     'gift',            '#F59E0B', 'income',  TRUE),
  (gen_random_uuid(), NULL, 'Otros ingresos',     'plus-circle',     '#6366F1', 'income',  TRUE);

-- ============================================================
-- TABLA: transactions (Transacciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id               UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  type                     TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount                   NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  currency                 TEXT NOT NULL DEFAULT 'ARS',
  category_id              UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description              TEXT,
  date                     DATE NOT NULL DEFAULT CURRENT_DATE,
  installment_id           UUID, -- FK se agrega después de crear installments
  transfer_to_account_id   UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  exchange_rate            NUMERIC(12,6), -- Tasa de cambio si multi-moneda
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_transactions_user_id    ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_date       ON public.transactions(date DESC);
CREATE INDEX idx_transactions_type       ON public.transactions(user_id, type);
CREATE INDEX idx_transactions_category   ON public.transactions(user_id, category_id);

-- ============================================================
-- TABLA: installments (Cuotas y Deudas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.installments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id          UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  description         TEXT NOT NULL,
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  total_amount        NUMERIC(15,2) NOT NULL CHECK (total_amount > 0),
  total_installments  INTEGER NOT NULL CHECK (total_installments >= 1),
  paid_installments   INTEGER NOT NULL DEFAULT 0,
  installment_amount  NUMERIC(15,2) NOT NULL CHECK (installment_amount > 0),
  has_interest        BOOLEAN NOT NULL DEFAULT FALSE,
  interest_rate       NUMERIC(8,4) DEFAULT 0, -- Tasa mensual %
  cft_total           NUMERIC(15,2) DEFAULT 0, -- Costo financiero total calculado
  net_amount          NUMERIC(15,2),           -- Monto neto sin interés (para sin interés)
  due_day             INTEGER CHECK (due_day BETWEEN 1 AND 31) DEFAULT 10,
  start_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  currency            TEXT NOT NULL DEFAULT 'ARS',
  notes               TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER installments_updated_at
  BEFORE UPDATE ON public.installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_installments_user_id   ON public.installments(user_id);
CREATE INDEX idx_installments_active    ON public.installments(user_id, is_active);
CREATE INDEX idx_installments_account   ON public.installments(account_id);

-- FK de transactions hacia installments (circular, se agrega aquí)
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_installment
  FOREIGN KEY (installment_id) REFERENCES public.installments(id) ON DELETE SET NULL;

-- ============================================================
-- TABLA: savings_goals (Metas de Ahorro y Wishlist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL CHECK (type IN ('goal', 'wishlist')) DEFAULT 'goal',
  description          TEXT,
  target_amount        NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount       NUMERIC(15,2) NOT NULL DEFAULT 0,
  target_date          DATE,
  monthly_contribution NUMERIC(15,2) DEFAULT 0,
  priority             INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
  icon                 TEXT DEFAULT 'target',
  color                TEXT DEFAULT '#6366F1',
  currency             TEXT NOT NULL DEFAULT 'ARS',
  image_url            TEXT,
  product_url          TEXT,  -- Para wishlist: link del producto
  is_completed         BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_savings_goals_type    ON public.savings_goals(user_id, type);

-- ============================================================
-- TABLA: ai_memories (Historial del Chat con IA)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_memories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}', -- Acción ejecutada, entidades extraídas, tool calls
  session_id  UUID,               -- Agrupar mensajes por sesión de chat
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_memories_user_id    ON public.ai_memories(user_id);
CREATE INDEX idx_ai_memories_session    ON public.ai_memories(user_id, session_id);
CREATE INDEX idx_ai_memories_created    ON public.ai_memories(user_id, created_at DESC);

-- ============================================================
-- TABLA: exchange_rates (Tipos de cambio históricos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency   TEXT NOT NULL,
  rate          NUMERIC(12,6) NOT NULL,
  source        TEXT DEFAULT 'manual', -- 'manual', 'api'
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_currency, to_currency, date)
);

-- Tipos de cambio iniciales (ARS como base)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, date) VALUES
  ('USD', 'ARS', 1000.00, CURRENT_DATE),
  ('ARS', 'USD', 0.001,   CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- ---- accounts ----
CREATE POLICY "accounts: read own"   ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts: insert own" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts: update own" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts: delete own" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- ---- categories ----
-- El usuario puede ver las categorías globales (user_id IS NULL) y las suyas propias
CREATE POLICY "categories: read"   ON public.categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "categories: insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories: update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories: delete" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- ---- transactions ----
CREATE POLICY "transactions: read own"   ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions: insert own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions: update own" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions: delete own" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- ---- installments ----
CREATE POLICY "installments: read own"   ON public.installments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "installments: insert own" ON public.installments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "installments: update own" ON public.installments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "installments: delete own" ON public.installments FOR DELETE USING (auth.uid() = user_id);

-- ---- savings_goals ----
CREATE POLICY "savings_goals: read own"   ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "savings_goals: insert own" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "savings_goals: update own" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "savings_goals: delete own" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

-- ---- ai_memories ----
CREATE POLICY "ai_memories: read own"   ON public.ai_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_memories: insert own" ON public.ai_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_memories: delete own" ON public.ai_memories FOR DELETE USING (auth.uid() = user_id);

-- ---- exchange_rates ----
-- Tabla pública para lectura, solo service role puede escribir
CREATE POLICY "exchange_rates: read all" ON public.exchange_rates FOR SELECT TO authenticated USING (TRUE);

-- ============================================================
-- FUNCIONES HELPER
-- ============================================================

-- Función: Calcular CFT de una cuota con interés
CREATE OR REPLACE FUNCTION calculate_cft(
  p_total_amount NUMERIC,
  p_installment_amount NUMERIC,
  p_total_installments INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
  total_paid NUMERIC;
BEGIN
  total_paid := p_installment_amount * p_total_installments;
  IF p_total_amount = 0 THEN RETURN 0; END IF;
  RETURN ROUND(((total_paid / p_total_amount) - 1) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vista: Resumen de cuotas activas con info de próximo pago
CREATE OR REPLACE VIEW public.installments_summary AS
SELECT
  i.*,
  (i.total_installments - i.paid_installments) AS remaining_installments,
  (i.installment_amount * (i.total_installments - i.paid_installments)) AS remaining_amount,
  ROUND(((i.paid_installments::NUMERIC / i.total_installments) * 100), 1) AS progress_percent,
  -- Fecha del próximo vencimiento
  MAKE_DATE(
    EXTRACT(YEAR FROM (i.start_date + (i.paid_installments * INTERVAL '1 month')))::INT,
    EXTRACT(MONTH FROM (i.start_date + (i.paid_installments * INTERVAL '1 month')))::INT,
    LEAST(i.due_day, 28)
  ) AS next_due_date,
  a.name AS account_name,
  c.name AS category_name
FROM public.installments i
LEFT JOIN public.accounts a ON a.id = i.account_id
LEFT JOIN public.categories c ON c.id = i.category_id
WHERE i.is_active = TRUE AND i.paid_installments < i.total_installments;

-- Vista: Balance por cuenta con totales
CREATE OR REPLACE VIEW public.accounts_with_stats AS
SELECT
  a.*,
  COALESCE(inc.total, 0) AS total_income_30d,
  COALESCE(exp.total, 0) AS total_expense_30d,
  COALESCE(inc.count, 0) AS transaction_count_30d
FROM public.accounts a
LEFT JOIN (
  SELECT account_id, SUM(amount) AS total, COUNT(*) AS count
  FROM public.transactions
  WHERE type = 'income' AND date >= CURRENT_DATE - 30
  GROUP BY account_id
) inc ON inc.account_id = a.id
LEFT JOIN (
  SELECT account_id, SUM(amount) AS total
  FROM public.transactions
  WHERE type = 'expense' AND date >= CURRENT_DATE - 30
  GROUP BY account_id
) exp ON exp.account_id = a.id;

-- ============================================================
-- FUNCIÓN: Actualizar balance de cuenta al crear transacción
-- ============================================================
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      IF NEW.transfer_to_account_id IS NOT NULL THEN
        UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.transfer_to_account_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      IF OLD.transfer_to_account_id IS NOT NULL THEN
        UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.transfer_to_account_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Revertir el efecto anterior
    IF OLD.type = 'income' THEN
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
    -- Aplicar el nuevo efecto
    IF NEW.type = 'income' THEN
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();
