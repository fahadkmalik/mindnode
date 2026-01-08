import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { cn } from "@/lib/utils";
import type { AppNode } from '@/types';

type HeadingNodeProps = NodeProps & {
    data: AppNode;
};

const HeadingNode = ({ id, data, selected }: HeadingNodeProps) => {
    const { setNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(data.content || "Heading");

    useEffect(() => {
        setText(data.content || "Heading");
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
        setIsEditing(false);
        if (text !== data.content) {
            updateContent(text);
        }
    };

    return (
        <div className={cn("relative group min-w-[200px] min-h-[50px]", selected && "ring-2 ring-primary ring-offset-2 rounded")}>
            <NodeResizer
                isVisible={selected}
                minWidth={100}
                minHeight={40}
                handleStyle={{ width: 8, height: 8, borderRadius: 4 }}
            />
            {/* Minimal handles for connecting if needed */}
            {/* Minimal handles for connecting if needed */}
            <Handle type="target" position={Position.Top} id="top" className="opacity-0 group-hover:opacity-50" />
            <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0 group-hover:opacity-50" />

            {isEditing ? (
                <input
                    className="w-full h-full font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    style={{
                        color: data.borderColor || 'inherit',
                        fontSize: data.fontSize || 30
                    }}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBlur();
                    }}
                    autoFocus
                />
            ) : (
                <h1
                    className="font-bold cursor-text w-full break-words"
                    style={{
                        color: data.borderColor || 'inherit',
                        fontSize: data.fontSize || 30
                    }}
                    onDoubleClick={() => setIsEditing(true)}
                >
                    {text}
                </h1>
            )}
        </div>
    );
};

export default memo(HeadingNode);
