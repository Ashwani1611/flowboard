import { useCallback } from "react";
import toast from "react-hot-toast";
import useWebSocket from "../hooks/useWebSocket";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

const TYPE_CONFIG = {
  deadline_alert:   { icon: <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />, color: "text-amber-400", label: "DEADLINE ALERT" },
  deadline_warning: { icon: <Clock size={15} className="text-amber-400 shrink-0 mt-0.5" />,         color: "text-amber-400", label: "DEADLINE WARNING" },
  deadline_overdue: { icon: <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />,   color: "text-red-400",   label: "OVERDUE" },
  task_completed:   { icon: <CheckCircle size={15} className="text-green-400 shrink-0 mt-0.5" />,   color: "text-green-400", label: "COMPLETED" },
};

export default function NotificationListener() {
  const handleMessage = useCallback((data) => {
    // ignore initial handshake
    if (data.type === "connection_established") {
      console.log("[WS] Connected:", data.message);
      return;
    }

    const config = TYPE_CONFIG[data.type] || {
      icon:  <Clock size={15} className="text-brand-500 shrink-0 mt-0.5" />,
      color: "text-brand-500",
      label: data.type?.replace(/_/g, " ").toUpperCase() || "NOTIFICATION",
    };

    toast.custom(
      (t) => (
        <div className={`card px-4 py-3 flex items-start gap-3 shadow-lg max-w-sm w-full
                        transition-all duration-300 ${t.visible ? "opacity-100" : "opacity-0"}`}>
          {config.icon}
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{data.message}</p>
            {data.task_id && (
              <p className="text-xs text-gray-600 mt-1 font-mono">ID: {data.task_id}</p>
            )}
          </div>
        </div>
      ),
      { duration: 6000, position: "top-right" }
    );
  }, []);

  useWebSocket(handleMessage);
  return null;
}