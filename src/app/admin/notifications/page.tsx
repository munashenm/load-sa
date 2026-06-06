import { db } from "@/lib/db";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { getMessagingConfig, isMessagingActive } from "@/lib/messaging";
import { isPaystackConfigured } from "@/lib/paystack";

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

export default async function AdminNotificationsPage() {
  const messaging = getMessagingConfig();
  const messagingActive = isMessagingActive();
  const cloudinaryOk = isCloudinaryConfigured();
  const paystackOk = isPaystackConfigured();

  const notifications = await db.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { fullName: true, role: true } },
      booking: { select: { reference: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Notifications</h1>
      <p className="mt-2 text-slate-400">
        Delivery status alerts sent to customers (in-app and via SMS/WhatsApp when
        configured).
      </p>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-white">Messaging (Twilio)</h2>
          <StatusBadge
            ok={messagingActive}
            label={messagingActive ? "Active" : "Inactive"}
          />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-slate-500">Twilio credentials</dt>
            <dd className="mt-1">
              <StatusBadge
                ok={messaging.twilioConfigured}
                label={messaging.twilioConfigured ? "Configured" : "Missing"}
              />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">SMS</dt>
            <dd className="mt-1">
              <StatusBadge
                ok={messaging.smsEnabled && Boolean(messaging.smsFrom)}
                label={
                  messaging.smsEnabled
                    ? messaging.smsFrom
                      ? "Enabled"
                      : "No sender number"
                    : "Disabled"
                }
              />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">WhatsApp</dt>
            <dd className="mt-1">
              <StatusBadge
                ok={messaging.whatsappEnabled && Boolean(messaging.whatsappFrom)}
                label={
                  messaging.whatsappEnabled
                    ? messaging.whatsappFrom
                      ? "Enabled"
                      : "No sender"
                    : "Disabled"
                }
              />
            </dd>
          </div>
        </dl>
        {!messagingActive && (
          <p className="mt-4 text-xs text-slate-500">
            Set Twilio env vars and enable SMS_ENABLED / WHATSAPP_ENABLED. See
            INTEGRATIONS.md.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-white">Photo uploads (Cloudinary)</h2>
          <StatusBadge ok={cloudinaryOk} label={cloudinaryOk ? "Configured" : "Missing"} />
        </div>
        {!cloudinaryOk && (
          <p className="mt-4 text-xs text-slate-500">
            Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in
            Railway → Variables, then redeploy. Get credentials from{" "}
            <a
              href="https://cloudinary.com"
              className="text-amber-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              cloudinary.com
            </a>
            .
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-white">Payments (Paystack)</h2>
          <StatusBadge ok={paystackOk} label={paystackOk ? "Configured" : "Missing"} />
        </div>
        {!paystackOk && (
          <p className="mt-4 text-xs text-slate-500">
            Add PAYSTACK_SECRET_KEY and NEXT_PUBLIC_APP_URL in Railway → Variables.
            Set webhook URL to{" "}
            <code className="text-amber-400">/api/paystack/webhook</code>. See
            INTEGRATIONS.md.
          </p>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Read</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-t border-slate-800/80">
                <td className="px-4 py-3 text-slate-300">
                  {n.user.fullName} ({n.user.role})
                </td>
                <td className="px-4 py-3 font-mono text-amber-400">
                  {n.booking?.reference ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">{n.type}</td>
                <td className="px-4 py-3 text-white">{n.title}</td>
                <td className="px-4 py-3">{n.read ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(n.createdAt).toLocaleString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notifications.length === 0 && (
          <p className="py-12 text-center text-slate-500">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
