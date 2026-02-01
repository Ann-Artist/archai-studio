import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Environment } from "@react-three/drei";
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

// Material colors
const WALL_COLOR = "#E8E4DC";
const WALL_INTERIOR = "#D8D4CC";

// Floor materials based on room type
const getFloorConfig = (roomName: string) => {
  const name = roomName.toLowerCase();
  if (name.includes("kitchen") || name.includes("bathroom")) {
    return { color: "#D8D0C8", pattern: "tile" };
  }
  if (name.includes("meeting") || name.includes("office")) {
    return { color: "#B8A890", pattern: "carpet" };
  }
  return { color: "#C8B090", pattern: "wood" };
};

// Wood plank floor component
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
  
  return (
    <group position={position}>
      {Array.from({ length: plankCount }).map((_, i) => (
        <mesh 
          key={i}
          position={[-width/2 + plankWidth/2 + i * plankWidth, 0.002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[plankWidth - 0.015, depth - 0.02]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#D4B896" : "#C8A878"} 
            roughness={0.75} 
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
          <planeGeometry args={[0.008, depth]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// Tile floor component
const TileFloor = ({ 
  width, 
  depth, 
  position 
}: { 
  width: number; 
  depth: number; 
  position: [number, number, number];
}) => {
  const tileSize = 0.4;
  const tilesX = Math.ceil(width / tileSize);
  const tilesZ = Math.ceil(depth / tileSize);
  
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#E8E0D8" roughness={0.4} />
      </mesh>
      {/* Grout lines */}
      {Array.from({ length: tilesX + 1 }).map((_, i) => (
        <mesh 
          key={`vline-${i}`}
          position={[-width/2 + i * tileSize, 0.002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.01, depth]} />
          <meshStandardMaterial color="#C8C0B8" roughness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: tilesZ + 1 }).map((_, i) => (
        <mesh 
          key={`hline-${i}`}
          position={[0, 0.002, -depth/2 + i * tileSize]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[width, 0.01]} />
          <meshStandardMaterial color="#C8C0B8" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Carpet floor component
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
        <meshStandardMaterial color="#9A8B7A" roughness={0.95} />
      </mesh>
      {/* Carpet border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[Math.min(width, depth) * 0.48, Math.min(width, depth) * 0.49, 4]} />
        <meshStandardMaterial color="#8A7B6A" roughness={0.95} />
      </mesh>
    </group>
  );
};

// Wall segment with exact dimensions
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
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>
      {/* Top edge highlight */}
      <mesh position={[0, height / 2 - 0.01, 0]}>
        <boxGeometry args={[length + thickness, 0.02, thickness + 0.01]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.7} />
      </mesh>
      {/* Baseboard */}
      <mesh position={[0, -height / 2 + 0.04, thickness / 2 + 0.005]} castShadow>
        <boxGeometry args={[length + thickness, 0.08, 0.015]} />
        <meshStandardMaterial color="#D8D0C0" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Furniture components
const Sofa = ({ position, rotation = 0, scale = 1 }: { position: [number, number, number]; rotation?: number; scale?: number }) => (
  <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    <mesh position={[0, 0.18, 0]} castShadow>
      <boxGeometry args={[1.8, 0.36, 0.8]} />
      <meshStandardMaterial color="#6B7A68" roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.45, -0.3]} castShadow>
      <boxGeometry args={[1.8, 0.4, 0.2]} />
      <meshStandardMaterial color="#5A6958" roughness={0.85} />
    </mesh>
    <mesh position={[-0.82, 0.32, 0]} castShadow>
      <boxGeometry args={[0.16, 0.28, 0.8]} />
      <meshStandardMaterial color="#5A6958" roughness={0.85} />
    </mesh>
    <mesh position={[0.82, 0.32, 0]} castShadow>
      <boxGeometry args={[0.16, 0.28, 0.8]} />
      <meshStandardMaterial color="#5A6958" roughness={0.85} />
    </mesh>
  </group>
);

const CoffeeTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.32, 0]} castShadow>
      <boxGeometry args={[0.8, 0.04, 0.45]} />
      <meshStandardMaterial color="#5A4530" roughness={0.6} />
    </mesh>
    {[[-0.35, -0.18], [0.35, -0.18], [-0.35, 0.18], [0.35, 0.18]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.15, pos[1]]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#4A3520" roughness={0.7} />
      </mesh>
    ))}
  </group>
);

const TVUnit = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[1.4, 0.5, 0.4]} />
      <meshStandardMaterial color="#4A4040" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.75, 0.05]} castShadow>
      <boxGeometry args={[1.0, 0.6, 0.04]} />
      <meshStandardMaterial color="#1A1A1A" roughness={0.3} />
    </mesh>
  </group>
);

const Plant = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.1, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.08, 0.2, 12]} />
      <meshStandardMaterial color="#C4A880" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.35, 0]} castShadow>
      <sphereGeometry args={[0.18, 12, 12]} />
      <meshStandardMaterial color="#4A7050" roughness={0.9} />
    </mesh>
  </group>
);

const Bed = ({ position, rotation = 0, isDouble = true }: { position: [number, number, number]; rotation?: number; isDouble?: boolean }) => {
  const width = isDouble ? 1.6 : 1.0;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[width, 0.3, 2.0]} />
        <meshStandardMaterial color="#5A4030" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, -0.92]} castShadow>
        <boxGeometry args={[width, 0.7, 0.08]} />
        <meshStandardMaterial color="#4A3020" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[width - 0.1, 0.12, 1.85]} />
        <meshStandardMaterial color="#F8F6F0" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.43, 0.2]} castShadow>
        <boxGeometry args={[width - 0.12, 0.08, 1.2]} />
        <meshStandardMaterial color="#4A6048" roughness={0.95} />
      </mesh>
      <mesh position={[-0.35, 0.44, -0.6]} castShadow>
        <boxGeometry args={[0.45, 0.08, 0.32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      {isDouble && (
        <mesh position={[0.35, 0.44, -0.6]} castShadow>
          <boxGeometry args={[0.45, 0.08, 0.32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
        </mesh>
      )}
    </group>
  );
};

const Nightstand = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.22, 0]} castShadow>
      <boxGeometry args={[0.4, 0.44, 0.35]} />
      <meshStandardMaterial color="#5A4030" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.48, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
      <meshStandardMaterial color="#8B7355" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.58, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.1, 0.12, 12]} />
      <meshStandardMaterial color="#F5E8D0" roughness={0.9} transparent opacity={0.9} />
    </mesh>
  </group>
);

const Wardrobe = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.65, 0]} castShadow>
      <boxGeometry args={[1.2, 1.3, 0.5]} />
      <meshStandardMaterial color="#5A4030" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.65, 0.26]} castShadow>
      <boxGeometry args={[0.02, 1.2, 0.02]} />
      <meshStandardMaterial color="#3A2515" roughness={0.6} />
    </mesh>
  </group>
);

const KitchenCounter = ({ position, rotation = 0, width = 2.5 }: { position: [number, number, number]; rotation?: number; width?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[width, 0.84, 0.55]} />
      <meshStandardMaterial color="#8B7355" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.86, 0]} castShadow>
      <boxGeometry args={[width + 0.05, 0.04, 0.6]} />
      <meshStandardMaterial color="#E8E0D8" roughness={0.35} />
    </mesh>
    <mesh position={[width * 0.25, 0.87, 0]} castShadow>
      <boxGeometry args={[0.45, 0.02, 0.35]} />
      <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
    </mesh>
    <mesh position={[-width * 0.3, 0.89, 0]} castShadow>
      <boxGeometry args={[0.5, 0.02, 0.4]} />
      <meshStandardMaterial color="#2A2A2A" roughness={0.4} />
    </mesh>
  </group>
);

const Refrigerator = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.8, 0]} castShadow>
      <boxGeometry args={[0.65, 1.6, 0.6]} />
      <meshStandardMaterial color="#E8E8E8" roughness={0.3} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.5, 0.31]} castShadow>
      <boxGeometry args={[0.6, 0.02, 0.01]} />
      <meshStandardMaterial color="#D0D0D0" roughness={0.3} />
    </mesh>
  </group>
);

const MeetingTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.72, 0]} castShadow>
      <boxGeometry args={[2.0, 0.05, 0.9]} />
      <meshStandardMaterial color="#5A4530" roughness={0.55} />
    </mesh>
    {[[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.35, pos[1]]} castShadow>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#4A3520" roughness={0.7} />
      </mesh>
    ))}
  </group>
);

const OfficeChair = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[0.42, 0.05, 0.4]} />
      <meshStandardMaterial color="#3A3A3A" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.7, -0.18]} castShadow>
      <boxGeometry args={[0.4, 0.5, 0.04]} />
      <meshStandardMaterial color="#3A3A3A" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.2, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
      <meshStandardMaterial color="#505050" roughness={0.4} metalness={0.6} />
    </mesh>
    <mesh position={[0, 0.02, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.2, 0.04, 5]} />
      <meshStandardMaterial color="#404040" roughness={0.5} />
    </mesh>
  </group>
);

// Dimension-locked room component
const DimensionLockedRoom = ({ room }: { room: RoomConfig }) => {
  const { name, width, depth, position } = room;
  const roomX = position[0];
  const roomZ = position[2];
  const floorConfig = getFloorConfig(name);
  const roomName = name.toLowerCase();

  // Calculate exact wall positions
  const halfW = width / 2;
  const halfD = depth / 2;

  // Furniture placement based on room type
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
      const scale = Math.min(width / 5, depth / 4, 1);
      return (
        <>
          <Bed position={[0, 0, -depth * 0.15]} rotation={0} isDouble={roomName.includes("master")} />
          <Nightstand position={[-width * 0.35, 0, -depth * 0.15]} />
          <Nightstand position={[width * 0.35, 0, -depth * 0.15]} />
          <Wardrobe position={[width * 0.3, 0, depth * 0.35]} rotation={Math.PI} />
        </>
      );
    }

    if (roomName.includes("kitchen")) {
      const counterWidth = Math.min(width * 0.8, 2.5);
      return (
        <>
          <KitchenCounter position={[0, 0, -depth * 0.3]} rotation={0} width={counterWidth} />
          <Refrigerator position={[width * 0.35, 0, depth * 0.25]} rotation={Math.PI} />
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
      {/* Back wall (north) */}
      <ExactWall 
        start={[-halfW, -halfD]} 
        end={[halfW, -halfD]} 
        height={WALL_HEIGHT}
      />
      {/* Front wall (south) */}
      <ExactWall 
        start={[-halfW, halfD]} 
        end={[halfW, halfD]} 
        height={WALL_HEIGHT * 0.4}
      />
      {/* Left wall (west) */}
      <ExactWall 
        start={[-halfW, -halfD]} 
        end={[-halfW, halfD]} 
        height={WALL_HEIGHT}
      />
      {/* Right wall (east) */}
      <ExactWall 
        start={[halfW, -halfD]} 
        end={[halfW, halfD]} 
        height={WALL_HEIGHT * 0.4}
      />

      {/* Furniture */}
      {renderFurniture()}
    </group>
  );
};

// Main scene
const Scene = ({ 
  rooms, 
  plotWidth, 
  plotDepth 
}: { 
  rooms: RoomConfig[]; 
  plotWidth: number; 
  plotDepth: number;
}) => {
  const cameraDistance = Math.max(plotWidth, plotDepth) * 1.5;
  
  return (
    <>
      {/* Orthographic camera - strict top-down */}
      <OrthographicCamera
        makeDefault
        position={[0, cameraDistance, 0]}
        zoom={35}
        near={0.1}
        far={cameraDistance * 3}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Lighting - soft shadows for realism */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 30, 10]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-plotWidth}
        shadow-camera-right={plotWidth}
        shadow-camera-top={plotDepth}
        shadow-camera-bottom={-plotDepth}
      />
      <directionalLight position={[-5, 15, -5]} intensity={0.3} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[plotWidth * 1.5, plotDepth * 1.5]} />
        <meshStandardMaterial color="#E0D8D0" roughness={0.95} />
      </mesh>

      {/* Foundation/base */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[plotWidth * 0.95, 0.08, plotDepth * 0.95]} />
        <meshStandardMaterial color="#D0C8C0" roughness={0.85} />
      </mesh>

      {/* Render rooms with exact dimensions */}
      {rooms.map((room, index) => (
        <DimensionLockedRoom key={`${room.name}-${index}`} room={room} />
      ))}

      <Environment preset="apartment" />
    </>
  );
};

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
        toneMappingExposure: 1.1
      }}
      style={{ background: "#F5F2EE" }}
    >
      <Scene rooms={rooms} plotWidth={plotWidth} plotDepth={plotDepth} />
    </Canvas>
  );
}
