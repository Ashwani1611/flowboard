import api from "./axios";

export const getTasks         = ()         => api.get("/tasks/");
export const createTask       = (data)     => api.post("/tasks/", data);
export const updateTask       = (id, data) => api.patch(`/tasks/${id}/`, data);
export const deleteTask       = (id)       => api.delete(`/tasks/${id}/`);
export const changeStatus     = (id, status) => api.patch(`/tasks/${id}/change-status/`, { status });
export const undoTask         = (id)       => api.post(`/tasks/${id}/undo/`);
export const getPriorityQueue = ()         => api.get("/tasks/priority-queue/");
export const getAnalytics     = (days = 7) => api.get(`/tasks/analytics/?days=${days}`);
export const getByDeadline    = (start, end) => api.get(`/tasks/by-deadline/?start=${start}&end=${end}`);