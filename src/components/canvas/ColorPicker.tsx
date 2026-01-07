import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBoardStore } from "@/store/useBoardStore";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    selectedColor?: string;
    onSelect: (color: string) => void;
    boardId: string;
}

export function ColorPicker({ selectedColor, onSelect, boardId }: ColorPickerProps) {
    const { boards } = useBoardStore();
    const board = boards.find(b => b.id === boardId);

    // Fallback if board not found (shouldn't happen)
    const colors = board?.colorGlossary.colors || {};

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <Palette className="h-4 w-4" style={{ color: selectedColor || 'currentColor' }} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
                <div className="grid grid-cols-5 gap-1">
                    {Object.keys(colors).map((color) => (
                        <div key={color} className="relative group">
                            <button
                                className={cn(
                                    "w-8 h-8 rounded-md border border-gray-200 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                                    selectedColor === color && "ring-2 ring-primary ring-offset-1"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => onSelect(color)}
                                title={colors[color]}
                            />
                            {/* Tooltip-ish label on hover */}
                            <span className="absolute z-50 invisible group-hover:visible bg-popover text-popover-foreground text-[10px] p-1 rounded border shadow-sm -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                {colors[color]}
                            </span>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
