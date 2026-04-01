import { useEffect, useState, useRef } from "react";
import { twMerge } from "tailwind-merge";
import apiClient from "../../libs/api";
import { useAppSelector } from "../../store";

export interface INotification {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  created_at?: string;
}

function NotificationBell({ className }: { className?: string }) {
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<INotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    if (!isAuth) return;
    apiClient
      .get("/api/notifications/")
      .then((data: unknown) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, [isAuth]);

  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [isAuth]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    apiClient.post(`/api/notifications/${id}/read`).then(() => load());
  };

  const markAll = () => {
    apiClient.post("/api/notifications/read-all").then(() => load());
  };

  if (!isAuth) {
    return (
      <button type="button" className={twMerge("p-4 opacity-40", className)} aria-hidden>
        <img src="/Notification.svg" alt="" />
      </button>
    );
  }

  return (
    <div className={twMerge("relative", className)} ref={ref}>
      <button
        type="button"
        className="p-4 flex items-center justify-center relative"
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
        aria-label="Aviseringar"
      >
        <img src="/Notification.svg" alt="" />
        {unread > 0 && (
          <span className="absolute top-2 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-background text-white text-xs flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border border-primary-border/20 z-50">
          <div className="p-2 flex justify-between items-center border-b border-light-background">
            <span className="text-sm font-semibold">Aviseringar</span>
            {items.length > 0 && (
              <button type="button" className="text-xs text-primary-background" onClick={markAll}>
                Markera alla som lästa
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="p-4 text-sm text-disabled-text">Inga aviseringar</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li
                  key={n._id}
                  className={twMerge(
                    "p-3 border-b border-light-background text-left cursor-pointer hover:bg-light-background/80",
                    !n.read && "bg-primary-background/5"
                  )}
                  onClick={() => markRead(n._id)}
                >
                  <p className="text-sm font-medium text-primary-text">{n.title}</p>
                  {n.body ? (
                    <p className="text-xs text-disabled-text mt-0.5 line-clamp-3">{n.body}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
