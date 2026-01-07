import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useBoardStore } from '@/store/useBoardStore';

interface AnalyticsPanelProps {
    boardId: string;
}

export function AnalyticsPanel({ boardId }: AnalyticsPanelProps) {
    const { boards } = useBoardStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const board = boards.find(b => b.id === boardId);

    const stats = useMemo(() => {
        if (!board) return { total: 0, completed: 0, inProgress: 0, todo: 0, progress: 0 };

        const tasks = board.nodes.filter(n => n.type === 'task');
        const total = tasks.length;
        const completed = tasks.filter(n => n.status === 'complete').length;
        const inProgress = tasks.filter(n => n.status === 'in-progress').length;
        const todo = tasks.filter(n => !n.status || n.status === 'todo').length;

        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, inProgress, todo, progress };
    }, [board]);

    if (!board) return null;

    return (
        <Card className="absolute top-16 right-4 w-64 shadow-lg bg-background/95 backdrop-blur z-10 transition-all duration-300">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
                <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
            </CardHeader>
            {!isCollapsed && (
                <CardContent className="p-4 pt-2 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completion</span>
                            <span className="font-bold">{stats.progress}%</span>
                        </div>
                        <Progress value={stats.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-muted p-2 rounded">
                            <div className="font-bold">{stats.todo}</div>
                            <div className="text-muted-foreground">To Do</div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                            <div className="font-bold text-blue-600">{stats.inProgress}</div>
                            <div className="text-muted-foreground">Doing</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                            <div className="font-bold text-green-600">{stats.completed}</div>
                            <div className="text-muted-foreground">Done</div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
