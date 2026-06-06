import { ExportReportsPanel } from "@/components/admin/export-reports-panel";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Export reports</h1>
      <p className="mt-2 text-slate-400">
        Download platform data as CSV for accounting, operations, and compliance.
      </p>
      <div className="mt-8">
        <ExportReportsPanel />
      </div>
    </div>
  );
}
