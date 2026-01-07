import { Button } from "@/components/ui/button";
import {
    Maximize,
    ZoomOut,
    ZoomIn,
    Plus,
    Square,
    StickyNote,
    Flag,
    GitBranch,
    FileText
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { v4 as uuidv4 } from 'uuid';
import type { AppNode, NodeType } from "@/types";

const NODE_OPTIONS: { type: NodeType; label: string; icon: any }[] = [
    { type: 'task', label: 'Task', icon: Square },
    { type: 'note', label: 'Note', icon: StickyNote },
    { type: 'detailed', label: 'Detailed', icon: FileText },
    { type: 'heading', label: 'Heading', icon: FileText },
    { type: 'section', label: 'Section', icon: Square },
    { type: 'milestone', label: 'Milestone', icon: Flag },
    { type: 'decision', label: 'Decision', icon: GitBranch },
];

export function CanvasToolbar() {
    const { zoomIn, zoomOut, fitView, screenToFlowPosition, setNodes } = useReactFlow();

    const addNodeAtCenter = (type: NodeType) => {
        // Calculate center of the viewport
        // A simple approximation is getting the center of the window 
        // and projecting it to the flow coordinate system.
        const center = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });

        // Add some random offset so they don't stack perfectly on top of each other
        // if user adds multiple quickly
        const position = {
            x: center.x - 100 + Math.random() * 20,
            y: center.y - 50 + Math.random() * 20
        };

        const newNodeId = uuidv4();
        const newNodeApp: AppNode = {
            id: newNodeId,
            type: type,
            content: `New ${type}`,
            position: position,
            borderColor: '#000000',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const newNode = {
            id: newNodeId,
            type,
            position,
            data: newNodeApp as unknown as Record<string, unknown>,
            style: type === 'detailed' ? { width: 400, height: 300 } : undefined,
        };

        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background border rounded-full shadow-lg p-2 flex items-center gap-2 z-20">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="default" size="icon" className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="mb-2">
                    {NODE_OPTIONS.map((option) => (
                        <DropdownMenuItem
                            key={option.type}
                            onClick={() => addNodeAtCenter(option.type)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <option.icon className="h-4 w-4" />
                            <span>{option.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-border mx-1" />

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => fitView()}>
                <Maximize className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border" />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => zoomOut()}>
                <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => zoomIn()}>
                <ZoomIn className="h-4 w-4" />
            </Button>
        </div>
    );
}
