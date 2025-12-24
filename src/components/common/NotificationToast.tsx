import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import type { NotificationType } from '../../types';

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="text-green-500" size={22} />,
  error: <AlertCircle className="text-red-500" size={22} />,
  warning: <AlertTriangle className="text-yellow-500" size={22} />,
  info: <Info className="text-blue-500" size={22} />,
};

const bgColorMap: Record<NotificationType, string> = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div
      className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColorMap[notification.type]}`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              {iconMap[notification.type]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-earth-800">{notification.title}</h4>
              <p className="text-sm text-earth-600 mt-0.5">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 text-earth-400 hover:text-earth-600 hover:bg-white/50 rounded-lg transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;

