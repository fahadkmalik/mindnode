import { memo, useState, useCallback, useEffect } from 'react';
import { NodeResizer, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { cn } from "@/lib/utils";
import type { AppNode } from '@/types';

type SectionNodeProps = NodeProps & {
    data: AppNode;
};

const SectionNode = ({ id, data, selected }: SectionNodeProps) => {
    const { setNodes } = useReactFlow();
    const [label, setLabel] = useState(data.content || "Section");

    useEffect(() => {
        setLabel(data.content || "Section");
    }, [data.content]);

    const updateContent = useCallback((newContent: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            content: newContent,
                        },
                    };
                }
                return node;
            })
        );
    }, [id, setNodes]);

    const handleBlur = () => {
        if (label !== data.content) {
            updateContent(label);
        }
    };

    return (
        <div
            className={cn(
                "relative group w-full h-full border-2 border-dashed rounded-xl bg-muted/20 transition-colors",
                selected ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"
            )}
            style={{
                minWidth: 200,
                minHeight: 200,
                borderColor: data.borderColor || undefined,
                backgroundColor: data.borderColor ? `${data.borderColor}10` : undefined // 10% opacity hex
            }}
        >
            <NodeResizer
                isVisible={selected}
                minWidth={100}
                minHeight={100}
                handleStyle={{ width: 10, height: 10, borderRadius: 5 }}
            />

            <div className="absolute -top-8 left-0">
                <input
                    className="bg-transparent font-semibold text-muted-foreground focus:text-foreground focus:outline-none text-lg"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.currentTarget.blur();
                        }
                    }}
                />
            </div>

            {/* The container itself is the visual content */}
        </div>
    );
};

export default memo(SectionNode);
