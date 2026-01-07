import { useRef, useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    ReactFlowProvider,
    useReactFlow,
    type Connection,
    type EdgeChange,
    type NodeChange,
    type Node,
    type Edge,
    SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Share2, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { useBoardStore } from '@/store/useBoardStore';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { NodeSidebar } from './NodeSidebar';
import { CanvasToolbar } from './CanvasToolbar';
import { LegendPanel } from './LegendPanel';
import { ColorPicker } from './ColorPicker';
import { AnalyticsPanel } from './AnalyticsPanel';
import { PasswordPrompt } from './PasswordPrompt';
import HeadingNode from './HeadingNode';
import SectionNode from './SectionNode';
import type { AppNode } from '@/types';

const nodeTypes = {
    task: CustomNode,
    note: CustomNode,
    milestone: CustomNode,
    decision: CustomNode,
    detailed: CustomNode,
    heading: HeadingNode,
    section: SectionNode,
};

const edgeTypes = {
    default: CustomEdge,
};

function BoardCanvas() {
    const { boardId } = useParams();
    const { boards, updateBoard } = useBoardStore();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    // Sharing State
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [sharePassword, setSharePassword] = useState("");

    // Find board from store
    const board = boards.find(b => b.id === boardId);

    // Auth State
    const [isUnlocked, setIsUnlocked] = useState(false);

    // Effect to check password requirement
    useEffect(() => {
        if (board) {
            // If no password, unlocked. If password, locked initially.
            setIsUnlocked(!board.password);
            setSharePassword(board.password || "");
        }
    }, [boardId, board?.password]);

    // Initialize with explicit types to avoid 'never[]' inference
    const [nodes, setNodes] = useNodesState<Node>([]);
    const [edges, setEdges] = useEdgesState<Edge>([]);

    // Sync from store
    useEffect(() => {
        if (board) {
            const initialNodes: Node[] = board.nodes.map(n => ({
                id: n.id,
                type: n.type,
                position: n.position,
                data: n as unknown as Record<string, unknown>,
                style: n.type === 'detailed' ? { width: 400, height: 300 } : undefined // Ensure style persists
            }));
            setNodes(initialNodes);

            const initialEdges: Edge[] = board.connections.map(c => ({
                id: c.id,
                source: c.source,
                target: c.target,
                sourceHandle: c.sourceHandle,
                targetHandle: c.targetHandle,
                type: 'default',
                data: { style: c.style }
            }));
            setEdges(initialEdges);
        }
    }, [boardId]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'default' }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNodeId = uuidv4();
            const newNodeApp: AppNode = {
                id: newNodeId,
                type: type as any,
                content: `New ${type}`,
                position: position,
                borderColor: '#000000',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const newNode: Node = {
                id: newNodeId,
                type,
                position,
                data: newNodeApp as unknown as Record<string, unknown>,
                style: (type === 'detailed' || type === 'section') ? { width: type === 'section' ? 200 : 400, height: type === 'section' ? 200 : 300 } : undefined,
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    const updateSelectedNodeColor = (color: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.selected) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            // @ts-ignore
                            borderColor: color
                        }
                    };
                }
                return node;
            })
        );
    };

    const handleSave = () => {
        if (!boardId) return;
        const appNodes = nodes.map(n => ({
            ...(n.data as unknown as AppNode),
            id: n.id,
            position: n.position,
        })) as AppNode[];

        const appEdges = edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle || 'top',
            targetHandle: e.targetHandle || 'top',
            style: e.data?.style || 'bezier'
        })) as any[];

        updateBoard(boardId, {
            nodes: appNodes,
            connections: appEdges
        });
    };

    const handleUpdateSecurity = () => {
        if (!boardId) return;
        updateBoard(boardId, {
            password: sharePassword
        });
        setIsShareOpen(false);
    };

    if (!board) return <div>Board not found</div>;

    if (!isUnlocked) {
        return <PasswordPrompt onUnlock={() => setIsUnlocked(true)} correctPassword={board.password} />;
    }

    return (
        <div className="h-screen w-screen flex flex-col">
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <span className="font-semibold">{board.name}</span>
                    <ColorPicker boardId={boardId || ''} onSelect={updateSelectedNodeColor} />
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" /> Share
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share Board</DialogTitle>
                                <DialogDescription>Manage access and security for this board.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Board Protection (Password)</Label>
                                    <Input
                                        type="password"
                                        placeholder="Set a password..."
                                        value={sharePassword}
                                        onChange={(e) => setSharePassword(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Leave empty for public access.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>General Access</Label>
                                    <Select defaultValue="viewer">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select access" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                                    <Users className="h-4 w-4" />
                                    <span className="truncate flex-1">localhost:5173/board/{boardId}</span>
                                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>Copy</Button>
                                </div>
                            </div>
                            <Button onClick={handleUpdateSecurity}>Save Changes</Button>
                        </DialogContent>
                    </Dialog>

                    <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Board
                    </Button>
                </div>
            </header>
            <div className="flex-1 flex overflow-hidden relative">
                <NodeSidebar />
                <LegendPanel boardId={boardId || ''} />
                <div className="flex-1 h-full bg-muted/5" ref={wrapperRef}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={{ type: 'default', animated: false }}
                        fitView
                        minZoom={0.05}
                        maxZoom={4}
                        panOnScroll
                        selectionOnDrag
                        selectionMode={SelectionMode.Partial}
                    >
                        <Background color="#ccc" gap={20} />
                        <Controls className="hidden" />
                        <MiniMap />
                        <CanvasToolbar />
                        <AnalyticsPanel boardId={boardId || ''} />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}

export function BoardView() {
    return (
        <ReactFlowProvider>
            <BoardCanvas />
        </ReactFlowProvider>
    );
}
