import { useEffect, useState } from "react";

import apiClient from "../../libs/api";

type AuditRow = {
  _id: string;
  action: string;
  actor_email?: string;
  actor_id?: string;
  resource_type?: string;
  resource_id?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
};

function AdminGovernanceTab() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("api/admins/governance-audit?limit=200")
      .then((data: unknown) => {
        setRows(Array.isArray(data) ? (data as AuditRow[]) : []);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grow flex flex-col gap-y-3 bg-white rounded-lg p-6 overflow-hidden">
      <div>
        <p className="font-semibold text-xl leading-6">Governance &amp; audit</p>
        <p className="text-sm text-disabled-text mt-1 max-w-2xl">
          Append-only log för AI/dokumentationshändelser (t.ex. lagrat transkript, genererad rapport).
          Används för spårbarhet och &quot;database management&quot;-berättelsen.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-disabled-text">Laddar…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-disabled-text">Inga poster ännu.</p>
      ) : (
        <div className="overflow-auto max-h-[min(70vh,560px)] border border-primary-border/15 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-light-background sticky top-0">
              <tr>
                <th className="text-left p-2 font-semibold">Tid (UTC)</th>
                <th className="text-left p-2 font-semibold">Händelse</th>
                <th className="text-left p-2 font-semibold">Konto</th>
                <th className="text-left p-2 font-semibold">Resurs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-primary-border/10">
                  <td className="p-2 align-top whitespace-nowrap text-xs text-disabled-text">
                    {r.created_at ? r.created_at.replace("T", " ").slice(0, 19) : "—"}
                  </td>
                  <td className="p-2 align-top font-mono text-xs">{r.action}</td>
                  <td className="p-2 align-top text-xs">{r.actor_email || r.actor_id || "—"}</td>
                  <td className="p-2 align-top text-xs">
                    {r.resource_type || "—"}
                    {r.resource_id ? (
                      <span className="block font-mono text-[11px] text-disabled-text mt-0.5">
                        {r.resource_id}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminGovernanceTab;
