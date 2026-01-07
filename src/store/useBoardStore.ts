import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Board, AppSettings, ColorGlossary } from '@/types';

interface BoardState {
    boards: Board[];
    activeBoardId: string | null;
    appSettings: AppSettings;

    // Actions
    createBoard: (name: string, description?: string) => string;
    deleteBoard: (id: string) => void;
    updateBoard: (id: string, updates: Partial<Board>) => void;
    duplicateBoard: (id: string) => void;
    setActiveBoard: (id: string | null) => void;
    toggleStarBoard: (id: string) => void;

    // Node/Connection Actions (proxied to active board for convenience)
    // Real-time canvas updates might happen in a separate local store or slice if performance demands,
    // but for <1000 nodes, sync updates to this store are fine via debounce.
}

const DEFAULT_GLOSSARY: ColorGlossary = {
    useGlobal: true,
    colors: {
        '#000000': 'Default',
        '#DC2626': 'Urgent',
        '#2563EB': 'In Progress',
        '#16A34A': 'Research',
        '#CA8A04': 'Needs Review',
        '#9333EA': 'Long-term',
        '#EA580C': 'Blocked',
        '#DB2777': 'Creative',
        '#0D9488': 'Technical',
        '#6B7280': 'On Hold',
    },
};

export const useBoardStore = create<BoardState>()(
    persist(
        (set, get) => ({
            boards: [],
            activeBoardId: null,
            appSettings: {
                theme: 'light',
                defaultView: 'dashboard',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                globalColorGlossary: DEFAULT_GLOSSARY,
            },

            createBoard: (name, description) => {
                const newBoard: Board = {
                    id: uuidv4(),
                    name,
                    description,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    starred: false,
                    nodes: [],
                    connections: [],
                    colorGlossary: { ...DEFAULT_GLOSSARY, useGlobal: true },
                    settings: {
                        showGrid: true,
                        snapToGrid: true,
                        gridSize: 20,
                        showMinimap: false,
                        defaultNodeType: 'task',
                        connectionStyle: 'bezier',
                    },
                };
                set((state) => ({ boards: [...state.boards, newBoard], activeBoardId: newBoard.id }));
                return newBoard.id;
            },

            deleteBoard: (id) => {
                set((state) => ({
                    boards: state.boards.filter((b) => b.id !== id),
                    activeBoardId: state.activeBoardId === id ? null : state.activeBoardId,
                }));
            },

            updateBoard: (id, updates) => {
                set((state) => ({
                    boards: state.boards.map((b) =>
                        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
                    ),
                }));
            },

            duplicateBoard: (id) => {
                const board = get().boards.find((b) => b.id === id);
                if (!board) return;
                const newBoard = {
                    ...board,
                    id: uuidv4(),
                    name: `${board.name} (Copy)`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                set((state) => ({ boards: [...state.boards, newBoard] }));
            },

            setActiveBoard: (id) => set({ activeBoardId: id }),

            toggleStarBoard: (id) => {
                set((state) => ({
                    boards: state.boards.map((b) =>
                        b.id === id ? { ...b, starred: !b.starred } : b
                    ),
                }));
            },
        }),
        {
            name: 'mind-node-storage',
        }
    )
);
