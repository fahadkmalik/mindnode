import { v4 as uuidv4 } from 'uuid';
import type { AppNode, AppConnection, NodeType, NodeStatus } from '@/types';
import { getLayoutedElements } from './layout';
import type { Node, Edge } from '@xyflow/react';

// --- SCHEMA DEFINITION ---

export interface AINode {
    id: string; // Logical ID (e.g., "1", "step-1")
    label: string;
    type: NodeType;
    date?: string; // "YYYY-MM-DD"
    status?: NodeStatus;
    details?: string; // HTML or text description
}

export interface AIConnection {
    from: string; // Logical ID
    to: string; // Logical ID
    label?: string;
}

export interface AIPlan {
    title: string;
    description?: string;
    nodes: AINode[];
    connections: AIConnection[];
}

export const AI_PROMPT_TEMPLATE = `
You are a Project Planning Assistant. Create a structured project plan for the user's request.
Output strictly valid JSON with the following structure:

{
  "title": "Project Name",
  "description": "Short summary",
  "nodes": [
    { 
      "id": "1", 
      "type": "task", // Options: 'task' | 'note' | 'milestone' | 'decision' | 'detailed' | 'heading' | 'section'
      "label": "Brief Title", 
      "details": "Description or HTML content (required for 'detailed' nodes)", 
      "date": "YYYY-MM-DD",
      "status": "todo" 
    }
  ],
  "connections": [
    { 
      "from": "1", 
      "to": "2", 
      "label": "optional label" 
    }
  ]
}

Types Guide:
- 'heading': Large text for zones/phases.
- 'section': A container-like visual grouping.
- 'detailed': A large card with rich HTML content.
- 'task': Standard actionable item.
- 'decision': Diamond shape for choices.
- 'milestone': Rounded shape for key dates.
- 'note': Yellow sticky note.

Ensure logical flow. Connect phases to their tasks. Use 'detailed' type for nodes needing long descriptions.
`;

// --- IMPORT LOGIC ---

export const parseAndLayoutPlan = (jsonString: string): {
    boardName: string;
    nodes: AppNode[];
    connections: AppConnection[];
} => {
    let plan: AIPlan;
    try {
        plan = JSON.parse(jsonString);
    } catch (e) {
        throw new Error("Invalid JSON format. Please ensure valid JSON.");
    }

    if (!plan.nodes || !Array.isArray(plan.nodes)) {
        throw new Error("Invalid structure: 'nodes' array is missing.");
    }

    // MAP Logical IDs to UUIDs
    const idMap = new Map<string, string>();
    plan.nodes.forEach(n => {
        idMap.set(n.id, uuidv4());
    });

    // 1. Convert to React Flow Nodes for Layout
    const reactFlowNodes: Node[] = plan.nodes.map(n => ({
        id: idMap.get(n.id)!,
        position: { x: 0, y: 0 }, // Initial position, will be calculated
        data: {}, // Not needed for layout calc
        width: n.type === 'detailed' ? 400 : 250,
        height: n.type === 'detailed' ? 300 : 80,
    }));

    // 2. Convert to React Flow Edges for Layout
    const reactFlowEdges: Edge[] = (plan.connections || []).map((c, index) => {
        const source = idMap.get(c.from);
        const target = idMap.get(c.to);
        if (!source || !target) return null;

        return {
            id: `e-${index}`,
            source,
            target,
        };
    }).filter(e => e !== null) as Edge[];

    // 3. Run Auto Layout
    const { nodes: layoutedNodes } = getLayoutedElements(
        reactFlowNodes,
        reactFlowEdges,
        'TB' // Top to Bottom
    );

    // 4. Hydrate into App Nodes
    const appNodes: AppNode[] = layoutedNodes.map(ln => {
        const originalNode = plan.nodes.find(n => idMap.get(n.id) === ln.id)!;

        return {
            id: ln.id,
            type: originalNode.type || 'task',
            content: originalNode.label || 'Untitled',
            // Use 'details' as content for detailed nodes if present
            // But wait, our AppNode only has 'content'. 
            // For detailed nodes, 'content' holds the HTML/Text.
            // So if type is detailed/note, we might want to append details to content or use details AS content.
            // Strategy: If 'details' exists, check type.
            ...(originalNode.type === 'detailed' && originalNode.details
                ? { content: originalNode.details } // For detailed, label might be lost? Maybe prepend label?
                : {}
            ),
            position: ln.position,
            borderColor: '#000000', // Default color, could randomize based on type
            fontSize: originalNode.type === 'heading' ? 30 : 14,
            status: originalNode.status || 'todo',
            dateTime: originalNode.date ? new Date(originalNode.date) : undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });

    // 5. Hydrate Edges
    const appConnections: AppConnection[] = (plan.connections || []).map(c => {
        const source = idMap.get(c.from);
        const target = idMap.get(c.to);
        if (!source || !target) return null;

        return {
            id: uuidv4(),
            source,
            target,
            sourceHandle: 'bottom-source', // Default for TB layout (`bottom` doesn't exist on CustomNode anymore, we named it `bottom-source`)
            targetHandle: 'top',    // Default for TB layout
            label: c.label,
            style: 'bezier'
        };
    }).filter(c => c !== null) as AppConnection[];

    return {
        boardName: plan.title || "Imported Plan",
        nodes: appNodes,
        connections: appConnections
    };
};
