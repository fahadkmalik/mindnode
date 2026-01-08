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
    FileText,
    LayoutTemplate,
    Type
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { v4 as uuidv4 } from 'uuid';
import type { AppNode, NodeType } from "@/types";
import { getLayoutedElements } from "@/lib/layout";
import { useCallback, useEffect, useState } from "react";

const NODE_OPTIONS: { type: NodeType; label: string; icon: any }[] = [
    { type: 'task', label: 'Task', icon: Square },
    { type: 'note', label: 'Note', icon: StickyNote },
    { type: 'detailed', label: 'Detailed', icon: FileText },
    { type: 'heading', label: 'Heading', icon: FileText },
    { type: 'section', label: 'Section', icon: Square },
    { type: 'milestone', label: 'Milestone', icon: Flag },
    { type: 'decision', label: 'Decision', icon: GitBranch },
];

export function CanvasToolbar({ onHandleClick }: { onHandleClick?: (nodeId: string, handleId: string, position: { x: number, y: number }) => void }) {
    const { zoomIn, zoomOut, fitView, screenToFlowPosition, setNodes, getNodes, getEdges, setEdges } = useReactFlow();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState<number>(14);

    // Track selection to show font controls
    useEffect(() => {
        // Poll for selection changes (React Flow doesn't expose a hook for selection change easily outside of onSelectionChange)
        // Ideally we pass this as a prop, but for self-contained toolbar:
        const checkSelection = () => {
            const nodes = getNodes();
            const selected = nodes.find(n => n.selected);
            if (selected) {
                setSelectedNodeId(selected.id);
                const data = selected.data as unknown as AppNode;
                setFontSize(data.fontSize || 14);
            } else {
                setSelectedNodeId(null);
            }
        };

        const interval = setInterval(checkSelection, 200);
        return () => clearInterval(interval);
    }, [getNodes]);

    const handleAutoLayout = useCallback(() => {
        const nodes = getNodes();
        const edges = getEdges();
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            'TB' // Top-to-Bottom
        );

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        setTimeout(() => fitView({ duration: 800 }), 100);
    }, [getNodes, getEdges, setNodes, setEdges, fitView]);

    const handleFontSizeChange = (value: number[]) => {
        const newSize = value[0];
        setFontSize(newSize);
        if (selectedNodeId) {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === selectedNodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                fontSize: newSize,
                            },
                        };
                    }
                    return node;
                })
            );
        }
    };

    const addNodeAtCenter = (type: NodeType) => {
        const center = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });

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
            updatedAt: new Date(),
            fontSize: type === 'heading' ? 30 : 14,
            onHandleClick // Inject handler
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

            {selectedNodeId && (
                <>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Font Size">
                                <Type className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-40 p-4 mb-2">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Font Size</span>
                                    <span>{fontSize}px</span>
                                </div>
                                <Slider
                                    value={[fontSize]}
                                    min={10}
                                    max={60}
                                    step={1}
                                    onValueChange={handleFontSizeChange}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                    <div className="w-px h-4 bg-border mx-1" />
                </>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleAutoLayout} title="Auto Layout">
                <LayoutTemplate className="h-4 w-4" />
            </Button>

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
