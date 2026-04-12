import { useMemo } from "react";

const CANVAS_SIZE = 320;
const PADDING = 24;

function getClosedPoints(points) {
  if (!points || points.length < 2) return points || [];
  return [...points, points[0]];
}

function PlotShapeEditor({ points = [], onChange }) {
  const normalizedPoints = useMemo(() => {
    if (!points.length) return [];

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
  }, [points]);

  const closedPoints = getClosedPoints(normalizedPoints);

  const polygonPath = closedPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const handleBoardClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Number((event.clientX - rect.left).toFixed(1));
    const y = Number((rect.bottom - event.clientY).toFixed(1));

    onChange([...(points || []), { x, y }]);
  };

  const handleUndo = () => {
    onChange(points.slice(0, -1));
  };

  const handleReset = () => {
    onChange([]);
  };

  const useSampleShape = () => {
    onChange([
      { x: 20, y: 20 },
      { x: 150, y: 20 },
      { x: 190, y: 80 },
      { x: 160, y: 170 },
      { x: 40, y: 150 },
    ]);
  };

  return (
    <div className="plot-editor-card">
      <div className="plot-editor-header">
        <div>
          <h4>Custom Plot Drawer</h4>
          <p>
            Click inside the board to add plot corner points in order around the land boundary.
          </p>
        </div>

        <div className="plot-editor-actions">
          <button type="button" onClick={handleUndo} disabled={!points.length}>
            Undo
          </button>
          <button type="button" onClick={handleReset} disabled={!points.length}>
            Reset
          </button>
          <button type="button" onClick={useSampleShape}>
            Sample
          </button>
        </div>
      </div>

      <div className="plot-editor-board" onClick={handleBoardClick}>
        <svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        >
          <defs>
            <pattern
              id="plot-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#dbe4ee"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect
            x="0"
            y="0"
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            fill="url(#plot-grid)"
          />

          {points.length >= 3 && (
            <path
              d={`${polygonPath} Z`}
              fill="rgba(34, 197, 94, 0.18)"
              stroke="#15803d"
              strokeWidth="2"
            />
          )}

          {points.length === 2 && (
            <path
              d={polygonPath}
              fill="none"
              stroke="#15803d"
              strokeWidth="2"
            />
          )}

          {normalizedPoints.map((point, index) => (
            <g key={`${point.x}-${point.y}-${index}`}>
              <circle cx={point.x} cy={point.y} r="5" fill="#0f172a" />
              <text
                x={point.x + 8}
                y={point.y - 8}
                fontSize="12"
                fill="#0f172a"
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
          Points added: <strong>{points.length}</strong>
        </p>
        <p>
          Minimum needed: <strong>3</strong>
        </p>
      </div>
    </div>
  );
}

export default PlotShapeEditor;