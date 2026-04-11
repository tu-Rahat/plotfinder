import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";

function SceneContent({
  plotWidth,
  plotDepth,
  floors,
  floorHeight,
  buildingCoverage,
}) {
  const buildingWidth = useMemo(
    () => Math.max((plotWidth * buildingCoverage) / 100, 8),
    [plotWidth, buildingCoverage]
  );

  const buildingDepth = useMemo(
    () => Math.max((plotDepth * buildingCoverage) / 100, 8),
    [plotDepth, buildingCoverage]
  );

  const floorBlocks = Array.from({ length: floors }, (_, index) => {
    const y = floorHeight / 2 + index * floorHeight;
    return (
      <mesh key={index} position={[0, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[buildingWidth, floorHeight, buildingDepth]} />
        <meshStandardMaterial color={index % 2 === 0 ? "#86efac" : "#4ade80"} />
      </mesh>
    );
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[20, 30, 15]} intensity={1.2} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[plotWidth + 30, plotDepth + 30]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[plotWidth, plotDepth]} />
        <meshStandardMaterial color="#d1fae5" />
      </mesh>

      {floorBlocks}

      <Html position={[0, floors * floorHeight + 4, 0]} center>
        <div
          style={{
            background: "rgba(17, 24, 39, 0.85)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {floors} floor{floors > 1 ? "s" : ""}
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

  const plotWidth = Number(preview3D?.plotWidth || 40);
  const plotDepth = Number(preview3D?.plotDepth || 60);
  const floorHeight = Number(preview3D?.floorHeight || 10);
  const buildingCoverage = Number(preview3D?.buildingCoverage || 60);

  const increaseFloors = () => setFloors((prev) => Math.min(prev + 1, 20));
  const decreaseFloors = () => setFloors((prev) => Math.max(prev - 1, 1));
  const resetFloors = () => setFloors(savedFloors);

  return (
    <div className="building-preview-card">
      <div className="building-preview-header">
        <div>
          <h3>3D Building Preview</h3>
          <p>
            Basic conceptual massing preview for this land.
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
          <span>Plot</span>
          <strong>{plotWidth}ft × {plotDepth}ft</strong>
        </div>
        <div className="building-preview-stat">
          <span>Floors</span>
          <strong>{floors}</strong>
        </div>
        <div className="building-preview-stat">
          <span>Floor Height</span>
          <strong>{floorHeight}ft</strong>
        </div>
        <div className="building-preview-stat">
          <span>Coverage</span>
          <strong>{buildingCoverage}%</strong>
        </div>
      </div>

      <div className="building-preview-canvas">
        <Canvas camera={{ position: [55, 45, 55], fov: 45 }} shadows>
          <SceneContent
            plotWidth={plotWidth}
            plotDepth={plotDepth}
            floors={floors}
            floorHeight={floorHeight}
            buildingCoverage={buildingCoverage}
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