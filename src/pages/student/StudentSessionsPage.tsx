import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import TradeMark from "../../components/user/TradeMark";
import apiClient from "../../libs/api";

interface UpcomingEvent {
  _id: string;
  event_name: string;
  patient_name?: string;
  start_time: string;
  end_time: string;
  description?: string;
}

/**
 * Patient/student portal: upcoming sessions from the events API,
 * scoped by the same patient password used for the video room.
 */
function StudentSessionsPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [roomName, setRoomName] = useState<string | null>(null);

  const load = () => {
    if (!password.trim()) {
      toast.error("Ange patientlösenord.");
      return;
    }
    setLoading(true);
    apiClient
      .post("/api/events/patient-upcoming", { patient_password: password })
      .then((res: unknown) => {
        const r = res as { room_name?: string; events?: UpcomingEvent[] };
        setRoomName(r.room_name ?? null);
        setEvents(r.events || []);
        if (!r.events?.length) {
          toast.success("Inga kommande sessioner hittades.");
        }
      })
      .catch(() => {
        setEvents([]);
        setRoomName(null);
        toast.error("Kunde inte hämta sessioner. Kontrollera lösenordet.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-full w-full flex items-center justify-center bg-light-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-lg border border-primary-border/25 p-8 flex flex-col gap-6"
      >
        <TradeMark className="text-center text-primary-background text-2xl font-extrabold" />
        <div>
          <h1 className="text-xl font-bold text-primary-text">Mina kommande sessioner</h1>
          <p className="text-sm text-disabled-text mt-1">
            Ange samma patientlösenord som till videorummet. Vi matchar ditt schema mot
            personnummer / namn som registrerats av vården.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Input
            name="patient_password"
            type="password"
            placeholder="Patientlösenord"
            className="border border-primary-border/25 placeholder:text-primary-placeholder bg-white/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={load} disabled={loading}>
            {loading ? "Hämtar…" : "Visa sessioner"}
          </Button>
        </div>
        {roomName && (
          <p className="text-xs text-disabled-text">
            Rum: <span className="font-mono text-primary-text">{roomName}</span>
          </p>
        )}
        <ul className="flex flex-col gap-3 max-h-80 overflow-y-auto">
          {events.map((ev) => (
            <li
              key={ev._id}
              className="rounded-lg border border-primary-border/20 p-3 text-sm"
            >
              <p className="font-semibold text-primary-text">{ev.event_name}</p>
              <p className="text-disabled-text text-xs mt-1">
                {new Date(ev.start_time).toLocaleString("sv-SE")} –{" "}
                {new Date(ev.end_time).toLocaleTimeString("sv-SE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {ev.description ? (
                <p className="text-xs text-primary-text/80 mt-2 line-clamp-3">{ev.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export default StudentSessionsPage;
