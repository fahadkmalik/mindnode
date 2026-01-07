import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBoardStore } from '@/store/useBoardStore';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import type { AppNode } from '@/types';

interface TaskWithBoard extends AppNode {
    boardName: string;
    boardId: string;
}

export function CalendarView() {
    const { boards } = useBoardStore();

    // Aggregate all tasks with dates
    const tasksWithDates = useMemo(() => {
        return boards.flatMap(board =>
            board.nodes
                .filter(node => node.type === 'task' && node.dateTime)
                .map(node => ({
                    ...(node as AppNode),
                    boardName: board.name,
                    boardId: board.id
                }))
        ) as TaskWithBoard[];
    }, [boards]);

    const dateMap = useMemo(() => {
        const map = new Map<string, number>();
        tasksWithDates.forEach(task => {
            if (task.dateTime) {
                const key = new Date(task.dateTime).toDateString();
                map.set(key, (map.get(key) || 0) + 1);
            }
        });
        return map;
    }, [tasksWithDates]);

    return (
        <div className="container mx-auto p-8 max-w-7xl h-screen flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Project Calendar</h1>
            </div>

            <div className="flex-1 grid md:grid-cols-[1fr_300px] gap-8 overflow-hidden">
                <Card className="h-full flex flex-col">
                    <CardContent className="p-0 flex items-center justify-center flex-1">
                        <Calendar
                            mode="multiple"
                            className="rounded-md border-0 w-full h-full flex items-center justify-center pointer-events-none"
                            modifiers={{
                                hasTask: (date: Date) => dateMap.has(date.toDateString())
                            }}
                            modifiersStyles={{
                                hasTask: {
                                    fontWeight: 'bold',
                                    textDecoration: 'underline',
                                    color: 'var(--primary)'
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4 overflow-auto">
                    <h3 className="font-semibold text-lg">Upcoming Tasks</h3>
                    {tasksWithDates
                        .sort((a, b) => new Date(a.dateTime!).getTime() - new Date(b.dateTime!).getTime())
                        .map((task: TaskWithBoard) => (
                            <Card key={task.id} className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-muted-foreground">{task.boardName}</span>
                                    {task.dateTime && <span className="text-xs font-mono">{format(new Date(task.dateTime), 'MMM d')}</span>}
                                </div>
                                <p className="text-sm font-medium line-clamp-2">{task.content}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px]">{task.status}</Badge>
                                    <Link to={`/board/${task.boardId}`} className="ml-auto text-xs text-blue-500 hover:underline">View Board</Link>
                                </div>
                            </Card>
                        ))}
                    {tasksWithDates.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No tasks scheduled.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
