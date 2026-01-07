export type NodeType = 'task' | 'note' | 'milestone' | 'decision' | 'detailed' | 'heading' | 'section';
export type NodeStatus = 'todo' | 'in-progress' | 'complete';
export type ConnectionStyle = 'bezier' | 'straight' | 'orthogonal';

export interface AppNode {
    id: string;
    type: NodeType;
    content: string;
    position: { x: number; y: number };
    width?: number;
    borderColor: string;
    dateTime?: Date;
    status?: NodeStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface AppConnection {
    id: string;
    source: string;
    sourceHandle: string; // top | right | bottom | left
    target: string;
    targetHandle: string; // top | right | bottom | left
    label?: string;
    style?: ConnectionStyle;
}

export interface ColorGlossary {
    useGlobal: boolean;
    colors: Record<string, string>; // hex -> label
}

export interface BoardSettings {
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
    showMinimap: boolean;
    defaultNodeType: NodeType;
    connectionStyle: ConnectionStyle;
}

export interface Board {
    id: string;
    name: string;
    description?: string;
    createdAt: string; // ISO string for easier serialization
    updatedAt: string; // ISO string
    starred: boolean;
    password?: string;
    sharedAccess?: 'viewer' | 'editor' | 'private';
    nodes: AppNode[];
    connections: AppConnection[];
    colorGlossary: ColorGlossary;
    settings: BoardSettings;
}

export interface AppSettings {
    theme: 'light' | 'dark';
    defaultView: 'dashboard' | 'last-board';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
    timeFormat: '12h' | '24h';
    globalColorGlossary: ColorGlossary;
}
