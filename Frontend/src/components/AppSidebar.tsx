import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, History, UserPlus, Users, LogOut, Settings, ChevronLeft, ChevronRight, Wrench, BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'] },
  { path: '/assets', label: 'Assets', icon: Package, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'] },
  { path: '/assignments', label: 'Assignments', icon: UserPlus, roles: ['ADMIN', 'ASSET_MANAGER'] },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'] },
  { path: '/history', label: 'Audit Log', icon: History, roles: ['ADMIN', 'ASSET_MANAGER'] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'ASSET_MANAGER'] },
  { path: '/staff', label: 'Staff', icon: Users, roles: ['ADMIN'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
];

export default function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className={cn(
      "gradient-sidebar flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-sidebar-border",
      collapsed ? "w-[68px]" : "w-[240px]"
    )}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-display font-bold text-lg text-sidebar-fg tracking-tight">ITAMS</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNav.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-active text-primary-foreground shadow-md"
                  : "text-sidebar-fg hover:bg-sidebar-hover"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-1">
            <p className="text-sm font-medium text-sidebar-fg truncate">{user.name}</p>
            <p className="text-xs text-sidebar-fg/60 truncate">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-fg hover:bg-sidebar-hover transition-colors flex-1"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-sidebar-fg hover:bg-sidebar-hover transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
