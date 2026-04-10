import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getPriorityQueue, undoTask, changeStatus } from "../api/tasks";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import toast from "react-hot-toast";
import { RotateCcw, ChevronRight, RefreshCw, Zap } from "lucide-react";

const NEXT_STATUS = { todo: "in_progress", in_progress: "done", done: null };
const NEXT_LABEL  = { todo: "Start", in_progress: "Complete", done: null };

function PriorityRow({ task, rank, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleAdvance = async () => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    setLoading(true);
    try {
      await changeStatus(task.id, next);
      toast.success("Status updated");
      onRefresh();
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      await undoTask(task.id);
      toast.success("Undo successful");
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || "Nothing to undo");
    } finally {
      setLoading(false);
    }
  };

  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && deadline < new Date() && task.status !== "done";

  return (
    <div className="card px-4 py-3.5 flex items-center gap-4 hover:border-brand-500/40 transition-all">
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        <span className={`text-sm font-bold font-mono ${
          rank === 1 ? "text-amber-400" :
          rank === 2 ? "text-gray-400" :
          rank === 3 ? "text-orange-600" :
          "text-gray-600"
        }`}>
          #{rank}
        </span>
      </div>

      {/* Score bar */}
      <div className="w-1 h-10 rounded-full bg-surface-border shrink-0 overflow-hidden">
        <div
          className="w-full bg-brand-500 rounded-full transition-all"
          style={{ height: `${Math.min((task.priority_score / 100) * 100, 100)}%` }}
        />
      </div>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {deadline && (
            <span className={`text-xs ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
              {isOverdue ? "⚠ Overdue" : `⏰ ${deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500 mb-0.5">Score</p>
        <p className="text-sm font-bold font-mono text-brand-500">
          {typeof task.priority_score === "number"
            ? task.priority_score.toFixed(1)
            : task.priority_score}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {NEXT_STATUS[task.status] && (
          <button
            onClick={handleAdvance}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 
                       font-medium px-2 py-1.5 rounded-md hover:bg-brand-500/10 transition-colors disabled:opacity-50"
          >
            {NEXT_LABEL[task.status]}
            <ChevronRight size={12} />
          </button>
        )}
        <button
          onClick={handleUndo}
          disabled={loading}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 
                     hover:bg-surface-border transition-colors disabled:opacity-50"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}

export default function PriorityQueuePage() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = () => {
    setLoading(true);
    getPriorityQueue()
      .then(({ data }) => setTasks(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => toast.error("Failed to load priority queue"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

  const pending = tasks.filter((t) => t.status !== "done");
  const done    = tasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-brand-500" />
              <h1 className="text-lg font-semibold">Priority Queue</h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Min-Heap sorted by priority score
            </p>
          </div>
          <button onClick={fetchQueue} className="btn-ghost p-2">
            <RefreshCw size={15} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500 text-sm">No tasks yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending tasks */}
            {pending.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Pending — {pending.length} tasks
                </p>
                <div className="space-y-2">
                  {pending.map((task, i) => (
                    <PriorityRow
                      key={task.id}
                      task={task}
                      rank={i + 1}
                      onRefresh={fetchQueue}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed tasks */}
            {done.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Completed — {done.length} tasks
                </p>
                <div className="space-y-2 opacity-50">
                  {done.map((task, i) => (
                    <PriorityRow
                      key={task.id}
                      task={task}
                      rank={pending.length + i + 1}
                      onRefresh={fetchQueue}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}