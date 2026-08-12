import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

// Fallback notifications if API not implemented
const fallbackNotifications = [
  {
    id: 1,
    severity: 'critical',
    title: 'EcoBot-04 Scanner Error',
    message: 'AI scanner has stopped detecting bottles. Calibration required immediately.',
    time: '22 min ago',
    group: 'today',
    read: false,
    type: 'alert',
  },
  {
    id: 2,
    severity: 'warning',
    title: 'EcoBot-02 Bin Almost Full',
    message: 'Bin capacity at 87%. Estimated full in 8 hours.',
    time: '5 min ago',
    group: 'today',
    read: false,
    type: 'warning',
  },
  {
    id: 3,
    severity: 'warning',
    title: 'EcoBot-05 Offline',
    message: 'No internet connection detected for the past 1 hour.',
    time: '1 hr ago',
    group: 'today',
    read: false,
    type: 'wifi',
  },
  {
    id: 4,
    severity: 'info',
    title: 'Daily AI accuracy report ready',
    message: '96.8% accuracy across 1,000 scans today.',
    time: '2 hr ago',
    group: 'today',
    read: true,
    type: 'info',
  },
  {
    id: 5,
    severity: 'info',
    title: '3-Sampaguita reached weekly goal',
    message: 'Section completed 400 bottle milestone for the week.',
    time: '3 hr ago',
    group: 'today',
    read: true,
    type: 'info',
  },
];

const SvgIcon = ({ type }) => {
  if (type === 'alert') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  
  if (type === 'warning') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === 'wifi') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 4.978 4.978 0 011.414-3.536M3 3l18 18" />
      </svg>
    );
  }
  if (type === 'wrench') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

const sevStyle = {
  critical: {
    bar: 'bg-red-500',
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    label: 'Critical',
    badge: 'bg-red-100 text-red-700',
  },
  warning: {
    bar: 'bg-amber-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    label: 'Warning',
    badge: 'bg-amber-100 text-amber-700',
  },
  info: {
    bar: 'bg-emerald-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    label: 'Info',
    badge: 'bg-emerald-100 text-emerald-800',
  },
};

const filters = ['All', 'Unread', 'Critical'];

export function Notifications({ onNavigate }) {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification,
    refreshNotifications
  } = useData();

  useEffect(() => {
    refreshNotifications().catch((error) => console.error('Unable to load notifications:', error));
  }, []);
  
  // Use API notifications or fallback
  const items = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications;
    }
    return fallbackNotifications;
  }, [notifications]);
  
  const [filter, setFilter] = useState('All');
  const [selectedNotif, setSelectedNotif] = useState(null);

  const filtered = items.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Critical') return n.severity === 'critical';
    return true;
  });

  const groups = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'earlier', label: 'Earlier' },
  ];

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-emerald-200 uppercase tracking-wider">Unread</div>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </div>
        </div>

        {[
          { label: 'Critical', value: items.filter((i) => i.severity === 'critical').length, text: 'text-red-600' },
          { label: 'Warnings', value: items.filter((i) => i.severity === 'warning').length, text: 'text-amber-600' },
          { label: 'Info', value: items.filter((i) => i.severity === 'info').length, text: 'text-emerald-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.text}`}>{s.value}</div>
            <div className="mt-2 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              all-time
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="inline-flex bg-gray-50 rounded-xl p-1 gap-1 self-start">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                filter === f ? 'bg-emerald-800 text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Mark all as read
        </button>
      </div>

      {/* Notification Lists */}
      <div className="space-y-6">
        {groups.map((g) => {
          const groupItems = filtered.filter((n) => n.group === g.key);
          if (groupItems.length === 0) return null;
          return (
            <div key={g.key}>
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 px-1">
                {g.label}
              </h3>
              <div className="space-y-3">
                {groupItems.map((n) => {
                  const s = sevStyle[n.severity];
                  const nid = n.id || n.notification_id;
                  return (
                    <div
                      key={nid}
                      onClick={() => setSelectedNotif(n)}
                      className="w-full text-left relative flex gap-4 p-5 rounded-xl border border-gray-100 bg-white shadow-sm hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden"
                    >
                      <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
                      
                      <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0 ${s.iconColor}`}>
                        <SvgIcon type={n.type} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{n.title}</h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.badge}`}>
                            {s.label}
                          </span>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {n.message}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                          {n.time}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end shrink-0" onClick={(e) => e.stopPropagation()}>
                        {!n.read ? (
                          <button
                            onClick={() => markNotificationRead(nid)}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-950"
                          >
                            Mark read
                          </button>
                        ) : <div />}
                        <button
                          onClick={() => deleteNotification(nid)}
                          className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-700">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">No notifications</h3>
            <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {selectedNotif && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedNotif(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNotif(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${sevStyle[selectedNotif.severity].bg} flex items-center justify-center ${sevStyle[selectedNotif.severity].iconColor}`}>
                <SvgIcon type={selectedNotif.type} />
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sevStyle[selectedNotif.severity].badge}`}>
                  {sevStyle[selectedNotif.severity].label}
                </span>
                <div className="text-xs text-gray-400 mt-1">{selectedNotif.time}</div>
              </div>
            </div>

            <h3 className="font-bold text-xl text-gray-900 mb-2">{selectedNotif.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{selectedNotif.message}</p>

            <div className="flex flex-col gap-2">
              {(selectedNotif.title.includes('EcoBot') || selectedNotif.message.includes('machine')) && onNavigate && (
                <button
                  onClick={() => {
                    setSelectedNotif(null);
                    onNavigate('machines'); 
                  }}
                  className="w-full py-2.5 bg-emerald-800 text-white rounded-xl font-semibold text-sm hover:bg-emerald-900 transition-colors"
                >
                  View Machine Status
                </button>
              )}
              {!selectedNotif.read && (
                <button
                  onClick={() => {
                    markNotificationRead(selectedNotif.id || selectedNotif.notification_id);
                    setSelectedNotif(null);
                  }}
                  className="w-full py-2.5 bg-emerald-100 text-emerald-900 rounded-xl font-semibold text-sm hover:bg-emerald-200 transition-colors"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}