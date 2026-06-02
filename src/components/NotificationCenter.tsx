import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Calendar, 
  AlertOctagon, 
  UserCheck, 
  CreditCard, 
  Activity, 
  X, 
  CheckCircle,
  Clock,
  Sparkles,
  Info,
  Layers,
  Heart
} from "lucide-react";

export interface SystemNotification {
  id: string;
  category: 'appointment' | 'emergency' | 'doctor' | 'registration' | 'billing' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  intensity: 'normal' | 'urgent' | 'critical';
}

interface NotificationCenterProps {
  isDarkMode: boolean;
  onClose?: () => void;
}

export default function NotificationCenter({
  isDarkMode,
  onClose
}: NotificationCenterProps) {
  
  // High fidelity default notifications representing the prompt's specified triggers
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "notif-1",
      category: "emergency",
      title: "AMBULANCE CO-ORDINATED DISPATCHED",
      description: "First-responder team heading to Science Lab Block C Room 305 with diagnostics gear.",
      timestamp: "Just Now",
      read: false,
      intensity: "critical"
    },
    {
      id: "notif-2",
      category: "appointment",
      title: "Appointment Verified: Dr. Rajesh Sharma",
      description: "Consultation booked for Maya Lin tomorrow at 09:30 AM in Cardiology Unit B.",
      timestamp: "5 mins ago",
      read: false,
      intensity: "urgent"
    },
    {
      id: "notif-3",
      category: "doctor",
      title: "Practitioner Timings Updated",
      description: "Dr. Elena Mercer extended consulting timetable slots for Dental Unit checks this Saturday.",
      timestamp: "12 mins ago",
      read: false,
      intensity: "normal"
    },
    {
      id: "notif-4",
      category: "registration",
      title: "Registered Patient Insurance Enrolled",
      description: "Campus registration database validated and sealed via encrypted health ledger keys.",
      timestamp: "32 mins ago",
      read: true,
      intensity: "normal"
    },
    {
      id: "notif-5",
      category: "billing",
      title: "Payment Settled: Inpatient Invoice #2810",
      description: "Cardiology ECG Monitor Scan (₹1500) successfully cleared via digital wallet provider.",
      timestamp: "1 hour ago",
      read: true,
      intensity: "normal"
    },
    {
      id: "notif-6",
      category: "system",
      title: "Unified Web Speech Translation Loaded",
      description: "Hindi and Kannada speech synthesis voices cached dynamically for accessibility compliance.",
      timestamp: "2 hours ago",
      read: true,
      intensity: "normal"
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, read: true };
      }
      return n;
    }));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.category === activeFilter;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'emergency': return <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'appointment': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'doctor': return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'registration': return <UserCheck className="w-4 h-4 text-indigo-500" />;
      case 'billing': return <CreditCard className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className={`p-5 rounded-3xl border w-full max-w-sm flex flex-col justify-between shadow-2xl overflow-hidden backdrop-blur-lg ${
      isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-205 text-slate-800'
    }`} id="smart-notification-center-drawer">
      
      {/* Header operations */}
      <div className="flex items-center justify-between border-b dark:border-slate-850 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-blue-500 stroke-[2.2]" />
            {notifications.some(n => !n.read) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-tight leading-none flex items-center gap-1.5">
              <span>Titan Alerts Hub</span>
              <span className="text-[9px] bg-blue-50 text-blue-700 py-0.2 px-1.5 rounded-full font-bold">Live</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Active operational notifications</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleMarkAllAsRead}
            className="text-[9px] font-bold text-blue-500 hover:underline cursor-pointer select-none"
          >
            Mark all read
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories chips filter selectors */}
      <div className="flex flex-wrap gap-1 mb-3 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'emergency', label: '🚨 SOS' },
          { key: 'appointment', label: 'Appts' },
          { key: 'billing', label: 'Bills' },
        ].map(filter => (
          <button 
            key={filter.key} 
            onClick={() => setActiveFilter(filter.key)}
            className={`py-1 px-2.5 rounded-lg font-bold text-[9px] uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === filter.key 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Notification items list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 flex-1">
        
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No active notification alerts matched.
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div 
              key={n.id}
              onClick={() => handleMarkAsRead(n.id)}
              className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 relative cursor-pointer group ${
                n.read 
                  ? 'bg-white/40 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800' 
                  : n.intensity === 'critical'
                    ? 'bg-rose-50 border-rose-220 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-955'
                    : 'bg-blue-50/50 border-blue-105 dark:bg-blue-950/10 dark:border-blue-900/20 shadow-xs'
              }`}
            >
              {/* Category Icon */}
              <div className="mt-0.5 shrink-0">
                {getIcon(n.category)}
              </div>

              {/* Text content details */}
              <div className="space-y-0.5 flex-grow text-left">
                <div className="flex items-center justify-between">
                  <h5 className={`font-bold text-[11px] leading-tight ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white font-extrabold'}`}>
                    {n.title}
                  </h5>
                  <span className="text-[8px] text-slate-400 font-mono shrink-0 ml-1">
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-medium font-sans">
                  {n.description}
                </p>
              </div>

              {/* Quick operations */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearNotification(n.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-505/10 text-slate-400 transition-opacity absolute top-2 right-2 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Unread blue circular indicator */}
              {!n.read && (
                <span className="absolute left-1.5 top-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}

            </div>
          ))
        )}

      </div>

      {/* Footer statistics */}
      <div className={`mt-3.5 border-t pt-2.5 flex items-center justify-between text-[9px] font-mono select-none ${
        isDarkMode ? 'border-slate-850 text-slate-450' : 'border-slate-100 text-slate-400'
      }`}>
        <span>Total: {notifications.length} alerts synced</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Continuous WebSockets stream</span>
        </span>
      </div>

    </div>
  );
}
