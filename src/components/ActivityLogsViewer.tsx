import { useState, useEffect } from 'react';
import { getUserActivityLogs } from '../utills/activityLogger';
import { Shield, Clock, User, Activity as ActivityIcon } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: any;
  ip_address: string;
  created_at: string;
}

export default function ActivityLogsViewer() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getUserActivityLogs(50);
    setLogs(data);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    if (action.includes('SUCCESS')) return 'text-green-600 bg-green-100';
    if (action.includes('FAILED') || action.includes('ATTEMPT')) return 'text-red-600 bg-red-100';
    if (action.includes('LOCKED')) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return <User className="w-4 h-4" />;
    if (action.includes('INJECTION') || action.includes('XSS')) return <Shield className="w-4 h-4" />;
    return <ActivityIcon className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          Activity Logs
        </h2>
        <button
          onClick={fetchLogs}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activity logs found
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.split('_')[log.action.split('_').length - 1]}
                      </span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {log.details.email && (
                          <span className="block">Email: {log.details.email}</span>
                        )}
                        {log.details.reason && (
                          <span className="block">Reason: {log.details.reason}</span>
                        )}
                        {log.details.symbol && (
                          <span className="block">Symbol: {log.details.symbol}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {formatDate(log.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Showing last {logs.length} activities
      </div>
    </div>
  );
}