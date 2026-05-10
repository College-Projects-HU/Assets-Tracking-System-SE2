import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  History,
  UserPlus,
  Users,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  BarChart3,
  CheckCircle,
  Bell,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationItem } from "@/services/notificationService";

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ASSET_MANAGER", "EMPLOYEE"],
  },
  {
    path: "/assets",
    label: "Assets",
    icon: Package,
    roles: ["ADMIN", "ASSET_MANAGER", "EMPLOYEE"],
  },
  {
    path: "/assignments",
    label: "Assignments",
    icon: UserPlus,
    roles: ["ADMIN", "ASSET_MANAGER"],
  },
  {
    path: "/maintenance",
    label: "Maintenance",
    icon: Wrench,
    roles: ["ASSET_MANAGER", "EMPLOYEE"],
  },
  { path: "/history", label: "Audit Log", icon: History, roles: ["ADMIN"] },
  {
    path: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["ADMIN", "ASSET_MANAGER"],
  },
  { path: "/staff", label: "Staff", icon: Users, roles: ["ADMIN"] },
  {
    path: "/approvals",
    label: "Approvals",
    icon: CheckCircle,
    roles: ["ADMIN"],
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["ADMIN", "ASSET_MANAGER", "EMPLOYEE"],
  },
];

// ── Notification helpers ───────────────────────────────────────────────────────
type IconConfig = {
  icon: React.ComponentType<{ className?: string }>;
  cls: string;
};

const TYPE_ICON: Record<string, IconConfig> = {
  ASSET_ASSIGNED: { icon: Package, cls: "text-primary" },
  ASSET_RETURNED: { icon: Package, cls: "text-muted-foreground" },
  MAINTENANCE_CREATED: { icon: Wrench, cls: "text-warning" },
  MAINTENANCE_NEW_TICKET: { icon: AlertTriangle, cls: "text-warning" },
  MAINTENANCE_STATUS_UPDATED: { icon: RefreshCw, cls: "text-primary" },
  MAINTENANCE_NOTE_ADDED: { icon: MessageSquare, cls: "text-success" },
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── Notification row ──────────────────────────────────────────────────────────
function NotificationRow({
  n,
  onRead,
}: {
  n: NotificationItem;
  onRead: (id: number) => void;
}) {
  const cfg = TYPE_ICON[n.type] ?? { icon: Bell, cls: "text-muted-foreground" };
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => !n.read && onRead(n.id)}
      className={cn(
        "w-full text-left flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors",
        n.read ? "opacity-60" : "hover:bg-accent/30 cursor-pointer",
        !n.read && "bg-primary/5",
      )}
    >
      {/* Type icon */}
      <span className={cn("mt-0.5 shrink-0", cfg.cls)}>
        <Icon className="w-4 h-4" />
      </span>

      {/* Content */}
      <span className="flex-1 min-w-0">
        <span className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-xs font-semibold truncate",
              n.read ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {n.title}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
            {timeAgo(n.createdAt)}
          </span>
        </span>
        <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {n.body}
        </span>
      </span>

      {/* Unread dot */}
      {!n.read && (
        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}

// ── Notification panel (popover content) ──────────────────────────────────────
function NotificationPanel({
  notifications,
  unreadCount,
  onRead,
  onReadAll,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  onRead: (id: number) => void;
  onReadAll: () => void;
}) {
  return (
    <div className="flex flex-col" style={{ width: 320 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onReadAll}
            className="text-xs text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
          <Bell className="w-8 h-8 opacity-30" />
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[360px]">
          {notifications.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={onRead} />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────
export default function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();

  const filteredNav = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside
      className={cn(
        "gradient-sidebar flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-sidebar-fg tracking-tight">
            ITAMS
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-active text-primary-foreground shadow-md"
                  : "text-sidebar-fg hover:bg-sidebar-hover",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Notification bell */}
      <div className="px-2 pb-1">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-fg hover:bg-sidebar-hover transition-colors",
              )}
            >
              <Bell className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Notifications</span>}

              {/* Unread badge */}
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "absolute flex items-center justify-center rounded-full bg-destructive text-destructive-foreground font-bold leading-none",
                    collapsed
                      ? "top-1 left-5 w-4 h-4 text-[9px]"
                      : "top-2 right-3 min-w-[18px] h-[18px] px-1 text-[10px]",
                  )}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            align="end"
            sideOffset={8}
            className="p-0 rounded-xl shadow-xl border overflow-hidden"
            style={{ width: 320 }}
          >
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onRead={markRead}
              onReadAll={markAllRead}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* User info + logout + collapse toggle */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-1">
            <p className="text-sm font-medium text-sidebar-fg truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-fg/60 truncate">
              {user.role.replace("_", " ")}
            </p>
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
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
