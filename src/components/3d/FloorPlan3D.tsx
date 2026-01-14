import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Text, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface FloorPlan3DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
}

const Room = ({ name, width, depth, height, position, color }: RoomConfig) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Room walls */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={hovered ? "#60a5fa" : color}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Room edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#1e3a5f" linewidth={2} />
      </lineSegments>
      
      {/* Room label */}
      <Text
        position={[0, height / 2 + 0.3, 0]}
        fontSize={0.4}
        color="#1e3a5f"
        anchorX="center"
        anchorY="bottom"
      >
        {name}
      </Text>
      
      {/* Dimensions */}
      <Text
        position={[0, 0.1, depth / 2 + 0.3]}
        fontSize={0.25}
        color="#64748b"
        anchorX="center"
      >
        {`${width.toFixed(1)}m × ${depth.toFixed(1)}m`}
      </Text>
    </group>
  );
};

const Floor = ({ width, depth }: { width: number; depth: number }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} />
    </mesh>
  );
};

const RotatingCamera = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[15, 12, 15]}
      fov={50}
    />
  );
};

const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 6, depth: 5, height: 3, position: [-3, 1.5, 0], color: "#93c5fd" },
  { name: "Kitchen", width: 4, depth: 4, height: 3, position: [3, 1.5, -2], color: "#fcd34d" },
  { name: "Master Bedroom", width: 5, depth: 4, height: 3, position: [-2, 1.5, -5], color: "#a5b4fc" },
  { name: "Bedroom 2", width: 4, depth: 3.5, height: 3, position: [3.5, 1.5, 2.5], color: "#c4b5fd" },
  { name: "Bathroom", width: 3, depth: 2.5, height: 3, position: [4, 1.5, -6], color: "#67e8f9" },
  { name: "Entrance", width: 2, depth: 2, height: 3, position: [-6, 1.5, 3], color: "#86efac" },
];

export const FloorPlan3DScene = ({ 
  rooms = defaultRooms, 
  plotWidth = 20, 
  plotDepth = 16 
}: FloorPlan3DProps) => {
  return (
    <>
      <RotatingCamera />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.1}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 15, -10]} intensity={0.4} />
      
      {/* Floor */}
      <Floor width={plotWidth} depth={plotDepth} />
      
      {/* Grid */}
      <Grid
        position={[0, 0.01, 0]}
        args={[plotWidth, plotDepth]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#94a3b8"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#64748b"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
      />
      
      {/* Rooms */}
      {rooms.map((room, index) => (
        <Room key={index} {...room} />
      ))}
      
      {/* Compass indicator */}
      <group position={[plotWidth / 2 - 1, 0.1, plotDepth / 2 - 1]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#dc2626"
          anchorX="center"
        >
          N
        </Text>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 32]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>
    </>
  );
};

const FloorPlan3D = (props: FloorPlan3DProps) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl overflow-hidden">
      <Canvas shadows>
        <FloorPlan3DScene {...props} />
      </Canvas>
    </div>
  );
};

export default FloorPlan3D;
