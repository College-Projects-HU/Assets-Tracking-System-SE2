import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and system settings</p>
      </div>

      <div className="bg-card rounded-xl border shadow-card p-6 space-y-6">
        <h2 className="font-display font-semibold">Profile</h2>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input defaultValue={user?.name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input defaultValue={user?.role} disabled />
          </div>
        </div>
        <Button>Save Changes</Button>
      </div>

      <div className="bg-card rounded-xl border shadow-card p-6 space-y-4">
        <h2 className="font-display font-semibold">API Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure the Spring Boot backend API endpoint.
        </p>
        <div className="space-y-2">
          <Label>API Base URL</Label>
          <Input defaultValue="http://localhost:8080/api" />
        </div>
        <Button variant="secondary">Update</Button>
      </div>
    </div>
  );
}
