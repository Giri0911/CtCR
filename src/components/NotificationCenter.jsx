 "use client";

import { useState } from "react";
import { useEffect, useRef } from "react";
import { Link } from "../next-router-compat.jsx";

function NotificationCenter({ notifications, label = "Notifications", scope = "default" }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const centerRef = useRef(null);
  const triggerRef = useRef(null);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const storagePrefix = `campusxcompany.${scope}`;
  const safeNotifications = Array.isArray(notifications) ? notifications.filter(Boolean) : [];
  const notificationIds = safeNotifications.map((notification, index) =>
    String(notification.id || `${notification.title || "update"}-${index}`)
  );
  const visibleNotifications = safeNotifications.filter((notification, index) =>
    !dismissedIds.has(notificationIds[index])
  );
  const unreadCount = visibleNotifications.filter((notification) =>
    !readIds.has(notificationIds[safeNotifications.indexOf(notification)])
  ).length;

  useEffect(() => {
    const restorePreferences = () => {
      try {
        const savedReadIds = JSON.parse(localStorage.getItem(`${storagePrefix}.readNotifications`) || "[]");
        const savedDismissedIds = JSON.parse(localStorage.getItem(`${storagePrefix}.dismissedNotifications`) || "[]");
        setReadIds(new Set(Array.isArray(savedReadIds) ? savedReadIds : []));
        setDismissedIds(new Set(Array.isArray(savedDismissedIds) ? savedDismissedIds : []));
      } catch (error) {
        console.error("Unable to restore notification preferences.", error);
      }
    };
    const restoreTimer = window.setTimeout(restorePreferences, 0);
    return () => window.clearTimeout(restoreTimer);
  }, [storagePrefix]);

  useEffect(() => {
    if (!open) return undefined;

    const updatePopoverPosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      if (!trigger) return;

      const viewportWidth = document.documentElement.clientWidth;
      const width = Math.min(390, viewportWidth - 24);
      const right = Math.max(12, viewportWidth - trigger.right);
      setPopoverPosition({
        top: trigger.bottom + 12,
        right: Math.min(right, viewportWidth - width - 12),
        width
      });
    };
    const handlePointerDown = (event) => {
      if (!centerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    const positionFrame = window.requestAnimationFrame(updatePopoverPosition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
      window.cancelAnimationFrame(positionFrame);
    };
  }, [open]);

  const persistIds = (key, ids) => {
    try {
      localStorage.setItem(key, JSON.stringify([...ids]));
    } catch (error) {
      console.error("Unable to save notification preferences.", error);
    }
  };

  const markAllRead = () => {
    const nextReadIds = new Set(readIds);
    visibleNotifications.forEach((notification) => {
      nextReadIds.add(notificationIds[safeNotifications.indexOf(notification)]);
    });
    setReadIds(nextReadIds);
    persistIds(`${storagePrefix}.readNotifications`, nextReadIds);
  };

  const dismissNotification = (id) => {
    const nextDismissedIds = new Set(dismissedIds);
    nextDismissedIds.add(id);
    setDismissedIds(nextDismissedIds);
    persistIds(`${storagePrefix}.dismissedNotifications`, nextDismissedIds);
  };

  const markRead = (id) => {
    const nextReadIds = new Set(readIds);
    nextReadIds.add(id);
    setReadIds(nextReadIds);
    persistIds(`${storagePrefix}.readNotifications`, nextReadIds);
  };

  const restoreDismissed = () => {
    setDismissedIds(new Set());
    persistIds(`${storagePrefix}.dismissedNotifications`, new Set());
  };

  return (
    <div className="notification-center" ref={centerRef}>
      <button
        className="notification-trigger"
        ref={triggerRef}
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
        <section
          className="notification-popover"
          aria-label={label}
          style={popoverPosition || undefined}
        >
          <div className="notification-popover-heading">
            <div>
              <h2>Notifications</h2>
              <span>{unreadCount ? `${unreadCount} unread` : "All caught up"}</span>
            </div>
            <div className="notification-heading-actions">
              {unreadCount > 0 && (
                <button type="button" className="notification-mark-read" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              <button type="button" className="notification-close" aria-label="Close notifications" onClick={() => setOpen(false)}>×</button>
            </div>
          </div>
          {visibleNotifications.length === 0 ? (
            <div className="notification-empty">
              <span className="notification-empty-icon" aria-hidden="true">✓</span>
              <strong>You’re all caught up</strong>
              <p>New updates will appear here.</p>
              {safeNotifications.length > 0 && dismissedIds.size > 0 && (
                <button type="button" className="notification-restore" onClick={restoreDismissed}>
                  Restore dismissed updates
                </button>
              )}
            </div>
          ) : (
            <div className="notification-list">
              {visibleNotifications.map((notification) => {
                const id = String(notification.id || `${notification.title || "update"}-${safeNotifications.indexOf(notification)}`);
                const isRead = readIds.has(id);
                return (
                <article
                  className={`notification-item notification-${notification.tone || "info"}${isRead ? " is-read" : ""}`}
                  key={id}
                >
                  <span className="notification-status-dot" aria-hidden="true" />
                  <div className="notification-item-content">
                    <strong>{notification.title || "New update"}</strong>
                    <p>{notification.message || "No details available."}</p>
                  </div>
                  <div className="notification-item-actions">
                    {notification.to && (
                      <Link to={notification.to} onClick={() => { markRead(id); setOpen(false); }}>
                        View
                      </Link>
                    )}
                    <button type="button" aria-label={`Dismiss ${notification.title || "notification"}`} onClick={() => dismissNotification(id)}>
                      ×
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default NotificationCenter;
