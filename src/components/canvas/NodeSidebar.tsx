import React from 'react';
import { Square, StickyNote, Flag, GitBranch, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const NODE_TYPES = [
    { type: 'task', label: 'Task', icon: Square, color: 'border-l-4 border-black' },
    { type: 'note', label: 'Note', icon: StickyNote, color: 'border-l-4 border-yellow-400' },
    { type: 'milestone', label: 'Milestone', icon: Flag, color: 'border-l-4 border-purple-500' },
    { type: 'decision', label: 'Decision', icon: GitBranch, color: 'border-l-4 border-blue-500' },
    { type: 'detailed', label: 'Detailed', icon: FileText, color: 'border-l-4 border-emerald-500' },
    { type: 'heading', label: 'Heading', icon: FileText, color: 'border-l-4 border-transparent' },
    { type: 'section', label: 'Section', icon: Square, color: 'border-l-4 border-dashed border-gray-400' },
];

export function NodeSidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-background border-r p-4 hidden md:flex flex-col gap-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Drag to Add</div>
            {NODE_TYPES.map((node) => (
                <Card
                    key={node.type}
                    className={cn("p-3 cursor-grab hover:bg-accent transition-colors flex items-center gap-3", node.color)}
                    draggable
                    onDragStart={(event) => onDragStart(event, node.type)}
                >
                    <node.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{node.label}</span>
                </Card>
            ))}

            <div className="mt-auto p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Tips</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Drag & drop to create nodes</li>
                    <li>Double click node to edit text</li>
                    <li>Select + Backspace to delete</li>
                </ul>
            </div>
        </aside>
    );
}
