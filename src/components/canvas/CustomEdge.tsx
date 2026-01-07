import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath } from '@xyflow/react';

export default function CustomEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    data,
}: EdgeProps) {
    // @ts-ignore
    const edgeStyle = data?.style || 'bezier';

    let path = '';
    let labelX = 0;
    let labelY = 0;

    if (edgeStyle === 'straight') {
        const [edgePath, lx, ly] = getStraightPath({
            sourceX, sourceY, targetX, targetY
        });
        path = edgePath;
        labelX = lx;
        labelY = ly;
    } else if (edgeStyle === 'orthogonal') {
        const [edgePath, lx, ly] = getSmoothStepPath({
            sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition
        });
        path = edgePath;
        labelX = lx;
        labelY = ly;
    } else {
        const [edgePath, lx, ly] = getBezierPath({
            sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition
        });
        path = edgePath;
        labelX = lx;
        labelY = ly;
    }

    return (
        <>
            <BaseEdge path={path} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#000' }} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan bg-background border px-2 py-1 rounded text-xs shadow-sm"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
