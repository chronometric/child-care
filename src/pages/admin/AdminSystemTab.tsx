import { useEffect, useState } from "react";
import apiClient from "../../libs/api";

interface Overview {
  users_count: number;
  rooms_count: number;
  events_count: number;
  patient_profiles_count: number;
  meeting_reports_count: number;
  notifications_count: number;
}

function AdminSystemTab() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    apiClient
      .get("/api/admins/system-overview")
      .then((res: unknown) => setData(res as Overview))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="p-8 bg-white rounded-lg">
        <p className="text-disabled-text">Loading system overview…</p>
      </div>
    );
  }

  const cards = [
    { label: "Users", value: data.users_count },
    { label: "Rooms", value: data.rooms_count },
    { label: "Calendar events", value: data.events_count },
    { label: "Patient profiles", value: data.patient_profiles_count },
    { label: "AI reports", value: data.meeting_reports_count },
    { label: "Notifications (all)", value: data.notifications_count },
  ];

  return (
    <div className="grow flex flex-col gap-y-4">
      <p className="font-semibold text-xl leading-6">System dashboard</p>
      <p className="text-sm text-disabled-text">
        High-level database counts for operations and auditing. MongoDB collections drive these totals.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="py-6 px-4 flex flex-col items-center gap-2 bg-white rounded-lg border border-primary-border/10"
          >
            <p className="text-sm text-disabled-text">{c.label}</p>
            <p className="font-bold text-2xl text-primary-background">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminSystemTab;
