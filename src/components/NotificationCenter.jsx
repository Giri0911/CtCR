import { useState } from "react";
import { Link } from "react-router-dom";

function NotificationCenter({ notifications, label = "Notifications" }) {
  const [open, setOpen] = useState(false);
  const safeNotifications = Array.isArray(notifications) ? notifications.filter(Boolean) : [];
  const unreadCount = safeNotifications.length;

  return (
    <div className="notification-center">
      <button
        className="notification-trigger"
        type="button"
        aria-label={`${label}${unreadCount ? `, ${unreadCount} updates` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className="notification-bell">🔔</span>
        <span>{label}</span>
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {open && (
        <section className="notification-popover" aria-label={label}>
          <div className="notification-popover-heading">
            <h2>Updates</h2>
            <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)}>×</button>
          </div>
          {unreadCount === 0 ? (
            <p className="notification-empty">No notification</p>
          ) : (
            <div className="notification-list">
              {safeNotifications.map((notification) => (
                <article className={`notification-item notification-${notification.tone || "info"}`} key={notification.id || notification.title || Math.random()}>
                  <div>
                    <strong>{notification.title || "New update"}</strong>
                    <p>{notification.message || "No details available."}</p>
                  </div>
                  {notification.to && (
                    <Link to={notification.to} onClick={() => setOpen(false)}>
                      View
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default NotificationCenter;
