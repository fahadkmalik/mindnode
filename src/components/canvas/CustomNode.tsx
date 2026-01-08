import { memo, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AppNode, NodeStatus } from '@/types';

type CustomNodeProps = NodeProps & {
    data: AppNode;
};

const CustomNode = ({ id, data, selected }: CustomNodeProps) => {
    const { setNodes, deleteElements } = useReactFlow(); // Added deleteElements
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(data.content);
    const isTask = data.type === 'task';

    // Sync content if data changes externally
    useEffect(() => {
        setContent(data.content);
    }, [data.content]);

    const updateNodeData = (updates: Partial<AppNode>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...updates,
                        },
                    };
                }
                return node;
            })
        );
    };

    const handleBlur = () => {
        setIsEditing(false);
        updateNodeData({ content });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            updateNodeData({ dateTime: date });
        }
    };

    const handleStatusChange = (status: NodeStatus) => {
        updateNodeData({ status });
    };

    const handleDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    const statusColors = {
        'todo': 'text-muted-foreground',
        'in-progress': 'text-blue-500',
        'complete': 'text-green-500'
    };

    return (
        <div className={cn(
            "relative group",
            selected && "ring-2 ring-primary ring-offset-2 rounded-lg",
            data.type === 'detailed' ? "h-full w-full" : ""
        )}>
            {data.type === 'detailed' && (
                <NodeResizer
                    color="#000"
                    isVisible={selected}
                    minWidth={300}
                    minHeight={200}
                    handleStyle={{ width: 10, height: 10, borderRadius: 5 }}
                />
            )}

            {/* 4-Directional Handles - Positioned slightly outside */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                className="w-4 h-4 -top-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-top-3 transition-all duration-200"
            />
            <Handle
                type="source"
                position={Position.Top}
                id="top-source"
                className="w-4 h-4 -top-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-top-3 transition-all duration-200"
            />

            <Handle
                type="target"
                position={Position.Right}
                id="right"
                className="w-4 h-4 -right-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-right-3 transition-all duration-200"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right-source"
                className="w-4 h-4 -right-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-right-3 transition-all duration-200"
            />

            <Handle
                type="target"
                position={Position.Bottom}
                id="bottom"
                className="w-4 h-4 -bottom-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-bottom-3 transition-all duration-200"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom-source"
                className="w-4 h-4 -bottom-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-bottom-3 transition-all duration-200"
            />

            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="w-4 h-4 -left-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-left-3 transition-all duration-200"
            />
            <Handle
                type="source"
                position={Position.Left}
                id="left-source"
                className="w-4 h-4 -left-2 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:w-6 hover:h-6 hover:-left-3 transition-all duration-200"
            />

            <Card
                className={cn(
                    "shadow-sm hover:shadow-md transition-shadow",
                    data.type === 'detailed' ? "w-full h-full" : "w-[280px]"
                )}
                style={data.type === 'detailed'
                    ? { borderTop: `4px solid ${data.borderColor}`, borderLeft: '1px solid #e4e4e7', borderRight: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }
                    : { borderTop: `4px solid ${data.borderColor}`, borderLeft: '1px solid #e4e4e7', borderRight: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }
                }
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                }}
            >
                <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{data.type}</Badge>
                        {isTask && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                                        <div className={cn("h-2 w-2 rounded-full bg-current", statusColors[data.status || 'todo'])} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => handleStatusChange('todo')}>To Do</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>In Progress</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('complete')}>Complete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        {data.type === 'detailed' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setIsEditing(true)}>
                                <span className="text-xs">Edit</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className={cn("p-3 pt-2", data.type === 'detailed' ? "h-[calc(100%-50px)] overflow-hidden" : "")}>
                    {isEditing ? (
                        <textarea
                            className={cn(
                                "w-full text-sm p-1 border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary",
                                data.type === 'detailed' ? "h-full font-mono" : "min-h-[60px]"
                            )}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                // Allow Enter for new lines in detailed view
                                if (data.type !== 'detailed') handleKeyDown(e);
                            }}
                            placeholder={data.type === 'detailed' ? "Enter HTML or text here..." : "Enter text..."}
                            style={{ fontSize: data.fontSize || 14 }}
                            autoFocus
                        />
                    ) : (
                        data.type === 'detailed' ? (
                            <div
                                className="text-sm prose prose-sm dark:prose-invert max-w-none w-full h-full overflow-y-auto"
                                style={{ fontSize: data.fontSize || 14 }}
                                dangerouslySetInnerHTML={{ __html: data.content }}
                            />
                        ) : (
                            <p
                                className={cn("text-sm whitespace-pre-wrap min-h-[20px]", isTask && data.status === 'complete' && "line-through text-muted-foreground")}
                                style={{ fontSize: data.fontSize || 14 }}
                            >
                                {data.content}
                            </p>
                        )
                    )}
                </CardContent>
                {isTask && (
                    <CardFooter className="p-3 pt-0 flex justify-between items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className={cn("h-6 px-2 text-xs", !data.dateTime && "text-muted-foreground")}>
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {data.dateTime ? format(new Date(data.dateTime), "MMM d") : "Set Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.dateTime ? new Date(data.dateTime) : undefined}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {data.status === 'complete' && <Check className="h-4 w-4 text-green-600" />}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default memo(CustomNode);
