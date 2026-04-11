import { useMemo, useState } from "react";
import * as THREE from "three";
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
    const boxGeometry = new THREE.BoxGeometry(
      buildingWidth,
      floorHeight,
      buildingDepth
    );

    return (
      <group key={index} position={[0, y, 0]}>
        <mesh castShadow receiveShadow>
          <primitive object={boxGeometry} attach="geometry" />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.25}
            roughness={0.45}
          />
        </mesh>

        <lineSegments>
          <edgesGeometry args={[boxGeometry]} />
          <lineBasicMaterial color="#64748b" />
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
              Adjust floors to visualize building height and remaining open space on your plot.
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
        <Canvas camera={{ position: [80, 60, 80], fov: 40 }} shadows>
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