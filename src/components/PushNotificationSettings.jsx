import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Check, Smartphone } from "lucide-react";
import { supabase } from "../lib/supabase";

const styles = `
  .push-card {
    background: #FFFFFF; border-radius: 18px; border: 1.5px solid rgba(10,10,10,0.08);
    overflow: hidden; margin-bottom: 16px;
  }
  .push-card-header {
    padding: 20px 22px; display: flex; align-items: center; justify-content: space-between;
    gap: 14px;
  }
  .push-card-left { display: flex; align-items: center; gap: 14px; }
  .push-card-icon {
    width: 42px; height: 42px; border-radius: 12px; background: #D8F3DC;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .push-card-title { font-size: 0.95rem; font-weight: 700; color: #0A0A0A; margin-bottom: 2px; }
  .push-card-sub { font-size: 0.8rem; color: #6B6B6B; line-height: 1.4; }

  /* Toggle */
  .toggle-track {
    position: relative; width: 44px; height: 24px;
    background: rgba(10,10,10,0.12); border-radius: 100px;
    cursor: pointer; transition: background 0.2s; flex-shrink: 0;
  }
  .toggle-track.on { background: #40916C; }
  .toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #FFFFFF; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    transition: transform 0.2s; pointer-events: none;
  }
  .toggle-track.on .toggle-thumb { transform: translateX(20px); }

  /* Time picker section */
  .push-time-section {
    border-top: 1px solid rgba(10,10,10,0.06);
    padding: 16px 22px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

  .push-time-label {
    font-size: 0.82rem; font-weight: 600; color: #3A3A3A; margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .push-time-presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
  .time-preset {
    padding: 7px 14px; border-radius: 100px; border: 1.5px solid rgba(10,10,10,0.1);
    font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.18s;
    background: #FAF8F3; color: #3A3A3A;
  }
  .time-preset:hover { border-color: #40916C; color: #1B4332; }
  .time-preset.selected { background: #D8F3DC; border-color: #40916C; color: #1B4332; }

  .push-time-custom { display: flex; align-items: center; gap: 10px; }
  .push-time-input {
    padding: 9px 14px; border: 1.5px solid rgba(10,10,10,0.1); border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 600;
    color: #0A0A0A; background: #FAF8F3; outline: none; transition: border-color 0.2s;
  }
  .push-time-input:focus { border-color: #40916C; background: #FFFFFF; }
  .push-time-save {
    padding: 9px 18px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #1B4332, #40916C);
    color: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 5px;
  }
  .push-time-save:hover { transform: translateY(-1px); }
  .push-time-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .push-status {
    font-size: 0.78rem; color: #40916C; font-weight: 600;
    display: flex; align-items: center; gap: 5px; margin-top: 10px;
  }
  .push-status.error { color: #C62828; }

  /* Permission denied state */
  .push-denied {
    padding: 14px 22px; background: rgba(229,57,53,0.06);
    border-top: 1px solid rgba(229,57,53,0.12);
    font-size: 0.82rem; color: #C62828; line-height: 1.5;
  }
`;

const PRESETS = [
  { label: "7:00 AM", value: "07:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "6:00 PM", value: "18:00" },
  { label: "8:00 PM", value: "20:00" },
  { label: "9:00 PM", value: "21:00" },
];

export default function PushNotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState("default"); // default | granted | denied
  const [reminderTime, setReminderTime] = useState("20:00");
  const [customTime, setCustomTime] = useState("20:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subId, setSubId] = useState(null);

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    // Check current permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
      setEnabled(Notification.permission === "granted");
    }
    // Load saved reminder time
    loadSavedTime();
  }, []);

  const loadSavedTime = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("push_subscriptions")
        .select("id, reminder_time")
        .eq("user_id", user.id)
        .eq("active", true)
        .single();

      if (data) {
        const t = data.reminder_time?.slice(0, 5) || "20:00";
        setReminderTime(t);
        setCustomTime(t);
        setSubId(data.id);
      }
    } catch {
      // No subscription yet
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      setEnabled(true);
      await subscribeUser();
    }
  };

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        console.warn("VAPID public key not set — push notifications disabled");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const sub = subscription.toJSON();
      const { data } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: sub.endpoint,
            p256dh: sub.keys?.p256dh,
            auth_key: sub.keys?.auth,
            reminder_time: reminderTime + ":00",
            active: true,
          },
          { onConflict: "endpoint" },
        )
        .select("id")
        .single();

      if (data) setSubId(data.id);
    } catch (err) {
      console.error("Push subscribe error:", err);
    }
  };

  const toggleNotifications = async () => {
    if (!enabled) {
      if (permission === "denied") return;
      await requestPermission();
    } else {
      // Disable
      setEnabled(false);
      if (subId) {
        await supabase
          .from("push_subscriptions")
          .update({ active: false })
          .eq("id", subId);
      }
    }
  };

  const saveTime = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setReminderTime(customTime);

      if (subId) {
        await supabase
          .from("push_subscriptions")
          .update({ reminder_time: customTime + ":00" })
          .eq("id", subId);
      } else {
        // Create subscription if not exists (in-app only, no push)
        await supabase.from("push_subscriptions").upsert(
          {
            user_id: user.id,
            endpoint: `inapp-${user.id}`,
            p256dh: "inapp",
            auth_key: "inapp",
            reminder_time: customTime + ":00",
            active: true,
          },
          { onConflict: "endpoint" },
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="push-card">
        <div className="push-card-header">
          <div className="push-card-left">
            <div className="push-card-icon">
              {enabled ? (
                <Bell size={20} color="#1B4332" />
              ) : (
                <BellOff size={20} color="#6B6B6B" />
              )}
            </div>
            <div>
              <div className="push-card-title">Daily spending reminder</div>
              <p className="push-card-sub">
                Get a daily nudge to log your expenses before the day ends
              </p>
            </div>
          </div>
          <div
            className={`toggle-track${enabled ? " on" : ""}${isIOS && !isStandalone ? " disabled" : ""}`}
            style={{
              opacity: isIOS && !isStandalone ? 0.4 : 1,
              cursor: isIOS && !isStandalone ? "not-allowed" : "pointer",
            }}
            onClick={isIOS && !isStandalone ? undefined : toggleNotifications}
          >
            <div className="toggle-thumb" />
          </div>
        </div>

        {/* iOS not installed as PWA */}
        {isIOS && !isStandalone && (
          <div
            className="push-denied"
            style={{
              background: "rgba(27,67,50,0.08)",
              borderColor: "rgba(27,67,50,0.15)",
              color: "#1B4332",
            }}
          >
            📱 <strong>iPhone users:</strong> Add Truvllo to your Home Screen
            first, then open it from there to enable push notifications. iOS
            only supports notifications for installed apps.
          </div>
        )}
        {permission === "denied" && (
          <div className="push-denied">
            Notifications are blocked. Go to Settings → Safari → Truvllo →
            Notifications → Allow.
          </div>
        )}

        {enabled && permission === "granted" && (
          <div className="push-time-section">
            <div className="push-time-label">
              <Clock size={14} /> Remind me at
            </div>

            <div className="push-time-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  className={`time-preset${customTime === p.value ? " selected" : ""}`}
                  onClick={() => setCustomTime(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="push-time-custom">
              <input
                className="push-time-input"
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
              <button
                className="push-time-save"
                onClick={saveTime}
                disabled={saving}
              >
                {saved ? (
                  <>
                    <Check size={14} /> Saved
                  </>
                ) : saving ? (
                  "Saving..."
                ) : (
                  "Save time"
                )}
              </button>
            </div>

            {saved && (
              <div className="push-status">
                <Check size={13} /> Reminder set for{" "}
                {customTime === "20:00" ? "8:00 PM" : customTime} daily
              </div>
            )}
          </div>
        )}

        {/* Show time picker even without push permission for in-app reminders */}
        {!enabled && permission !== "denied" && (
          <div className="push-time-section">
            <div
              style={{
                fontSize: "0.82rem",
                color: "#6B6B6B",
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              <Smartphone
                size={13}
                style={{ marginRight: 5, verticalAlign: "middle" }}
              />
              Enable notifications above to receive daily push alerts. You can
              still set your preferred time for in-app reminders.
            </div>
            <div className="push-time-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  className={`time-preset${customTime === p.value ? " selected" : ""}`}
                  onClick={() => setCustomTime(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="push-time-custom">
              <input
                className="push-time-input"
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
              <button
                className="push-time-save"
                onClick={saveTime}
                disabled={saving}
              >
                {saved ? (
                  <>
                    <Check size={14} /> Saved
                  </>
                ) : saving ? (
                  "Saving..."
                ) : (
                  "Save time"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Helper: convert VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
