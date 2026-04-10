export const API_BASE = import.meta.env.VITE_API_BASE;
export const WS_BASE  = import.meta.env.VITE_WS_BASE;

export const PRIORITY_LABELS = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
};

export const PRIORITY_COLORS = {
  1: "bg-gray-600 text-gray-200",
  2: "bg-blue-600 text-blue-100",
  3: "bg-amber-600 text-amber-100",
  4: "bg-red-600 text-red-100",
};

export const STATUS_COLUMNS = ["todo", "in_progress", "done"];
export const STATUS_LABELS = {
  todo:        "To Do",
  in_progress: "In Progress",
  done:        "Done",
};