import Navbar from "../components/Navbar";
import KanbanBoard from "../components/tasks/KanbanBoard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <KanbanBoard />
      </main>
    </div>
  );
}