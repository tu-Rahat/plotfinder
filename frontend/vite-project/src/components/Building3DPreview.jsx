import { useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";

function calculatePolygonArea(points = []) {
  if (!Array.isArray(points) || points.length < 3) return 0;

  let area = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area) / 2;
}
function SceneContent({
  shapeType,
  plotWidth,
  plotDepth,
  plotPolygon,
  polygonScaleFactor,
  floors,
  floorHeight,
  buildingWidth,
  buildingDepth,
  isValidPlan,
}) {

const safeBuildingWidth = useMemo(
    () => Math.min(Math.max(Number(buildingWidth || 10), 5), plotWidth),
    [buildingWidth, plotWidth]
  );

const safeBuildingDepth = useMemo(
    () => Math.min(Math.max(Number(buildingDepth || 10), 5), plotDepth),
    [buildingDepth, plotDepth]
  );

  const normalizedPolygonPoints = useMemo(() => {
    if (shapeType !== "polygon" || !Array.isArray(plotPolygon) || plotPolygon.length < 3) {
      return [];
    }

    const xs = plotPolygon.map((p) => p.x);
    const ys = plotPolygon.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const polygonWidth = Math.max(maxX - minX, 1);
    const polygonDepth = Math.max(maxY - minY, 1);

    return plotPolygon.map((point) => ({
      x: (point.x - (minX + polygonWidth / 2)) * polygonScaleFactor,
      z: (point.y - (minY + polygonDepth / 2)) * polygonScaleFactor,
    }));
  }, [shapeType, plotPolygon, polygonScaleFactor]);

    const polygonShape = useMemo(() => {
    if (normalizedPolygonPoints.length < 3) return null;

    const shape = new THREE.Shape();
    shape.moveTo(normalizedPolygonPoints[0].x, normalizedPolygonPoints[0].z);

    for (let i = 1; i < normalizedPolygonPoints.length; i += 1) {
      shape.lineTo(normalizedPolygonPoints[i].x, normalizedPolygonPoints[i].z);
    }

    shape.lineTo(normalizedPolygonPoints[0].x, normalizedPolygonPoints[0].z);
    return shape;
  }, [normalizedPolygonPoints]);

    const polygonBounds = useMemo(() => {
    if (!normalizedPolygonPoints.length) {
      return {
        width: plotWidth,
        depth: plotDepth,
      };
    }

    const xs = normalizedPolygonPoints.map((p) => p.x);
    const zs = normalizedPolygonPoints.map((p) => p.z);

    return {
      width: Math.max(...xs) - Math.min(...xs),
      depth: Math.max(...zs) - Math.min(...zs),
    };
  }, [normalizedPolygonPoints, plotWidth, plotDepth]);

  const polygonCenter = useMemo(() => {
    if (!normalizedPolygonPoints.length) {
      return { x: 0, z: 0 };
    }

    const sum = normalizedPolygonPoints.reduce(
      (acc, point) => {
        acc.x += point.x;
        acc.z += point.z;
        return acc;
      },
      { x: 0, z: 0 }
    );

    return {
      x: sum.x / normalizedPolygonPoints.length,
      z: sum.z / normalizedPolygonPoints.length,
    };
  }, [normalizedPolygonPoints]);

  const floorBlocks = Array.from({ length: floors }, (_, index) => {
    const y = floorHeight / 2 + index * floorHeight;
    const boxGeometry = new THREE.BoxGeometry(
      safeBuildingWidth,
      floorHeight,
      safeBuildingDepth
    );

    return (
            <group
        key={index}
        position={[
          shapeType === "polygon" ? polygonCenter.x : 0,
          y,
          shapeType === "polygon" ? polygonCenter.z : 0,
        ]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={boxGeometry} attach="geometry" />
          <meshStandardMaterial
            color={isValidPlan ? "#cbd5e1" : "#fca5a5"}
            metalness={0.25}
            roughness={0.45}
          />
        </mesh>

        <lineSegments>
          <edgesGeometry args={[boxGeometry]} />
          <lineBasicMaterial color={isValidPlan ? "#475569" : "#b91c1c"} />
        </lineSegments>
      </group>
    );
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[50, 80, 40]}
        intensity={1.5}
        castShadow
      />

{/* Outer area (road/surroundings) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry
          args={[
            (shapeType === "polygon" ? polygonBounds.width : plotWidth) + 30,
            (shapeType === "polygon" ? polygonBounds.depth : plotDepth) + 30,
          ]}
        />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

{shapeType === "polygon" && polygonShape ? (
  <>
    {/* Polygon land */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow>
      <shapeGeometry args={[polygonShape]} />
      <meshStandardMaterial
        color="#86efac"
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
      />
    </mesh>

    {/* Polygon corner markers */}
    {normalizedPolygonPoints.map((point, index) => (
      <mesh key={index} position={[point.x, 0.4, point.z]} castShadow>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
    ))}

    {/* Polygon border lines */}
    {normalizedPolygonPoints.map((point, index) => {
      const next = normalizedPolygonPoints[(index + 1) % normalizedPolygonPoints.length];
      const dx = next.x - point.x;
      const dz = next.z - point.z;
      const length = Math.sqrt(dx * dx + dz * dz);
      const midX = (point.x + next.x) / 2;
      const midZ = (point.z + next.z) / 2;
      const angle = Math.atan2(dx, dz);

      return (
        <mesh
          key={`edge-${index}`}
          position={[midX, 0.22, midZ]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[2.2, 0.35, length]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      );
    })}
  </>
) : (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <planeGeometry args={[plotWidth, plotDepth]} />
            <meshStandardMaterial color="#bbf7d0" />
          </mesh>

          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(plotWidth, 0.1, plotDepth)]} />
            <lineBasicMaterial color="#1e293b" />
          </lineSegments>
        </>
      )}

      {floorBlocks}
    <Html
  position={[
    0,
    -1,
    (shapeType === "polygon" ? polygonBounds.depth : plotDepth) / 2 + 5,
  ]}
>
      <div style={{ fontSize: "12px", color: "#111" }}>
        Road Side
      </div>
    </Html>

      <Html position={[0, floors * floorHeight + 4, 0]} center>
        <div
          style={{
            background: isValidPlan ? "rgba(15, 23, 42, 0.9)" : "rgba(127, 29, 29, 0.92)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {floors} floor{floors > 1 ? "s" : ""} • {isValidPlan ? "Valid plan" : "Policy exceeded"}
        </div>
      </Html>

      <OrbitControls enablePan enableZoom enableRotate />
      <Environment preset="city" />
      <gridHelper args={[Math.max(plotWidth, plotDepth) + 30, 20, "#9ca3af", "#d1d5db"]} />
    </>
  );
}

function Building3DPreview({ preview3D }) {
  console.log("preview3D in details:", {
  shapeType: preview3D?.shapeType,
  plotPolygonLength: preview3D?.plotPolygon?.length,
  plotPolygon: preview3D?.plotPolygon,
  plotArea: preview3D?.plotArea,
});
  const savedFloors = Number(preview3D?.floors || 2);

  const [floors, setFloors] = useState(savedFloors);
  const [buildingWidth, setBuildingWidth] = useState(
    Number(preview3D?.buildingWidth || 24)
  );
  const [buildingDepth, setBuildingDepth] = useState(
    Number(preview3D?.buildingDepth || 36)
  );

const shapeType = preview3D?.shapeType || "rectangle";
const plotPolygon = Array.isArray(preview3D?.plotPolygon)
  ? preview3D.plotPolygon
  : [];

const plotAreaFromLand = Number(preview3D?.plotArea || 0);

// rectangle fallback
const plotWidth = Math.sqrt(plotAreaFromLand || 1600);
const plotDepth = plotWidth > 0 ? plotAreaFromLand / plotWidth : 40;

const floorHeight = Number(preview3D?.floorHeight || 10);
const minOpenSpacePercent = Number(preview3D?.minOpenSpacePercent || 30);

const rawPolygonArea = calculatePolygonArea(plotPolygon);

const plotArea =
  shapeType === "polygon"
    ? (plotAreaFromLand > 0 ? plotAreaFromLand : rawPolygonArea)
    : plotWidth * plotDepth;

const polygonScaleFactor =
  shapeType === "polygon" && rawPolygonArea > 0 && plotArea > 0
    ? Math.sqrt(plotArea / rawPolygonArea)
    : 1;  const buildingFootprint = buildingWidth * buildingDepth;

  const minOpenSpaceArea = (plotArea * minOpenSpacePercent) / 100;
  const maxAllowedFootprint = plotArea - minOpenSpaceArea;
  const remainingOpenSpace = plotArea - buildingFootprint;
  const actualOpenSpacePercent =
    plotArea > 0 ? (remainingOpenSpace / plotArea) * 100 : 0;
  const totalBuiltUpArea = buildingFootprint * floors;

  const baseDimensionCheck =
    shapeType === "polygon"
      ? true
      : buildingWidth <= plotWidth && buildingDepth <= plotDepth;

  const isValidPlan =
    baseDimensionCheck &&
    buildingFootprint <= maxAllowedFootprint &&
    remainingOpenSpace >= 0;

  const increaseFloors = () => setFloors((prev) => Math.min(prev + 1, 20));
  const decreaseFloors = () => setFloors((prev) => Math.max(prev - 1, 1));
  const resetFloors = () => {
    setFloors(savedFloors);
    setBuildingWidth(Number(preview3D?.buildingWidth || 24));
    setBuildingDepth(Number(preview3D?.buildingDepth || 36));
  };

  return (
    <div className="building-preview-card">
      <div className="building-preview-header">
        <div>
          <h3>Building Capacity Preview</h3>
          <p>
            Adjust block size and floors to test how much building area fits while maintaining required open space.
          </p>
        </div>

        <div className="building-preview-actions">
          <button type="button" onClick={decreaseFloors}>
            - Floor
          </button>
          <button type="button" onClick={increaseFloors}>
            + Floor
          </button>
          <button type="button" onClick={resetFloors}>
            Reset
          </button>
        </div>
      </div>

      <div className="building-preview-stats">
        <div className="building-preview-stat">
          <span>Plot Area ({shapeType === "polygon" ? "custom shape" : "rectangle"})</span>
          <strong>{plotArea.toLocaleString()} sqft</strong>
        </div>
        <div className="building-preview-stat">
          <span>Building Footprint</span>
          <strong>{buildingFootprint.toLocaleString()} sqft</strong>
        </div>
        <div className="building-preview-stat">
          <span>Max Allowed Footprint</span>
          <strong>{maxAllowedFootprint.toLocaleString()} sqft</strong>
        </div>
        <div className="building-preview-stat">
          <span>Total Built-up Area</span>
          <strong>{totalBuiltUpArea.toLocaleString()} sqft</strong>
        </div>
        <div className="building-preview-stat">
          <span>Open Space Left</span>
          <strong>{remainingOpenSpace.toLocaleString()} sqft</strong>
        </div>
        <div className="building-preview-stat">
          <span>Open Space %</span>
          <strong>{actualOpenSpacePercent.toFixed(1)}%</strong>
        </div>
      </div>

      {shapeType === "polygon" && (
        <div className="building-preview-shape-note">
          This land uses a custom seller-drawn boundary. Capacity is calculated from polygon area.
        </div>
      )}

            <div className="building-preview-controls">
        <div className="building-preview-control">
          <label>Building Width (ft)</label>
          <input
            type="number"
            min="5"
            max={plotWidth}
            value={buildingWidth}
            onChange={(e) => setBuildingWidth(Number(e.target.value || 0))}
          />
        </div>

        <div className="building-preview-control">
          <label>Building Depth (ft)</label>
          <input
            type="number"
            min="5"
            max={plotDepth}
            value={buildingDepth}
            onChange={(e) => setBuildingDepth(Number(e.target.value || 0))}
          />
        </div>

        <div className="building-preview-control">
          <label>Minimum Open Space Policy</label>
          <input type="text" value={`${minOpenSpacePercent}%`} readOnly />
        </div>
      </div>

      {!isValidPlan && (
        <div className="building-preview-warning">
          This building footprint exceeds the allowed plot policy. Reduce width or depth to keep enough open space.
        </div>
      )}

      <div className="building-preview-canvas">
        <Canvas camera={{ position: [70, 95, 70], fov: 38 }} shadows>
            <SceneContent
              shapeType={shapeType}
              plotWidth={plotWidth}
              plotDepth={plotDepth}
              plotPolygon={plotPolygon}
              polygonScaleFactor={polygonScaleFactor}
              floors={floors}
              floorHeight={floorHeight}
              buildingWidth={buildingWidth}
              buildingDepth={buildingDepth}
              isValidPlan={isValidPlan}
            />  
        </Canvas>
      </div>

      <p className="building-preview-note">
        This is a simple visual preview only, not a final engineering or architectural design.
      </p>
    </div>
  );
}

export default Building3DPreview;