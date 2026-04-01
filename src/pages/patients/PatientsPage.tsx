import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "../../libs/api";
import { useAppSelector } from "../../store";

interface Note {
  text: string;
  room_name?: string;
  at?: string;
}

interface MeetingRef {
  room_name: string;
  at?: string;
}

interface PatientProfile {
  _id: string;
  display_name?: string;
  patient_personal_id: string;
  doctor_email?: string;
  notes?: Note[];
  meetings?: MeetingRef[];
  updated_at?: string;
}

function PatientsPage() {
  const userEmail = useAppSelector((s) => s.auth.createUser.user_email);
  const [rows, setRows] = useState<PatientProfile[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    apiClient
      .get("/api/patient_records/")
      .then((data: unknown) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]));
  }, []);

  const addNote = (pid: string) => {
    const text = (noteDraft[pid] || "").trim();
    if (!text) return;
    apiClient
      .post("/api/patient_records/note", { patient_personal_id: pid, text })
      .then(() => {
        setNoteDraft((d) => ({ ...d, [pid]: "" }));
        return apiClient.get("/api/patient_records/");
      })
      .then((data: unknown) => setRows(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  return (
    <motion.div
      className="flex flex-col gap-4 h-full overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <p className="font-semibold text-xl text-primary-background">Patient records</p>
        <p className="text-sm text-disabled-text mt-1">
          Longitudinal profiles for {userEmail || "your account"}. Meetings append when sessions end;
          add clinical notes anytime.
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-disabled-text">No patient profiles yet — create a room with a patient ID.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((p) => (
            <li key={p._id} className="bg-white rounded-xl p-4 border border-primary-border/10">
              <button
                type="button"
                className="w-full text-left flex justify-between items-start"
                onClick={() => setExpanded((x) => (x === p._id ? null : p._id))}
              >
                <div>
                  <p className="font-semibold text-primary-text">
                    {p.display_name || "Patient"} — {p.patient_personal_id}
                  </p>
                  <p className="text-xs text-disabled-text">
                    {p.meetings?.length || 0} session(s) linked
                  </p>
                </div>
                <span className="text-primary-background text-sm">{expanded === p._id ? "−" : "+"}</span>
              </button>
              {expanded === p._id && (
                <div className="mt-4 pt-4 border-t border-light-background space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Timeline</p>
                    <ul className="text-sm space-y-1 text-disabled-text max-h-40 overflow-y-auto">
                      {(p.meetings || []).map((m, i) => (
                        <li key={i}>
                          Room {m.room_name} — {m.at || ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <ul className="text-sm space-y-2 mb-2">
                      {(p.notes || []).map((n, i) => (
                        <li key={i} className="bg-light-background/80 rounded-lg p-2">
                          {n.text}
                          <span className="text-xs text-disabled-text block">{n.at}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-primary-border/25 px-3 py-2 text-sm"
                        placeholder="Add note…"
                        value={noteDraft[p.patient_personal_id] || ""}
                        onChange={(e) =>
                          setNoteDraft((d) => ({ ...d, [p.patient_personal_id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg bg-primary-background text-white text-sm"
                        onClick={() => addNote(p.patient_personal_id)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export default PatientsPage;
