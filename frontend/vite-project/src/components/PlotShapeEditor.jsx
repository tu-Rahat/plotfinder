import { useEffect, useMemo, useRef, useState } from "react";

const CANVAS_SIZE = 420;
const PADDING = 24;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePoints(points) {
  if (!points?.length) return [];

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  const scale = Math.min(
    (CANVAS_SIZE - PADDING * 2) / width,
    (CANVAS_SIZE - PADDING * 2) / height
  );

  return points.map((point) => ({
    x: PADDING + (point.x - minX) * scale,
    y: CANVAS_SIZE - (PADDING + (point.y - minY) * scale),
  }));
}

function denormalizePoints(displayPoints) {
  return displayPoints.map((point) => ({
    x: Number(point.x.toFixed(1)),
    y: Number((CANVAS_SIZE - point.y).toFixed(1)),
  }));
}

function PlotShapeEditor({ points = [], onChange }) {
  const [displayPoints, setDisplayPoints] = useState(() =>
    points.length
      ? normalizePoints(points)
      : [
          { x: 80, y: 320 },
          { x: 320, y: 320 },
          { x: 320, y: 120 },
          { x: 80, y: 120 },
        ]
  );

  const [dragIndex, setDragIndex] = useState(null);
  const boardRef = useRef(null);

  useEffect(() => {
    if (points.length) {
      setDisplayPoints(normalizePoints(points));
    }
  }, [points]);

  const polygonPath = useMemo(() => {
    if (displayPoints.length < 2) return "";
    return displayPoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
  }, [displayPoints]);

  const syncToParent = (nextDisplayPoints) => {
    setDisplayPoints(nextDisplayPoints);
    onChange(denormalizePoints(nextDisplayPoints));
  };

  const handlePointerDown = (index) => {
    setDragIndex(index);
  };

  const handlePointerMove = (event) => {
    if (dragIndex === null || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const nextX = clamp(event.clientX - rect.left, PADDING / 2, CANVAS_SIZE - PADDING / 2);
    const nextY = clamp(event.clientY - rect.top, PADDING / 2, CANVAS_SIZE - PADDING / 2);

    const nextPoints = [...displayPoints];
    nextPoints[dragIndex] = { x: nextX, y: nextY };
    syncToParent(nextPoints);
  };

  const handlePointerUp = () => {
    setDragIndex(null);
  };

  const handleResetRectangle = () => {
    const base = [
      { x: 80, y: 320 },
      { x: 320, y: 320 },
      { x: 320, y: 120 },
      { x: 80, y: 120 },
    ];
    syncToParent(base);
  };

  const handleSampleIrregular = () => {
    const sample = [
      { x: 70, y: 320 },
      { x: 320, y: 330 },
      { x: 350, y: 220 },
      { x: 300, y: 110 },
      { x: 130, y: 90 },
      { x: 60, y: 180 },
    ];
    syncToParent(sample);
  };

  const handleUndo = () => {
    if (displayPoints.length <= 3) return;
    const nextPoints = displayPoints.slice(0, -1);
    syncToParent(nextPoints);
  };

  const handleAddMidpoint = () => {
    if (displayPoints.length < 2) return;

    let longestIndex = 0;
    let longestDistance = 0;

    for (let i = 0; i < displayPoints.length; i += 1) {
      const current = displayPoints[i];
      const next = displayPoints[(i + 1) % displayPoints.length];
      const distance = Math.hypot(next.x - current.x, next.y - current.y);

      if (distance > longestDistance) {
        longestDistance = distance;
        longestIndex = i;
      }
    }

    const current = displayPoints[longestIndex];
    const next = displayPoints[(longestIndex + 1) % displayPoints.length];
    const midpoint = {
      x: (current.x + next.x) / 2,
      y: (current.y + next.y) / 2,
    };

    const nextPoints = [...displayPoints];
    nextPoints.splice(longestIndex + 1, 0, midpoint);
    syncToParent(nextPoints);
  };

  return (
    <div className="plot-editor-card">
      <div className="plot-editor-header">
        <div>
          <h4>Custom Plot Editor</h4>
          <p>
            Start from a rectangle, then drag the corner points to match the land shape.
          </p>
        </div>

        <div className="plot-editor-actions">
          <button type="button" onClick={handleResetRectangle}>
            Rectangle
          </button>
          <button type="button" onClick={handleSampleIrregular}>
            Irregular Sample
          </button>
          <button type="button" onClick={handleAddMidpoint}>
            Add Point
          </button>
          <button type="button" onClick={handleUndo} disabled={displayPoints.length <= 3}>
            Undo
          </button>
        </div>
      </div>

      <div
        ref={boardRef}
        className="plot-editor-board"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        >
          <defs>
            <pattern id="plot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect x="0" y="0" width={CANVAS_SIZE} height={CANVAS_SIZE} fill="url(#plot-grid)" />

          <rect
            x={PADDING / 2}
            y={PADDING / 2}
            width={CANVAS_SIZE - PADDING}
            height={CANVAS_SIZE - PADDING}
            fill="none"
            stroke="#94a3b8"
            strokeDasharray="6 6"
          />

          {displayPoints.length >= 3 && (
            <path
              d={`${polygonPath} Z`}
              fill="rgba(34, 197, 94, 0.18)"
              stroke="#15803d"
              strokeWidth="3"
            />
          )}

          {displayPoints.map((point, index) => (
            <g key={`${point.x}-${point.y}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="9"
                fill="#0f172a"
                stroke="#fff"
                strokeWidth="3"
                style={{ cursor: "grab" }}
                onPointerDown={() => handlePointerDown(index)}
              />
              <text
                x={point.x}
                y={point.y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#fff"
                fontWeight="700"
              >
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="plot-editor-footer">
        <p>
          Drag points to reshape the boundary.
        </p>
        <p>
          Total points: <strong>{displayPoints.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default PlotShapeEditor;