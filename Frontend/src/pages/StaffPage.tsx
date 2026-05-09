import { useState, useEffect } from "react";
import { StaffMember, UserRole } from "@/lib/mock-data";
import authService from "@/services/authService";
import userService from "@/services/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as UserRole,
    department: "",
  });
  const [pendingChanges, setPendingChanges] = useState<
    Record<number, { role?: UserRole; status?: "ACTIVE" | "INACTIVE" }>
  >({});
  const [isApplying, setIsApplying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = staff.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleCreate = async () => {
    setActionError(null);
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName || !trimmedEmail || !form.password) {
      setActionError("Name, email, and password are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setActionError("Please enter a valid email.");
      return;
    }
    if (form.password.length < 6) {
      setActionError("Password must be at least 6 characters.");
      return;
    }
    setCreating(true);
    try {
      await authService.register({
        fullName: trimmedName,
        email: trimmedEmail,
        password: form.password,
        role: form.role,
      });
      const res = await userService.getAll();
      setStaff(res.data || []);
      setDialogOpen(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        department: "",
      });
    } catch (err) {
      console.error("Create user failed", err);
      setActionError("Failed to create user. Check entered data.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    userService
      .getAll()
      .then((res) => {
        if (mounted) setStaff(res.data);
      })
      .catch((err) => {
        console.warn(
          "Failed to load staff from backend, falling back to empty list",
          err,
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleApplyChanges = async () => {
    if (!Object.keys(pendingChanges).length) return;
    if (!window.confirm("Apply all pending role/status changes? This will update or deactivate users.")) return;
    setIsApplying(true);
    setActionError(null);
    const updates = Object.entries(pendingChanges);
    for (const [idStr, changes] of updates) {
      const id = parseInt(idStr);
      try {
        if (changes.role) {
          await userService.updateRole(id, changes.role);
        }
        if (changes.status === "INACTIVE") {
          await userService.delete(id);
        } else if (changes.status === "ACTIVE") {
          await userService.activate(id);
        }
      } catch (err) {
        console.error(`Failed to update user ${id}`, err);
        setActionError(`One or more updates failed. User ID: ${id}`);
      }
    }

    try {
      const res = await userService.getAll();
      setStaff(res.data);
      setPendingChanges({});
    } catch (err) {
      console.error("Failed to refresh staff", err);
      setActionError("Changes applied, but failed to refresh users list.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            User & Staff Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage user accounts and role assignments
          </p>
        </div>
      <div className="flex items-center gap-3">
          {Object.keys(pendingChanges).length > 0 && (
            <Button
              variant="default"
              onClick={handleApplyChanges}
              disabled={isApplying}
              className="animate-fade-in bg-green-600 hover:bg-green-700 text-white"
            >
              {isApplying ? "Applying..." : "Apply Changes"}
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Create User Account
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {actionError && <p className="text-sm text-destructive">{actionError}</p>}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Create a password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm({ ...form, role: v as UserRole })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="ASSET_MANAGER">
                        Asset Manager
                      </SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="e.g. IT, Engineering"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full"
                  disabled={creating || !form.name || !form.email || !form.password}
                >
                  {creating ? "Creating..." : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {actionError && <div className="text-sm text-destructive">{actionError}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  <Select
                    value={pendingChanges[member.id]?.role || member.role}
                    onValueChange={(v) =>
                      setPendingChanges({
                        ...pendingChanges,
                        [member.id]: {
                          ...pendingChanges[member.id],
                          role: v as UserRole,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="ASSET_MANAGER">
                        Asset Manager
                      </SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.department}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.assetsCount}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      (pendingChanges[member.id]?.status || member.status) ===
                      "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {pendingChanges[member.id]?.status || member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentStatus =
                        pendingChanges[member.id]?.status || member.status;
                      const newStatus =
                        currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                      setPendingChanges({
                        ...pendingChanges,
                        [member.id]: {
                          ...pendingChanges[member.id],
                          status: newStatus,
                        },
                      });
                    }}
                  >
                    {(pendingChanges[member.id]?.status || member.status) ===
                    "ACTIVE"
                      ? "Deactivate"
                      : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
