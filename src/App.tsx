import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BoardView } from "@/components/canvas/BoardView";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

import { CalendarView } from "@/components/views/CalendarView";
import { TimelineView } from "@/components/views/TimelineView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/board/:boardId" element={<BoardView />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/timeline" element={<TimelineView />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
