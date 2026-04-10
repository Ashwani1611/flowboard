import { useState, useEffect, useCallback } from "react";
import { getTasks } from "../../api/tasks";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import { STATUS_COLUMNS, STATUS_LABELS } from "../../utils/constants";
import { Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const COLUMN_STYLES = {
  todo:        "border-t-gray-600",
  in_progress: "border-t-brand-500",
  done:        "border-t-green-500",
};

export default function KanbanBoard() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask]  = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await getTasks();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreate = () => { setEditTask(null); setModalOpen(true); };
  const openEdit   = (task) => { setEditTask(task); setModalOpen(true); };

  const byStatus = (status) => tasks.filter((t) => t.status === status);

  if (loading) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-24 bg-surface-card rounded animate-pulse" />
        <div className="h-8 w-28 bg-surface-card rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card border-t-2 border-t-surface-border p-4">
            <div className="h-4 w-20 bg-surface-border rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="bg-surface-border rounded-xl p-3.5 space-y-2 animate-pulse">
                  <div className="h-3 w-3/4 bg-surface rounded" />
                  <div className="h-3 w-1/2 bg-surface rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Board</h1>
          <p className="text-xs text-gray-500 mt-0.5">{tasks.length} tasks total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTasks} className="btn-ghost p-2">
            <RefreshCw size={15} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} />
            New Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((status) => {
          const colTasks = byStatus(status);
          return (
            <div
              key={status}
              className={`card border-t-2 ${COLUMN_STYLES[status]} p-4`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-300">
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs bg-surface-border text-gray-400 px-2 py-0.5 rounded-full font-mono">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[120px]">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-8">No tasks</p>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onRefresh={fetchTasks}
                    />
                  ))
                )}
              </div>

              {/* Quick add button per column */}
              {status === "todo" && (
                <button
                  onClick={openCreate}
                  className="w-full mt-3 py-2 text-xs text-gray-600 hover:text-gray-400 
                             border border-dashed border-surface-border hover:border-gray-600 
                             rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Add task
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editTask}
        onSaved={fetchTasks}
      />
    </div>
  );
}