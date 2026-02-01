import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

export interface DimensionLocked3DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
}

// Wall thickness - consistent across all walls
const WALL_THICKNESS = 0.15;
const WALL_HEIGHT = 1.4; // Low cutaway height
const FLOOR_HEIGHT = 0.02;

// ============================================================================
// REALISTIC MATERIALS - Physically plausible textures
// ============================================================================

const createWoodMaterial = (baseColor: string) => ({
  color: baseColor,
  roughness: 0.72,
  metalness: 0,
});

const createFabricMaterial = (color: string) => ({
  color,
  roughness: 0.92,
  metalness: 0,
});

const createMetalMaterial = (color: string) => ({
  color,
  roughness: 0.25,
  metalness: 0.85,
});

// Floor materials based on room type
const getFloorConfig = (roomName: string) => {
  const name = roomName.toLowerCase();
  if (name.includes("kitchen") || name.includes("bathroom")) {
    return { color: "#E8E4DC", pattern: "tile" };
  }
  if (name.includes("meeting") || name.includes("office")) {
    return { color: "#8B7B6A", pattern: "carpet" };
  }
  return { color: "#C4A575", pattern: "wood" };
};

// ============================================================================
// FLOOR COMPONENTS - Realistic textures
// ============================================================================

const WoodFloor = ({ 
  width, 
  depth, 
  position 
}: { 
  width: number; 
  depth: number; 
  position: [number, number, number];
}) => {
  const plankCount = Math.max(Math.floor(width * 3), 4);
  const plankWidth = width / plankCount;
  
  const planks = useMemo(() => {
    return Array.from({ length: plankCount }).map((_, i) => ({
      shade: 0.9 + Math.random() * 0.2
    }));
  }, [plankCount]);
  
  return (
    <group position={position}>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#C4A575" roughness={0.75} />
      </mesh>
      {planks.map((plank, i) => (
        <mesh 
          key={i}
          position={[-width/2 + plankWidth/2 + i * plankWidth, 0.002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[plankWidth - 0.015, depth - 0.02]} />
          <meshStandardMaterial 
            color={new THREE.Color("#C4A575").multiplyScalar(plank.shade)} 
            roughness={0.72}
          />
        </mesh>
      ))}
      {/* Plank lines */}
      {Array.from({ length: plankCount + 1 }).map((_, i) => (
        <mesh 
          key={`line-${i}`}
          position={[-width/2 + i * plankWidth, 0.003, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.006, depth]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

const TileFloor = ({ 
  width, 
  depth, 
  position 
}: { 
  width: number; 
  depth: number; 
  position: [number, number, number];
}) => {
  const tileSize = 0.3;
  const tilesX = Math.ceil(width / tileSize);
  const tilesZ = Math.ceil(depth / tileSize);
  
  const tiles = useMemo(() => {
    const items: { x: number; z: number; shade: number }[] = [];
    for (let i = 0; i < tilesX; i++) {
      for (let j = 0; j < tilesZ; j++) {
        if (i * tileSize < width && j * tileSize < depth) {
          items.push({
            x: -width/2 + tileSize/2 + i * tileSize,
            z: -depth/2 + tileSize/2 + j * tileSize,
            shade: 0.95 + Math.random() * 0.1,
          });
        }
      }
    }
    return items;
  }, [width, depth, tilesX, tilesZ, tileSize]);
  
  return (
    <group position={position}>
      {/* Grout base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#D0C8C0" roughness={0.9} />
      </mesh>
      {/* Individual tiles */}
      {tiles.map((tile, i) => (
        <mesh 
          key={i}
          position={[tile.x, 0.002, tile.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[tileSize - 0.012, tileSize - 0.012]} />
          <meshStandardMaterial 
            color={new THREE.Color("#E8E4DC").multiplyScalar(tile.shade)}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
};

const CarpetFloor = ({ 
  width, 
  depth, 
  position 
}: { 
  width: number; 
  depth: number; 
  position: [number, number, number];
}) => {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#8B7B6A" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[width - 0.08, depth - 0.08]} />
        <meshStandardMaterial color="#9A8B7A" roughness={0.96} />
      </mesh>
    </group>
  );
};

// ============================================================================
// WALL COMPONENT - Exact geometry match
// ============================================================================

const ExactWall = ({
  start,
  end,
  height = WALL_HEIGHT,
  thickness = WALL_THICKNESS,
}: {
  start: [number, number];
  end: [number, number];
  height?: number;
  thickness?: number;
}) => {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[1] + end[1]) / 2;

  return (
    <group position={[midX, height / 2, midZ]} rotation={[0, -angle, 0]}>
      {/* Main wall */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length + thickness, height, thickness]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.85} />
      </mesh>
      {/* Top edge highlight */}
      <mesh position={[0, height / 2 - 0.01, 0]}>
        <boxGeometry args={[length + thickness, 0.02, thickness + 0.01]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      {/* Baseboard */}
      <mesh position={[0, -height / 2 + 0.04, thickness / 2 + 0.005]} castShadow>
        <boxGeometry args={[length + thickness, 0.08, 0.015]} />
        <meshStandardMaterial color="#E0DCD4" roughness={0.6} />
      </mesh>
    </group>
  );
};

// ============================================================================
// FURNITURE COMPONENTS - Realistic proportions
// ============================================================================

const Sofa = ({ position, rotation = 0, scale = 1 }: { position: [number, number, number]; rotation?: number; scale?: number }) => (
  <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    {/* Frame */}
    <mesh position={[0, 0.08, 0]} castShadow>
      <boxGeometry args={[2.0, 0.16, 0.85]} />
      <meshStandardMaterial {...createWoodMaterial("#4A4040")} />
    </mesh>
    {/* Seat */}
    <mesh position={[0, 0.24, 0.05]} castShadow>
      <boxGeometry args={[1.9, 0.16, 0.7]} />
      <meshStandardMaterial {...createFabricMaterial("#6B7A68")} />
    </mesh>
    {/* Back */}
    <mesh position={[0, 0.48, -0.3]} castShadow>
      <boxGeometry args={[1.9, 0.35, 0.2]} />
      <meshStandardMaterial {...createFabricMaterial("#5A6958")} />
    </mesh>
    {/* Armrests */}
    <mesh position={[-0.9, 0.3, 0]} castShadow>
      <boxGeometry args={[0.16, 0.28, 0.8]} />
      <meshStandardMaterial {...createFabricMaterial("#5A6958")} />
    </mesh>
    <mesh position={[0.9, 0.3, 0]} castShadow>
      <boxGeometry args={[0.16, 0.28, 0.8]} />
      <meshStandardMaterial {...createFabricMaterial("#5A6958")} />
    </mesh>
  </group>
);

const CoffeeTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.36, 0]} castShadow>
      <boxGeometry args={[1.0, 0.04, 0.5]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4530")} />
    </mesh>
    {[[-0.42, -0.2], [0.42, -0.2], [-0.42, 0.2], [0.42, 0.2]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.17, pos[1]]} castShadow>
        <boxGeometry args={[0.04, 0.34, 0.04]} />
        <meshStandardMaterial {...createWoodMaterial("#4A3520")} />
      </mesh>
    ))}
  </group>
);

const TVUnit = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.24, 0]} castShadow>
      <boxGeometry args={[1.6, 0.48, 0.42]} />
      <meshStandardMaterial {...createWoodMaterial("#3A3535")} />
    </mesh>
    <mesh position={[0, 0.72, 0.08]} castShadow>
      <boxGeometry args={[1.2, 0.7, 0.04]} />
      <meshStandardMaterial color="#0A0A0A" roughness={0.1} />
    </mesh>
  </group>
);

const Plant = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.1, 0.24, 12]} />
      <meshStandardMaterial color="#C4A070" roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.42, 0]} castShadow>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshStandardMaterial color="#4A7050" roughness={0.92} />
    </mesh>
  </group>
);

const Bed = ({ position, rotation = 0, isDouble = true }: { position: [number, number, number]; rotation?: number; isDouble?: boolean }) => {
  const width = isDouble ? 1.6 : 1.0;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[width, 0.24, 2.0]} />
        <meshStandardMaterial {...createWoodMaterial("#5A4030")} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.52, -0.94]} castShadow>
        <boxGeometry args={[width, 0.7, 0.06]} />
        <meshStandardMaterial {...createWoodMaterial("#4A3025")} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.3, 0.02]} castShadow>
        <boxGeometry args={[width - 0.1, 0.14, 1.9]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>
      {/* Duvet */}
      <mesh position={[0, 0.4, 0.2]} castShadow>
        <boxGeometry args={[width - 0.12, 0.06, 1.4]} />
        <meshStandardMaterial {...createFabricMaterial("#E8E4DC")} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.35, 0.42, -0.65]} castShadow>
        <boxGeometry args={[0.48, 0.1, 0.32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      {isDouble && (
        <mesh position={[0.35, 0.42, -0.65]} castShadow>
          <boxGeometry args={[0.48, 0.1, 0.32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
        </mesh>
      )}
    </group>
  );
};

const Nightstand = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.24, 0]} castShadow>
      <boxGeometry args={[0.45, 0.48, 0.38]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4030")} />
    </mesh>
    {/* Lamp */}
    <mesh position={[0, 0.52, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
      <meshStandardMaterial color="#8B7355" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.66, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.11, 0.18, 12]} />
      <meshStandardMaterial color="#F5E8D0" roughness={0.9} transparent opacity={0.85} />
    </mesh>
  </group>
);

const Wardrobe = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, WALL_HEIGHT * 0.48, 0]} castShadow>
      <boxGeometry args={[1.4, WALL_HEIGHT * 0.95, 0.55]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4030")} />
    </mesh>
    {/* Door line */}
    <mesh position={[0, WALL_HEIGHT * 0.48, 0.28]} castShadow>
      <boxGeometry args={[0.02, WALL_HEIGHT * 0.88, 0.01]} />
      <meshStandardMaterial color="#3A2515" roughness={0.7} />
    </mesh>
  </group>
);

const KitchenCounter = ({ position, rotation = 0, width = 2.4 }: { position: [number, number, number]; rotation?: number; width?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Base */}
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[width, 0.8, 0.58]} />
      <meshStandardMaterial {...createWoodMaterial("#8B7355")} />
    </mesh>
    {/* Countertop */}
    <mesh position={[0, 0.82, 0]} castShadow>
      <boxGeometry args={[width + 0.04, 0.04, 0.62]} />
      <meshStandardMaterial color="#E8E4DC" roughness={0.25} />
    </mesh>
    {/* Sink */}
    <mesh position={[width * 0.22, 0.81, 0]} castShadow>
      <boxGeometry args={[0.5, 0.02, 0.38]} />
      <meshStandardMaterial {...createMetalMaterial("#C0C0C0")} />
    </mesh>
    {/* Cooktop */}
    <mesh position={[-width * 0.22, 0.83, 0]} castShadow>
      <boxGeometry args={[0.55, 0.01, 0.48]} />
      <meshStandardMaterial color="#1A1A1A" roughness={0.2} />
    </mesh>
  </group>
);

const Refrigerator = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.85, 0]} castShadow>
      <boxGeometry args={[0.68, 1.7, 0.65]} />
      <meshStandardMaterial color="#E8E8E8" roughness={0.3} metalness={0.15} />
    </mesh>
    <mesh position={[0, 0.52, 0.33]} castShadow>
      <boxGeometry args={[0.62, 0.02, 0.01]} />
      <meshStandardMaterial color="#D0D0D0" roughness={0.4} />
    </mesh>
  </group>
);

const MeetingTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.72, 0]} castShadow>
      <boxGeometry args={[1.8, 0.05, 0.85]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4530")} />
    </mesh>
    {[[-0.8, -0.32], [0.8, -0.32], [-0.8, 0.32], [0.8, 0.32]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.35, pos[1]]} castShadow>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial {...createWoodMaterial("#4A3520")} />
      </mesh>
    ))}
  </group>
);

const OfficeChair = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[0.42, 0.05, 0.4]} />
      <meshStandardMaterial {...createFabricMaterial("#3A3A3A")} />
    </mesh>
    <mesh position={[0, 0.68, -0.18]} castShadow>
      <boxGeometry args={[0.4, 0.48, 0.04]} />
      <meshStandardMaterial {...createFabricMaterial("#3A3A3A")} />
    </mesh>
    <mesh position={[0, 0.2, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
      <meshStandardMaterial {...createMetalMaterial("#505050")} />
    </mesh>
  </group>
);

// Bathroom fixtures
const Toilet = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.18, 0.08]} castShadow>
      <boxGeometry args={[0.38, 0.36, 0.55]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.42, -0.18]} castShadow>
      <boxGeometry args={[0.35, 0.32, 0.15]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.2} />
    </mesh>
  </group>
);

const BathroomSink = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.35, 0]} castShadow>
      <boxGeometry args={[0.15, 0.7, 0.15]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.72, 0.05]} castShadow>
      <boxGeometry args={[0.5, 0.08, 0.4]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.15} />
    </mesh>
  </group>
);

// ============================================================================
// DIMENSION-LOCKED ROOM COMPONENT
// ============================================================================

const DimensionLockedRoom = ({ room }: { room: RoomConfig }) => {
  const { name, width, depth, position } = room;
  const roomX = position[0];
  const roomZ = position[2];
  const floorConfig = getFloorConfig(name);
  const roomName = name.toLowerCase();

  const halfW = width / 2;
  const halfD = depth / 2;
  
  // Safety margins for furniture
  const safeMargin = 0.25;
  const safeWidth = width - safeMargin * 2;
  const safeDepth = depth - safeMargin * 2;

  const renderFurniture = () => {
    if (roomName.includes("living")) {
      const scale = Math.min(width / 6, depth / 5, 1);
      return (
        <>
          <Sofa position={[0, 0, -depth * 0.2]} rotation={0} scale={scale} />
          <CoffeeTable position={[0, 0, depth * 0.1]} rotation={0} />
          <TVUnit position={[0, 0, depth * 0.35]} rotation={Math.PI} />
          <Plant position={[width * 0.35, 0, -depth * 0.35]} scale={0.8} />
          <Plant position={[-width * 0.38, 0, depth * 0.35]} scale={0.7} />
        </>
      );
    }

    if (roomName.includes("master") || roomName.includes("bedroom")) {
      return (
        <>
          <Bed position={[0, 0, -depth * 0.12]} rotation={0} isDouble={roomName.includes("master")} />
          <Nightstand position={[-width * 0.35, 0, -depth * 0.12]} />
          <Nightstand position={[width * 0.35, 0, -depth * 0.12]} />
          <Wardrobe position={[width * 0.3, 0, depth * 0.35]} rotation={Math.PI} />
        </>
      );
    }

    if (roomName.includes("kitchen")) {
      const counterWidth = Math.min(width * 0.8, 2.4);
      return (
        <>
          <KitchenCounter position={[0, 0, -depth * 0.3]} rotation={0} width={counterWidth} />
          <Refrigerator position={[width * 0.35, 0, depth * 0.25]} rotation={Math.PI} />
        </>
      );
    }

    if (roomName.includes("bathroom") || roomName.includes("bath")) {
      return (
        <>
          <Toilet position={[-safeWidth * 0.2, 0, -safeDepth * 0.2]} rotation={0} />
          <BathroomSink position={[safeWidth * 0.2, 0, -safeDepth * 0.25]} rotation={0} />
        </>
      );
    }

    if (roomName.includes("meeting") || roomName.includes("office") || roomName.includes("study")) {
      return (
        <>
          <MeetingTable position={[0, 0, 0]} rotation={0} />
          <OfficeChair position={[-0.6, 0, -0.55]} rotation={0} />
          <OfficeChair position={[0.6, 0, -0.55]} rotation={0} />
          <OfficeChair position={[-0.6, 0, 0.55]} rotation={Math.PI} />
          <OfficeChair position={[0.6, 0, 0.55]} rotation={Math.PI} />
        </>
      );
    }

    return null;
  };

  return (
    <group position={[roomX, 0, roomZ]}>
      {/* Floor - exact dimensions */}
      {floorConfig.pattern === "wood" ? (
        <WoodFloor width={width} depth={depth} position={[0, 0, 0]} />
      ) : floorConfig.pattern === "tile" ? (
        <TileFloor width={width} depth={depth} position={[0, 0, 0]} />
      ) : (
        <CarpetFloor width={width} depth={depth} position={[0, 0, 0]} />
      )}

      {/* Walls - exact positions from room geometry */}
      <ExactWall start={[-halfW, -halfD]} end={[halfW, -halfD]} height={WALL_HEIGHT} />
      <ExactWall start={[-halfW, halfD]} end={[halfW, halfD]} height={WALL_HEIGHT * 0.4} />
      <ExactWall start={[-halfW, -halfD]} end={[-halfW, halfD]} height={WALL_HEIGHT} />
      <ExactWall start={[halfW, -halfD]} end={[halfW, halfD]} height={WALL_HEIGHT * 0.4} />

      {/* Furniture */}
      {renderFurniture()}
    </group>
  );
};

// ============================================================================
// MAIN SCENE WITH SOFT GLOBAL ILLUMINATION
// ============================================================================

const Scene = ({ 
  rooms, 
  plotWidth, 
  plotDepth 
}: { 
  rooms: RoomConfig[]; 
  plotWidth: number; 
  plotDepth: number;
}) => {
  const cameraDistance = Math.max(plotWidth, plotDepth) * 1.8;
  
  return (
    <>
      {/* Orthographic camera - strict 90° top-down */}
      <OrthographicCamera
        makeDefault
        position={[0, cameraDistance, 0]}
        zoom={32}
        near={0.1}
        far={cameraDistance * 4}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Soft global illumination - natural indoor lighting */}
      <ambientLight intensity={0.5} color="#FFF8F0" />
      
      {/* Key light */}
      <directionalLight
        position={[12, 35, 12]}
        intensity={0.85}
        color="#FFF5E8"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={70}
        shadow-camera-left={-plotWidth}
        shadow-camera-right={plotWidth}
        shadow-camera-top={plotDepth}
        shadow-camera-bottom={-plotDepth}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light */}
      <directionalLight position={[-8, 18, -8]} intensity={0.22} color="#E8F0FF" />
      
      {/* Rim light */}
      <directionalLight position={[0, 12, -18]} intensity={0.12} color="#FFFFFF" />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[plotWidth * 1.8, plotDepth * 1.8]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.98} />
      </mesh>

      {/* Foundation */}
      <mesh position={[0, -0.04, 0]} receiveShadow castShadow>
        <boxGeometry args={[plotWidth * 0.96, 0.06, plotDepth * 0.96]} />
        <meshStandardMaterial color="#D8D4CC" roughness={0.88} />
      </mesh>

      {/* Rooms with exact dimensions */}
      {rooms.map((room, index) => (
        <DimensionLockedRoom key={`${room.name}-${index}`} room={room} />
      ))}

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.32}
        scale={Math.max(plotWidth, plotDepth) * 1.6}
        blur={2}
        far={10}
        color="#4A4040"
      />

      <Environment preset="apartment" />
    </>
  );
};

// ============================================================================
// MAIN EXPORT
// ============================================================================

export default function DimensionLocked3D({
  rooms = [],
  plotWidth = 12,
  plotDepth = 18,
}: DimensionLocked3DProps) {
  return (
    <Canvas
      shadows
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: "linear-gradient(180deg, #F8F6F2 0%, #EDE8E0 100%)" }}
    >
      <Scene rooms={rooms} plotWidth={plotWidth} plotDepth={plotDepth} />
    </Canvas>
  );
}
