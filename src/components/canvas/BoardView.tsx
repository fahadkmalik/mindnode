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
    // useReactFlow, // Removed unused
    type Connection,
    type EdgeChange,
    type NodeChange,
    type Node,
    type Edge,
    SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Share2, Users, CheckCircle2, Loader2 } from 'lucide-react';
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
// Removed unused DropdownMenu imports

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
import type { AppNode, NodeType } from '@/types';

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
    // const { screenToFlowPosition } = useReactFlow(); // Removed unused

    // Saving State
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Sharing State
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [sharePassword, setSharePassword] = useState("");

    // Edge Interaction State
    const [edgeMenu, setEdgeMenu] = useState<{ id: string, x: number, y: number } | null>(null);

    // Find board from store
    const board = boards.find(b => b.id === boardId);

    // Auth State
    const [isUnlocked, setIsUnlocked] = useState(false);

    // Effect to check password requirement
    useEffect(() => {
        if (board) {
            setIsUnlocked(!board.password);
            setSharePassword(board.password || "");
        }
    }, [boardId, board?.password]);

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
                style: n.type === 'detailed' ? { width: 400, height: 300 } : undefined
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

    // Auto-save debouncer
    useEffect(() => {
        if (!boardId || nodes.length === 0) return;

        const saveTimeout = setTimeout(() => {
            setIsSaving(true);
            const appNodes = nodes.map(n => ({
                ...(n.data as unknown as AppNode),
                id: n.id,
                position: n.position,
                borderColor: (n.data as unknown as AppNode).borderColor || '#000000',
                fontSize: (n.data as unknown as AppNode).fontSize
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

            setTimeout(() => {
                setIsSaving(false);
                setLastSaved(new Date());
            }, 500);
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(saveTimeout);
    }, [nodes, edges, boardId, updateBoard]);


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

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.preventDefault();
        setEdgeMenu({
            id: edge.id,
            x: event.clientX,
            y: event.clientY,
        });
    }, []);

    const handleInsertNodeOnEdge = (type: NodeType) => {
        if (!edgeMenu) return;

        const edge = edges.find(e => e.id === edgeMenu.id);
        if (!edge) return;

        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return;

        // Calculate midpoint
        const midX = (sourceNode.position.x + targetNode.position.x) / 2;
        const midY = (sourceNode.position.y + targetNode.position.y) / 2;

        const newNodeId = uuidv4();
        const newNodeApp: AppNode = {
            id: newNodeId,
            type: type,
            content: `New ${type}`,
            position: { x: midX, y: midY },
            borderColor: '#000000',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const newNode: Node = {
            id: newNodeId,
            type,
            position: { x: midX, y: midY },
            data: newNodeApp as unknown as Record<string, unknown>,
        };

        // Create new edges
        const newEdge1 = { id: uuidv4(), source: edge.source, target: newNodeId, type: 'default' };
        const newEdge2 = { id: uuidv4(), source: newNodeId, target: edge.target, type: 'default' };

        // Update state: remove old edge, add new node, add new edges
        setEdges(eds => eds.filter(e => e.id !== edge.id).concat([newEdge1, newEdge2]));
        setNodes(nds => nds.concat(newNode));

        setEdgeMenu(null);
    };

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
        <div className="h-screen w-screen flex flex-col" onClick={() => setEdgeMenu(null)}>
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{board.name}</span>
                        <div className="flex items-center gap-1">
                            {isSaving ? (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                                </span>
                            ) : lastSaved ? (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            ) : null}
                        </div>
                    </div>
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
                        onEdgeClick={onEdgeClick}
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

                    {/* Context Menu for Edges */}
                    {edgeMenu && (
                        <div
                            className="fixed z-50 bg-background border rounded-md shadow-md p-1 min-w-[150px]"
                            style={{ top: edgeMenu.y, left: edgeMenu.x }}
                        >
                            <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">Insert Node</div>
                            <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => handleInsertNodeOnEdge('task')}>
                                Task
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => handleInsertNodeOnEdge('decision')}>
                                Decision
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => handleInsertNodeOnEdge('note')}>
                                Note
                            </Button>
                        </div>
                    )}
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
