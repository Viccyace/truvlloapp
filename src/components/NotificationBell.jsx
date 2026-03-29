import { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Receipt,
  Target,
  Sparkles,
  Info,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const styles = `
  .notif-wrap { position: relative; }

  .notif-btn {
    width: 38px; height: 38px; border-radius: 10px;
    border: 1.5px solid rgba(10,10,10,0.08);
    background: #FFFFFF; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.18s; position: relative; color: #6B6B6B;
  }
  .notif-btn:hover { border-color: rgba(10,10,10,0.2); background: #F0EDE4; color: #0A0A0A; }

  .notif-badge {
    position: absolute; top: 5px; right: 5px;
    min-width: 16px; height: 16px; border-radius: 100px;
    background: #D4A017; border: 2px solid #FFFFFF;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; font-weight: 800; color: #0A0A0A;
    padding: 0 3px;
  }

  .notif-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 360px; background: #FFFFFF;
    border-radius: 18px; border: 1.5px solid rgba(10,10,10,0.08);
    box-shadow: 0 16px 48px rgba(0,0,0,0.14);
    z-index: 200; overflow: hidden;
    animation: notifSlideDown 0.25s cubic-bezier(0.34,1.2,0.64,1);
  }
  @media(max-width:480px){
    .notif-dropdown { width: calc(100vw - 32px); right: -80px; }
  }
  @keyframes notifSlideDown {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .notif-header {
    padding: 16px 18px 12px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(10,10,10,0.06);
  }
  .notif-header-title {
    font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #0A0A0A;
  }
  .notif-header-actions { display: flex; gap: 6px; align-items: center; }
  .notif-mark-all {
    font-size: 0.75rem; font-weight: 600; color: #40916C;
    background: none; border: none; cursor: pointer; padding: 4px 8px;
    border-radius: 6px; transition: background 0.15s;
  }
  .notif-mark-all:hover { background: #D8F3DC; }

  .notif-list { max-height: 380px; overflow-y: auto; }
  .notif-list::-webkit-scrollbar { width: 4px; }
  .notif-list::-webkit-scrollbar-track { background: transparent; }
  .notif-list::-webkit-scrollbar-thumb { background: rgba(10,10,10,0.1); border-radius: 10px; }

  .notif-item {
    display: flex; gap: 12px; padding: 14px 18px;
    border-bottom: 1px solid rgba(10,10,10,0.04);
    cursor: pointer; transition: background 0.15s; position: relative;
  }
  .notif-item:hover { background: #FAF8F3; }
  .notif-item.unread { background: #F0FAF3; }
  .notif-item.unread:hover { background: #E8F5EC; }
  .notif-item:last-child { border-bottom: none; }

  .notif-icon-wrap {
    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .notif-icon-wrap.budget_alert { background: rgba(229,57,53,0.1); color: #C62828; }
  .notif-icon-wrap.daily_reminder { background: rgba(212,160,23,0.12); color: #D4A017; }
  .notif-icon-wrap.trial { background: #D8F3DC; color: #1B4332; }
  .notif-icon-wrap.milestone { background: rgba(212,160,23,0.12); color: #D4A017; }
  .notif-icon-wrap.info { background: rgba(10,10,10,0.06); color: #6B6B6B; }

  .notif-content { flex: 1; min-width: 0; }
  .notif-title {
    font-size: 0.875rem; font-weight: 700; color: #0A0A0A;
    margin-bottom: 3px; line-height: 1.3;
  }
  .notif-body {
    font-size: 0.8rem; color: #6B6B6B; line-height: 1.5;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .notif-time {
    font-size: 0.7rem; color: rgba(10,10,10,0.3); margin-top: 5px; font-weight: 500;
  }
  .notif-unread-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #40916C;
    position: absolute; top: 18px; right: 14px; flex-shrink: 0;
  }

  .notif-empty {
    padding: 40px 20px; text-align: center;
  }
  .notif-empty-icon { font-size: 2rem; margin-bottom: 10px; color: #D4A017; }
  .notif-empty-title { font-family: 'Playfair Display', serif; font-size: 0.95rem; font-weight: 700; color: #0A0A0A; margin-bottom: 6px; }
  .notif-empty-sub { font-size: 0.8rem; color: #6B6B6B; line-height: 1.5; }

  .notif-footer {
    padding: 10px 18px; border-top: 1px solid rgba(10,10,10,0.06);
    text-align: center;
  }
  .notif-footer-btn {
    font-size: 0.8rem; font-weight: 600; color: #40916C;
    background: none; border: none; cursor: pointer;
  }
`;

const TYPE_ICONS = {
  budget_alert: AlertTriangle,
  daily_reminder: Bell,
  trial: Sparkles,
  milestone: Target,
  info: Info,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load notifications
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    load();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
    }
  };

  const handleItemClick = async (n) => {
    if (!n.read) await markRead(n.id);
    if (n.action_url) window.location.href = n.action_url;
    setOpen(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="notif-wrap" ref={dropdownRef}>
        <button
          className="notif-btn"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) load();
          }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <div className="notif-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </button>

        {open && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <div className="notif-header-title">Notifications</div>
              <div className="notif-header-actions">
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    <CheckCheck
                      size={12}
                      style={{ marginRight: 4, verticalAlign: "middle" }}
                    />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="notif-list">
              {loading && notifications.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#6B6B6B",
                    fontSize: "0.85rem",
                  }}
                >
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon">
                    <Bell size={32} color="#D4A017" />
                  </div>
                  <div className="notif-empty-title">You're all caught up</div>
                  <p className="notif-empty-sub">
                    Budget alerts, spending reminders, and tips will appear
                    here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = TYPE_ICONS[n.type] || Info;
                  return (
                    <div
                      key={n.id}
                      className={`notif-item${!n.read ? " unread" : ""}`}
                      onClick={() => handleItemClick(n)}
                    >
                      <div className={`notif-icon-wrap ${n.type}`}>
                        <Icon size={16} />
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-body">{n.body}</div>
                        <div className="notif-time">
                          {timeAgo(n.created_at)}
                        </div>
                      </div>
                      {!n.read && <div className="notif-unread-dot" />}
                    </div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notif-footer">
                <button
                  className="notif-footer-btn"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

