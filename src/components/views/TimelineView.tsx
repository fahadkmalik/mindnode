import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBoardStore } from '@/store/useBoardStore';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from "@/lib/utils";

export function TimelineView() {
    const { boards } = useBoardStore();

    const tasks = useMemo(() => {
        return boards.flatMap(board =>
            board.nodes
                .filter(node => node.type === 'task')
                .map(node => ({
                    ...node,
                    boardName: board.name,
                    boardId: board.id
                }))
        ).sort((a, b) => {
            if (!a.dateTime) return 1;
            if (!b.dateTime) return -1;
            return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        });
    }, [boards]);

    return (
        <div className="container mx-auto p-8 max-w-4xl min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Project Timeline</h1>
            </div>

            <div className="relative border-l border-muted ml-4 space-y-8 pb-12">
                {tasks.map((task) => {
                    const date = task.dateTime ? new Date(task.dateTime) : null;
                    const isTaskPast = date && isPast(date) && !isToday(date);

                    return (
                        <div key={task.id} className="relative pl-8">
                            <span className={cn(
                                "absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                                task.status === 'complete' ? "bg-green-500" : (isTaskPast ? "bg-red-500" : "bg-primary")
                            )} />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                <span className={cn("text-sm font-semibold", isTaskPast && task.status !== 'complete' && "text-destructive")}>
                                    {date ? format(date, 'MMMM d, yyyy') : 'No Date'}
                                </span>
                                <span className="text-xs text-muted-foreground">{task.boardName}</span>
                            </div>

                            <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    {task.status === 'complete' ?
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" /> :
                                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    }
                                    <div className="flex-1">
                                        <p className={cn("text-base", task.status === 'complete' && "line-through text-muted-foreground")}>{task.content}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <Badge variant="outline" className="capitalize">{task.status}</Badge>
                                            <Link to={`/board/${task.boardId}`}>
                                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">Open Board</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <div className="pl-8 text-muted-foreground">No tasks found across any boards.</div>
                )}
            </div>
        </div>
    );
}
