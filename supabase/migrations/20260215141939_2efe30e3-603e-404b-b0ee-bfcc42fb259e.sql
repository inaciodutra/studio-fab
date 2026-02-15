
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- App roles enum
CREATE TYPE public.app_role AS ENUM ('ADMIN', 'OPERADOR', 'VISUALIZADOR');

-- 1. WORKSPACES
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER_ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. MATERIALS
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONFIG
CREATE TABLE public.config (
  workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  energy_per_h DECIMAL(10,2) DEFAULT 0,
  labor_per_h DECIMAL(10,2) DEFAULT 0,
  packaging_default DECIMAL(10,2) DEFAULT 0,
  markup_material DECIMAL(5,2) DEFAULT 1.5,
  print_price_per_h DECIMAL(10,2) DEFAULT 0,
  base_fee DECIMAL(10,2) DEFAULT 0,
  min_order_price DECIMAL(10,2) DEFAULT 0,
  fortaleza_discount DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 6. CLIENTS
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT,
  city TEXT,
  neighborhood TEXT,
  channel TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Impressão 3D', 'Laser')),
  default_material_id UUID REFERENCES public.materials(id),
  default_color TEXT,
  avg_time_h DECIMAL(10,2),
  avg_weight_g DECIMAL(10,2),
  fixed_price DECIMAL(10,2),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STOCK
CREATE TABLE public.stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  qty_g DECIMAL(10,2) DEFAULT 0,
  min_g DECIMAL(10,2) DEFAULT 0,
  UNIQUE(workspace_id, material_id, color)
);

-- 9. STOCK_MOVEMENTS
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id),
  color TEXT,
  qty_delta_g DECIMAL(10,2) NOT NULL,
  reason TEXT,
  ref_type TEXT,
  ref_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUPPLIES
CREATE TABLE public.supplies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Embalagem', 'Unidade', 'Outros')),
  qty DECIMAL(10,2),
  value_total DECIMAL(10,2),
  month_ref TEXT,
  status TEXT CHECK (status IN ('Em estoque', 'Consumido')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  order_date DATE NOT NULL,
  month_ref TEXT,
  client_id UUID REFERENCES public.clients(id),
  status TEXT NOT NULL CHECK (status IN ('Orçado', 'Aprovado', 'Produzindo', 'Pronto', 'Entregue', 'Cancelado')),
  payment_method TEXT,
  delivery_method TEXT,
  city TEXT,
  discount DECIMAL(10,2) DEFAULT 0,
  freight DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  totals_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ORDER_ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  material_id UUID REFERENCES public.materials(id),
  color TEXT,
  qty INTEGER NOT NULL,
  time_h DECIMAL(10,2),
  weight_g DECIMAL(10,2),
  fixed_price DECIMAL(10,2),
  other_cost DECIMAL(10,2) DEFAULT 0,
  calculated_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_orders_workspace ON public.orders(workspace_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_date ON public.orders(order_date);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_stock_workspace ON public.stock(workspace_id);
CREATE INDEX idx_profiles_workspace ON public.profiles(workspace_id);

-- Trigger to auto-set month_ref on orders
CREATE OR REPLACE FUNCTION public.set_order_month_ref()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.month_ref := TO_CHAR(NEW.order_date, 'YYYY-MM');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_month_ref_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_month_ref();

-- SECURITY DEFINER function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Helper: get workspace_id for current user
CREATE OR REPLACE FUNCTION public.get_user_workspace_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
$$;

-- RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- WORKSPACES policies
CREATE POLICY "Users can view own workspace" ON public.workspaces FOR SELECT USING (id = public.get_user_workspace_id());

-- PROFILES policies
CREATE POLICY "Users can view profiles in workspace" ON public.profiles FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- USER_ROLES policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- Macro for workspace-scoped tables
-- MATERIALS
CREATE POLICY "View materials" ON public.materials FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert materials" ON public.materials FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Update materials" ON public.materials FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Delete materials" ON public.materials FOR DELETE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- CONFIG
CREATE POLICY "View config" ON public.config FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Update config" ON public.config FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Insert config" ON public.config FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- CLIENTS
CREATE POLICY "View clients" ON public.clients FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert clients" ON public.clients FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Update clients" ON public.clients FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Delete clients" ON public.clients FOR DELETE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- PRODUCTS
CREATE POLICY "View products" ON public.products FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert products" ON public.products FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Update products" ON public.products FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Delete products" ON public.products FOR DELETE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- STOCK
CREATE POLICY "View stock" ON public.stock FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert stock" ON public.stock FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Update stock" ON public.stock FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Delete stock" ON public.stock FOR DELETE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- STOCK_MOVEMENTS
CREATE POLICY "View stock_movements" ON public.stock_movements FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert stock_movements" ON public.stock_movements FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));

-- SUPPLIES
CREATE POLICY "View supplies" ON public.supplies FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert supplies" ON public.supplies FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Update supplies" ON public.supplies FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Delete supplies" ON public.supplies FOR DELETE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- ORDERS
CREATE POLICY "View orders" ON public.orders FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert orders" ON public.orders FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Update orders" ON public.orders FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Delete orders" ON public.orders FOR DELETE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- ORDER_ITEMS
CREATE POLICY "View order_items" ON public.order_items FOR SELECT USING (workspace_id = public.get_user_workspace_id());
CREATE POLICY "Insert order_items" ON public.order_items FOR INSERT WITH CHECK (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Update order_items" ON public.order_items FOR UPDATE USING (workspace_id = public.get_user_workspace_id() AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERADOR')));
CREATE POLICY "Delete order_items" ON public.order_items FOR DELETE USING (workspace_id = public.get_user_workspace_id() AND public.has_role(auth.uid(), 'ADMIN'));

-- TRIGGER: auto-create profile + workspace on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  INSERT INTO public.workspaces (name) VALUES (COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  RETURNING id INTO new_workspace_id;
  INSERT INTO public.profiles (id, workspace_id, name) VALUES (NEW.id, new_workspace_id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'ADMIN');
  INSERT INTO public.config (workspace_id) VALUES (new_workspace_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRIGGER: update updated_at on orders
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
