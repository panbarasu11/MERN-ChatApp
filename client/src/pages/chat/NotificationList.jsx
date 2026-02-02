// components/NotificationList.jsx
import { useAppStore } from "@/store";

const NotificationList = () => {
  const { notifications } = useAppStore();

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <div key={notification._id} className="notification-item">
          <p>{notification.message}</p>
          <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;