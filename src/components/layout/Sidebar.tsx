import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Settings, Users, Package, Warehouse,
  ShoppingCart, BarChart3, Printer, LogOut, X, FileUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Pedidos', icon: ShoppingCart },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/stock', label: 'Estoque', icon: Warehouse },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/import', label: 'Importar CSV', icon: FileUp },
  { to: '/config', label: 'Configurações', icon: Settings, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { isAdmin, signOut, profile } = useAuth();
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Printer className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">StudioFab</span>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden text-sidebar-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin()) return null;
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-3 text-xs text-sidebar-foreground/50 truncate">
            {profile?.name}
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
