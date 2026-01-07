import { useState } from "react";
import { useBoardStore } from "@/store/useBoardStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronLeft, Edit2, Save as SaveIcon } from "lucide-react";

interface LegendPanelProps {
    boardId: string;
}

export function LegendPanel({ boardId }: LegendPanelProps) {
    const { boards, updateBoard } = useBoardStore();
    const [isOpen, setIsOpen] = useState(true);
    const [editingColor, setEditingColor] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState("");

    const board = boards.find(b => b.id === boardId);
    if (!board) return null;

    const colors = board.colorGlossary.colors;

    const handleSaveLabel = (color: string) => {
        const newColors = { ...colors, [color]: editLabel };
        updateBoard(boardId, {
            colorGlossary: {
                ...board.colorGlossary,
                colors: newColors
            }
        });
        setEditingColor(null);
    };

    const startEditing = (color: string, currentLabel: string) => {
        setEditingColor(color);
        setEditLabel(currentLabel);
    };

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-background shadow-sm"
                onClick={() => setIsOpen(true)}
            >
                <ChevronLeft className="h-4 w-4 mr-1" /> Legend
            </Button>
        );
    }

    return (
        <Card className="absolute top-16 right-4 w-64 z-10 max-h-[calc(100vh-100px)] flex flex-col shadow-lg border-l-4 border-l-primary/10">
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0 border-b">
                <CardTitle className="text-sm font-semibold">Color Legend</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <X className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
                <div className="p-3 space-y-2">
                    {Object.entries(colors).map(([color, label]) => (
                        <div key={color} className="flex items-center gap-2 group">
                            <div className="h-4 w-4 rounded-full border shrink-0" style={{ backgroundColor: color }} />

                            {editingColor === color ? (
                                <div className="flex items-center gap-1 flex-1">
                                    <Input
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        className="h-6 text-xs px-1"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel(color)}
                                    />
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSaveLabel(color)}>
                                        <SaveIcon className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between flex-1">
                                    <span className="text-xs truncate max-w-[120px]" title={label}>{label}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => startEditing(color, label)}
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
