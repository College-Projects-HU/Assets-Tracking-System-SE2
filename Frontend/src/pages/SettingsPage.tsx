import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import userService from '@/services/userService';
import { useState } from 'react';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? '' });
  const [saving, setSaving] = useState(false);

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
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
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
          <Button onClick={async () => {
            if (!user) return;
            setSaving(true);
            try {
              const res = await userService.updateMyProfile({ fullName: form.name });
              login({
                ...user,
                name: res.data.name,
                email: res.data.email,
                role: res.data.role,
              });
            } catch (err) {
              console.error('Failed to update profile', err);
            } finally {
              setSaving(false);
            }
          }} disabled={!form.name || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
      </div>

      {user?.role === 'ADMIN' && (
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
      )}
    </div>
  );
}
