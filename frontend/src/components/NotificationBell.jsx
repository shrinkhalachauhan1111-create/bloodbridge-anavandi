import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Droplet,
  X,
} from "lucide-react";

import api from "../api/api";


function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  // ============================================================
  // LOAD NOTIFICATIONS
  // ============================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      setNotifications(
        response.data?.notifications || []
      );
    } catch (error) {
      console.error(
        "Notification error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadNotifications();
  }, []);


  // ============================================================
  // UNREAD COUNT
  // ============================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;


  // ============================================================
  // MARK ONE AS READ
  // ============================================================

  const markAsRead = async (
    notificationId
  ) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error
      );
    }
  };


  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Unable to mark notifications as read:",
        error
      );
    }
  };


  return (
    <div style={wrapperStyle}>

      {/* BELL */}

      <button
        onClick={() => {
          setOpen(!open);

          if (!open) {
            loadNotifications();
          }
        }}
        style={bellButtonStyle}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span style={badgeStyle}>
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>


      {/* DROPDOWN */}

      {open && (
        <div style={dropdownStyle}>

          {/* HEADER */}

          <div style={headerStyle}>

            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: "16px",
                }}
              >
                Notifications
              </strong>

              <span
                style={{
                  color: "#777",
                  fontSize: "11px",
                }}
              >
                {unreadCount} unread
              </span>
            </div>


            <button
              onClick={() =>
                setOpen(false)
              }
              style={iconButtonStyle}
            >
              <X size={18} />
            </button>

          </div>


          {/* MARK ALL */}

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={markAllStyle}
            >
              <CheckCheck size={15} />

              Mark all as read
            </button>
          )}


          {/* LOADING */}

          {loading && (
            <div style={emptyStyle}>
              Loading notifications...
            </div>
          )}


          {/* EMPTY */}

          {!loading &&
            notifications.length === 0 && (
              <div style={emptyStyle}>
                <Bell
                  size={28}
                  color="#b91c1c"
                />

                <strong>
                  No notifications
                </strong>

                <span>
                  New BloodBridge alerts
                  will appear here.
                </span>
              </div>
            )}


          {/* NOTIFICATION LIST */}

          {!loading &&
            notifications.map(
              (notification) => (
                <button
                  key={notification.id}
                  onClick={() =>
                    markAsRead(
                      notification.id
                    )
                  }
                  style={{
                    ...notificationStyle,

                    background:
                      notification.is_read
                        ? "white"
                        : "#fff7f7",
                  }}
                >
                  <div style={notificationIconStyle}>
                    <Droplet
                      size={17}
                      fill="currentColor"
                    />
                  </div>


                  <div style={notificationTextStyle}>

                    <strong>
                      {notification.title}
                    </strong>

                    <span>
                      {notification.message}
                    </span>

                    <small>
                      {notification.is_read
                        ? "Read"
                        : "New"}
                    </small>

                  </div>


                  {!notification.is_read && (
                    <div style={unreadDotStyle} />
                  )}

                </button>
              )
            )}

        </div>
      )}

    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const wrapperStyle = {
  position: "relative",
};


const bellButtonStyle = {
  position: "relative",

  width: "42px",
  height: "42px",

  borderRadius: "10px",

  border: "1px solid #e5e7eb",

  background: "white",

  color: "#444",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  cursor: "pointer",
};


const badgeStyle = {
  position: "absolute",

  top: "-5px",
  right: "-5px",

  minWidth: "19px",
  height: "19px",

  padding: "0 5px",

  borderRadius: "20px",

  background: "#dc2626",

  color: "white",

  border: "2px solid white",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  fontSize: "9px",
  fontWeight: "800",
};


const dropdownStyle = {
  position: "absolute",

  top: "50px",
  right: 0,

  width: "355px",
  maxHeight: "430px",

  overflowY: "auto",

  zIndex: 500,

  borderRadius: "15px",

  background: "white",

  border: "1px solid #e5e7eb",

  boxShadow:
    "0 20px 50px rgba(0,0,0,.15)",
};


const headerStyle = {
  padding: "17px",

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  borderBottom: "1px solid #eee",
};


const iconButtonStyle = {
  border: "none",

  background: "transparent",

  color: "#777",

  cursor: "pointer",
};


const markAllStyle = {
  width: "100%",

  padding: "10px 17px",

  border: "none",

  borderBottom: "1px solid #eee",

  background: "#fafafa",

  color: "#b91c1c",

  display: "flex",

  alignItems: "center",

  gap: "6px",

  fontSize: "11px",

  fontWeight: "700",

  cursor: "pointer",
};


const notificationStyle = {
  position: "relative",

  width: "100%",

  padding: "15px 17px",

  border: "none",

  borderBottom: "1px solid #f1f1f1",

  textAlign: "left",

  display: "flex",

  gap: "11px",

  cursor: "pointer",
};


const notificationIconStyle = {
  width: "36px",
  height: "36px",

  flexShrink: 0,

  borderRadius: "10px",

  background: "#fee2e2",

  color: "#b91c1c",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",
};


const notificationTextStyle = {
  paddingRight: "12px",

  display: "flex",

  flexDirection: "column",

  gap: "4px",
};


const notificationTextStyleStrong = {
  fontSize: "12px",
};


const emptyStyle = {
  minHeight: "130px",

  padding: "25px",

  color: "#777",

  display: "flex",

  flexDirection: "column",

  alignItems: "center",

  justifyContent: "center",

  gap: "7px",

  fontSize: "11px",

  textAlign: "center",
};


const unreadDotStyle = {
  position: "absolute",

  right: "13px",
  top: "19px",

  width: "7px",
  height: "7px",

  borderRadius: "50%",

  background: "#dc2626",
};


export default NotificationBell;