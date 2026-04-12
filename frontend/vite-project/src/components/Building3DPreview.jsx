import { useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";

function SceneContent({
  plotWidth,
  plotDepth,
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

  const floorBlocks = Array.from({ length: floors }, (_, index) => {
    const y = floorHeight / 2 + index * floorHeight;
    const boxGeometry = new THREE.BoxGeometry(
      safeBuildingWidth,
      floorHeight,
      safeBuildingDepth
    );

    return (
      <group key={index} position={[0, y, 0]}>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[plotWidth + 30, plotDepth + 30]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

{/* Plot area (your land) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[plotWidth, plotDepth]} />
        <meshStandardMaterial color="#bbf7d0" />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(plotWidth, 0.1, plotDepth)]} />
        <lineBasicMaterial color="#1e293b" />
      </lineSegments>

      {floorBlocks}
    <Html position={[0, -1, plotDepth / 2 + 5]}>
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
  const savedFloors = Number(preview3D?.floors || 2);

  const [floors, setFloors] = useState(savedFloors);
  const [buildingWidth, setBuildingWidth] = useState(
    Number(preview3D?.buildingWidth || 24)
  );
  const [buildingDepth, setBuildingDepth] = useState(
    Number(preview3D?.buildingDepth || 36)
  );

  const plotAreaFromLand = Number(preview3D?.plotArea || 0);

  const plotWidth = Math.sqrt(plotAreaFromLand || 1600);
  const plotDepth = plotWidth > 0 ? plotAreaFromLand / plotWidth : 40;
  const floorHeight = Number(preview3D?.floorHeight || 10);
  const minOpenSpacePercent = Number(preview3D?.minOpenSpacePercent || 30);

  const plotArea = plotWidth * plotDepth;
  const buildingFootprint = buildingWidth * buildingDepth;
  const minOpenSpaceArea = (plotArea * minOpenSpacePercent) / 100;
  const maxAllowedFootprint = plotArea - minOpenSpaceArea;
  const remainingOpenSpace = plotArea - buildingFootprint;
  const actualOpenSpacePercent =
    plotArea > 0 ? (remainingOpenSpace / plotArea) * 100 : 0;
  const totalBuiltUpArea = buildingFootprint * floors;
  const isValidPlan =
    buildingWidth <= plotWidth &&
    buildingDepth <= plotDepth &&
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
          <span>Plot Area</span>
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
        <Canvas camera={{ position: [80, 60, 80], fov: 40 }} shadows>
          <SceneContent
            plotWidth={plotWidth}
            plotDepth={plotDepth}
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