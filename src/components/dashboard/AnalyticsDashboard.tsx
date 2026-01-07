import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useBoardStore } from "@/store/useBoardStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart as BarIcon, PieChart as PieIcon, TrendingUp } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

export function AnalyticsDashboard() {
    const { boards } = useBoardStore();
    const [selectedBoardId, setSelectedBoardId] = useState<string>("all");

    // Filter logic
    const activeBoards = useMemo(() => {
        return selectedBoardId === "all"
            ? boards
            : boards.filter(b => b.id === selectedBoardId);
    }, [boards, selectedBoardId]);

    // Data Transformation for Charts
    const boardProgressData = useMemo(() => {
        return activeBoards.map(board => {
            const tasks = board.nodes.filter(n => n.type === 'task');
            const completed = tasks.filter(n => n.status === 'complete').length;
            const inProgress = tasks.filter(n => n.status === 'in-progress').length;
            const todo = tasks.filter(n => !n.status || n.status === 'todo').length;
            return {
                name: board.name,
                Completed: completed,
                InProgress: inProgress,
                ToDo: todo
            };
        });
    }, [activeBoards]);

    const globalStatusDistribution = useMemo(() => {
        let completed = 0, inProgress = 0, todo = 0;
        activeBoards.forEach(board => {
            const tasks = board.nodes.filter(n => n.type === 'task');
            completed += tasks.filter(n => n.status === 'complete').length;
            inProgress += tasks.filter(n => n.status === 'in-progress').length;
            todo += tasks.filter(n => !n.status || n.status === 'todo').length;
        });

        return [
            { name: 'Completed', value: completed, color: '#22c55e' }, // green-500
            { name: 'In Progress', value: inProgress, color: '#3b82f6' }, // blue-500
            { name: 'To Do', value: todo, color: '#94a3b8' }, // slate-400
        ];
    }, [activeBoards]);

    const globalStats = useMemo(() => {
        const totalBoards = boards.length;
        const totalTasks = boards.reduce((acc, board) => acc + board.nodes.filter(n => n.type === 'task').length, 0);
        const totalCompleted = boards.reduce((acc, board) => acc + board.nodes.filter(n => n.type === 'task' && n.status === 'complete').length, 0);
        const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
        return { totalBoards, totalTasks, completionRate };
    }, [boards]);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Analytics Dashboard</h1>
                    </div>
                    <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Board" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Boards</SelectItem>
                            {boards.map(board => (
                                <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
                            <BarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.totalBoards}</div>
                            <p className="text-xs text-muted-foreground">Active projects</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.totalTasks}</div>
                            <p className="text-xs text-muted-foreground">Across all boards</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Global Completion Rate</CardTitle>
                            <PieIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.completionRate}%</div>
                            <p className="text-xs text-muted-foreground">Overall progress</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Task Progress by Board</CardTitle>
                            <CardDescription>Comparison of task status across filtered boards</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={boardProgressData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="ToDo" stackId="a" fill="#94a3b8" />
                                        <Bar dataKey="InProgress" stackId="a" fill="#3b82f6" />
                                        <Bar dataKey="Completed" stackId="a" fill="#22c55e" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                            <CardDescription>Overall breakdown of task statuses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={globalStatusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {globalStatusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
