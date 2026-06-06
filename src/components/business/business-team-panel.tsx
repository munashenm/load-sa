"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";

type Member = {
  id: string;
  role: string;
  status: string;
  invitedEmail: string | null;
  user: { fullName: string; email: string } | null;
};

export function BusinessTeamPanel({
  businessId,
  canManage,
}: {
  businessId: string;
  canManage: boolean;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/business/${businessId}/members`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members);
    }
  }

  useEffect(() => {
    load();
  }, [businessId]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/business/${businessId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Invite failed");
      return;
    }
    setEmail("");
    load();
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/business/${businessId}/members/${memberId}`, {
      method: "DELETE",
    });
    load();
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-white">
                {m.user?.fullName ?? m.invitedEmail ?? "Pending invite"}
              </p>
              <p className="text-sm text-slate-500">
                {m.user?.email ?? m.invitedEmail} · {m.role}
                {m.status === "INVITED" && " · Invited"}
              </p>
            </div>
            {canManage && m.role !== "OWNER" && (
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-red-400"
                onClick={() => removeMember(m.id)}
              >
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <form onSubmit={invite} className="rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="font-semibold text-white">Invite team member</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="colleague@company.co.za"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="MEMBER">Member — book deliveries</option>
                <option value="ADMIN">Admin — manage team & settings</option>
              </Select>
            </div>
          </div>
          {error && <FieldError message={error} />}
          <Button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send invite"}
          </Button>
        </form>
      )}
    </div>
  );
}
