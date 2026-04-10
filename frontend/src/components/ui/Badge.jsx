import { PRIORITY_COLORS, PRIORITY_LABELS } from "../../utils/constants";

export function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    todo:        "bg-gray-700 text-gray-300",
    in_progress: "bg-brand-500/20 text-brand-500",
    done:        "bg-green-600/20 text-green-400",
  };
  const labels = { todo: "To Do", in_progress: "In Progress", done: "Done" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}