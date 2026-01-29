import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, ContactShadows, PointerLockControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { Sofa, CoffeeTable, TVUnit, Bed, Wardrobe, DiningTable, Desk, KitchenCounter, Refrigerator, Toilet, Bathtub, Plant } from "./Furniture";
import { Door, Window, SlidingDoor, BathroomWindow } from "./DoorsAndWindows";
import { ScaleIndicator, PlotDimensions, EnhancedCompass } from "./ScaleIndicator";
import { getWallDecorForRoom } from "./WallDecor";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface DesignConfig {
  style: string;
  colorPalette: string[];
  furnitureEnabled: boolean;
  materialsEnabled: boolean;
  lightingStyle: string;
}

interface DesignPreview3DProps {
  rooms: RoomConfig[];
  plotWidth: number;
  plotDepth: number;
  designConfig: DesignConfig;
  showFurniture: boolean;
  showMaterials: boolean;
  showWallDecor?: boolean;
  viewMode: "realistic" | "wireframe";
  transparentWalls: boolean;
  showLabels: boolean;
  enableFirstPerson: boolean;
}

// Style-based material configurations
const STYLE_MATERIALS: Record<string, {
  wallColor: string;
  floorColor: string;
  floorTexture: string;
  ceilingColor: string;
}> = {
  modern: {
    wallColor: "#f5f5f5",
    floorColor: "#8b7355",
    floorTexture: "wood",
    ceilingColor: "#ffffff",
  },
  minimalist: {
    wallColor: "#ffffff",
    floorColor: "#d3d3d3",
    floorTexture: "concrete",
    ceilingColor: "#ffffff",
  },
  luxury: {
    wallColor: "#f5e6d3",
    floorColor: "#4a3728",
    floorTexture: "marble",
    ceilingColor: "#faf8f5",
  },
  rustic: {
    wallColor: "#deb887",
    floorColor: "#8b4513",
    floorTexture: "wood",
    ceilingColor: "#f4e4bc",
  },
  scandinavian: {
    wallColor: "#ffffff",
    floorColor: "#c4a77d",
    floorTexture: "wood",
    ceilingColor: "#ffffff",
  },
  industrial: {
    wallColor: "#6b7280",
    floorColor: "#374151",
    floorTexture: "concrete",
    ceilingColor: "#4b5563",
  },
  bohemian: {
    wallColor: "#fef3c7",
    floorColor: "#92400e",
    floorTexture: "wood",
    ceilingColor: "#fffbeb",
  },
  contemporary: {
    wallColor: "#f8fafc",
    floorColor: "#64748b",
    floorTexture: "tile",
    ceilingColor: "#f1f5f9",
  },
};

// Style-based furniture colors
const STYLE_FURNITURE_COLORS: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
}> = {
  modern: { primary: "#1e293b", secondary: "#64748b", accent: "#3b82f6" },
  minimalist: { primary: "#0f172a", secondary: "#94a3b8", accent: "#ffffff" },
  luxury: { primary: "#1a1a2e", secondary: "#d4af37", accent: "#8b5cf6" },
  rustic: { primary: "#8b4513", secondary: "#deb887", accent: "#2e8b57" },
  scandinavian: { primary: "#f8fafc", secondary: "#e2e8f0", accent: "#1e293b" },
  industrial: { primary: "#374151", secondary: "#f97316", accent: "#0d0d0d" },
  bohemian: { primary: "#7c3aed", secondary: "#ec4899", accent: "#f59e0b" },
  contemporary: { primary: "#1e293b", secondary: "#3b82f6", accent: "#f43f5e" },
};

const StyledRoom = ({ 
  room, 
  style, 
  showMaterials, 
  viewMode, 
  transparentWalls, 
  showLabels 
}: { 
  room: RoomConfig; 
  style: string; 
  showMaterials: boolean; 
  viewMode: string; 
  transparentWalls: boolean; 
  showLabels: boolean;
}) => {
  const styleMaterials = STYLE_MATERIALS[style] || STYLE_MATERIALS.modern;
  const isWireframe = viewMode === "wireframe";
  
  const wallColor = showMaterials ? styleMaterials.wallColor : room.color;
  const floorColor = showMaterials ? styleMaterials.floorColor : "#e5e7eb";
  const ceilingColor = showMaterials ? styleMaterials.ceilingColor : "#ffffff";

  const wallMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: wallColor, wireframe: true });
    }
    return new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.8,
      metalness: 0.1,
      transparent: transparentWalls,
      opacity: transparentWalls ? 0.4 : 1,
    });
  }, [wallColor, isWireframe, transparentWalls]);

  const floorMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: floorColor, wireframe: true });
    }
    return new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.6,
      metalness: 0.1,
    });
  }, [floorColor, isWireframe]);

  const ceilingMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: ceilingColor, wireframe: true });
    }
    return new THREE.MeshStandardMaterial({
      color: ceilingColor,
      roughness: 0.9,
      metalness: 0,
    });
  }, [ceilingColor, isWireframe]);

  const wallThickness = 0.15;
  const [x, , z] = room.position;
  const y = 0;

  return (
    <group position={[x, y, z]}>
      {/* Floor */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[room.width, room.depth]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, room.height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.depth]} />
        <primitive object={ceilingMaterial} attach="material" />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, room.height / 2, -room.depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[room.width, room.height, wallThickness]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, room.height / 2, room.depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[room.width, room.height, wallThickness]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-room.width / 2, room.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, room.height, room.depth]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh position={[room.width / 2, room.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, room.height, room.depth]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Room Label */}
      {showLabels && !isWireframe && (
        <Html
          position={[0, 0.5, 0]}
          center
          distanceFactor={15}
          style={{
            pointerEvents: "none",
          }}
        >
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {room.name}
            <span className="block text-[10px] opacity-70">
              {room.width}m × {room.depth}m
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};

const StyledFurniture = ({ 
  room, 
  style, 
  showFurniture 
}: { 
  room: RoomConfig; 
  style: string; 
  showFurniture: boolean;
}) => {
  if (!showFurniture) return null;

  const [x, , z] = room.position;
  const roomName = room.name.toLowerCase();

  const getFurnitureForRoom = () => {
    const furniture: JSX.Element[] = [];

    if (roomName.includes("living")) {
      furniture.push(
        <Sofa key="sofa" position={[x, 0, z - room.depth / 4]} />,
        <CoffeeTable key="coffee" position={[x, 0, z]} />,
        <TVUnit key="tv" position={[x, 0, z + room.depth / 3]} />,
        <Plant key="plant" position={[x + room.width / 3, 0, z - room.depth / 3]} />
      );
    } else if (roomName.includes("bedroom") || roomName.includes("master")) {
      furniture.push(
        <Bed key="bed" position={[x, 0, z]} />,
        <Wardrobe key="wardrobe" position={[x + room.width / 3, 0, z - room.depth / 3]} />
      );
    } else if (roomName.includes("kitchen")) {
      furniture.push(
        <KitchenCounter key="counter" position={[x, 0, z - room.depth / 3]} />,
        <Refrigerator key="fridge" position={[x + room.width / 3, 0, z - room.depth / 3]} />
      );
    } else if (roomName.includes("dining")) {
      furniture.push(
        <DiningTable key="dining" position={[x, 0, z]} />
      );
    } else if (roomName.includes("bathroom")) {
      furniture.push(
        <Toilet key="toilet" position={[x - room.width / 4, 0, z - room.depth / 3]} />,
        <Bathtub key="tub" position={[x + room.width / 4, 0, z]} />
      );
    } else if (roomName.includes("office") || roomName.includes("study")) {
      furniture.push(
        <Desk key="desk" position={[x, 0, z]} />
      );
    }

    return furniture;
  };

  return <>{getFurnitureForRoom()}</>;
};

const DesignPreview3D = ({
  rooms,
  plotWidth,
  plotDepth,
  designConfig,
  showFurniture,
  showMaterials,
  showWallDecor = true,
  viewMode,
  transparentWalls,
  showLabels,
  enableFirstPerson,
}: DesignPreview3DProps) => {
  const isWireframe = viewMode === "wireframe";

  // Lighting based on style
  const getLighting = () => {
    const lightingStyle = designConfig.lightingStyle;
    
    switch (lightingStyle) {
      case "warm":
        return (
          <>
            <ambientLight intensity={0.4} color="#fff5e6" />
            <directionalLight 
              position={[10, 15, 10]} 
              intensity={1.2} 
              color="#ffedd5"
              castShadow 
            />
            <pointLight position={[0, 5, 0]} intensity={0.8} color="#fef3c7" />
          </>
        );
      case "cool":
        return (
          <>
            <ambientLight intensity={0.5} color="#e0f2fe" />
            <directionalLight 
              position={[10, 15, 10]} 
              intensity={1.5} 
              color="#f0f9ff"
              castShadow 
            />
          </>
        );
      case "dramatic":
        return (
          <>
            <ambientLight intensity={0.2} />
            <spotLight 
              position={[0, 15, 0]} 
              intensity={2} 
              angle={0.6}
              penumbra={0.5}
              castShadow 
            />
            <pointLight position={[5, 3, 5]} intensity={0.5} color="#fbbf24" />
            <pointLight position={[-5, 3, -5]} intensity={0.5} color="#3b82f6" />
          </>
        );
      default: // natural
        return (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 15, 10]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
            />
            <hemisphereLight args={["#87ceeb", "#f5f5dc", 0.3]} />
          </>
        );
    }
  };

  return (
    <Canvas
      shadows
      camera={{ position: [15, 12, 15], fov: 50 }}
      style={{ background: isWireframe ? "#1e293b" : "#87ceeb" }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        {getLighting()}

        {/* Sky */}
        {!isWireframe && <Sky sunPosition={[100, 50, 100]} />}

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[plotWidth + 10, plotDepth + 10]} />
          <meshStandardMaterial color={isWireframe ? "#0f172a" : "#90a955"} />
        </mesh>

        {/* Plot boundary */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(plotWidth, 0.1, plotDepth)]} />
          <lineBasicMaterial color="#3b82f6" />
        </lineSegments>

        {/* Rooms */}
        {rooms.map((room, index) => (
          <group key={index}>
            <StyledRoom
              room={room}
              style={designConfig.style}
              showMaterials={showMaterials}
              viewMode={viewMode}
              transparentWalls={transparentWalls}
              showLabels={showLabels}
            />
            <StyledFurniture
              room={room}
              style={designConfig.style}
              showFurniture={showFurniture && designConfig.furnitureEnabled}
            />
            {/* Wall Decorations */}
            {showWallDecor && !transparentWalls && viewMode !== "wireframe" && (
              <group>
                {getWallDecorForRoom(room, designConfig.style)}
              </group>
            )}
          </group>
        ))}

        {/* Scale and orientation indicators */}
        {!isWireframe && (
          <>
            <ScaleIndicator position={[-plotWidth / 2 - 2, 0, -plotDepth / 2 - 2]} />
            <PlotDimensions plotWidth={plotWidth} plotDepth={plotDepth} />
            <EnhancedCompass position={[plotWidth / 2 + 3, 0, -plotDepth / 2 - 3]} />
          </>
        )}

        {/* Contact shadows */}
        {!isWireframe && (
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={50}
            blur={2}
            far={20}
          />
        )}

        {/* Controls */}
        {enableFirstPerson ? (
          <PointerLockControls />
        ) : (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.1}
          />
        )}
      </Suspense>
    </Canvas>
  );
};

export default DesignPreview3D;
