import { useState } from "react";
import { Pencil, Trash2, RotateCcw, ChevronRight } from "lucide-react";
import { PriorityBadge } from "../ui/Badge";
import { deleteTask, changeStatus, undoTask } from "../../api/tasks";
import toast from "react-hot-toast";

const NEXT_STATUS = { todo: "in_progress", in_progress: "done", done: null };
const NEXT_LABEL  = { todo: "Start", in_progress: "Complete", done: null };

export default function TaskCard({ task, onEdit, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      onRefresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleAdvance = async () => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    setLoading(true);
    try {
      await changeStatus(task.id, next);
      onRefresh();
    } catch {
      toast.error("Status update failed");
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
    <div className="card p-3.5 group hover:border-brand-500/50 transition-all duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-100 leading-snug flex-1">
          {task.title}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded text-gray-500 hover:text-white hover:bg-surface-border transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-surface-border transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-2.5 line-clamp-2">{task.description}</p>
      )}

      {/* Priority */}
      <div className="mb-2.5">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Deadline */}
      {deadline && (
        <p className={`text-xs mb-3 ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
          {isOverdue ? "⚠ Overdue · " : "⏰ "}
          {deadline.toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {NEXT_STATUS[task.status] && (
          <button
            onClick={handleAdvance}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors disabled:opacity-50"
          >
            {NEXT_LABEL[task.status]}
            <ChevronRight size={12} />
          </button>
        )}
        <button
          onClick={handleUndo}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 ml-auto"
        >
          <RotateCcw size={11} />
          Undo
        </button>
      </div>
    </div>
  );
}