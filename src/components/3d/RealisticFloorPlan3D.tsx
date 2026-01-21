import { useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Grid, 
  Text, 
  PerspectiveCamera,
  ContactShadows,
  PointerLockControls,
  Sky
} from "@react-three/drei";
import * as THREE from "three";
import {
  Sofa,
  CoffeeTable,
  TVUnit,
  Bed,
  SmallBed,
  Nightstand,
  Wardrobe,
  KitchenCounter,
  UpperCabinets,
  Refrigerator,
  DiningTable,
  Chair,
  Toilet,
  Bathtub,
  BathroomSink,
  ShoeRack,
  CoatRack,
  Rug,
  Plant,
  Desk,
  OfficeChair,
} from "./Furniture";
import { ScaleIndicator, PlotDimensions, EnhancedCompass } from "./ScaleIndicator";
import { Door, Window, SlidingDoor, BathroomWindow } from "./DoorsAndWindows";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

export interface RealisticFloorPlan3DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
  viewMode?: "realistic" | "wireframe";
  transparentWalls?: boolean;
  showLabels?: boolean;
  enableFirstPerson?: boolean;
}

// Material definitions for realistic rendering
const MATERIALS = {
  wall: {
    color: "#f5f5f4",
    roughness: 0.9,
    metalness: 0.0,
  },
  ceiling: {
    color: "#fafaf9",
    roughness: 0.95,
    metalness: 0.0,
  },
  baseboard: {
    color: "#e7e5e4",
    roughness: 0.7,
    metalness: 0.0,
  },
};

const WALL_THICKNESS = 0.15;
const BASEBOARD_HEIGHT = 0.1;
const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.1;
const WINDOW_WIDTH = 1.2;
const WINDOW_HEIGHT = 1.2;
const WINDOW_SILL_HEIGHT = 0.9;

// Wall segment with optional door/window openings
const WallSegmentWithOpenings = ({
  start,
  end,
  height,
  isWireframe,
  isTransparent,
  hasDoor = false,
  hasWindow = false,
  doorPosition = 0.5, // 0-1 position along wall
  windowPosition = 0.5,
}: {
  start: [number, number];
  end: [number, number];
  height: number;
  isWireframe: boolean;
  isTransparent: boolean;
  hasDoor?: boolean;
  hasWindow?: boolean;
  doorPosition?: number;
  windowPosition?: number;
}) => {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[1] + end[1]) / 2;

  // Calculate door and window positions along wall
  const doorOffset = (doorPosition - 0.5) * (length - DOOR_WIDTH - 0.5);
  const windowOffset = (windowPosition - 0.5) * (length - WINDOW_WIDTH - 0.5);

  if (isWireframe) {
    return (
      <group position={[midX, height / 2, midZ]} rotation={[0, -angle, 0]}>
        <mesh>
          <boxGeometry args={[length, height, WALL_THICKNESS]} />
          <meshBasicMaterial color="#1e3a5f" wireframe />
        </mesh>
      </group>
    );
  }

  // If no openings, render simple wall
  if (!hasDoor && !hasWindow) {
    return (
      <group position={[midX, height / 2, midZ]} rotation={[0, -angle, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length, height, WALL_THICKNESS]} />
          <meshStandardMaterial
            color={MATERIALS.wall.color}
            roughness={MATERIALS.wall.roughness}
            metalness={MATERIALS.wall.metalness}
            transparent={isTransparent}
            opacity={isTransparent ? 0.3 : 1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Baseboard */}
        <mesh position={[0, -height / 2 + BASEBOARD_HEIGHT / 2, WALL_THICKNESS / 2 + 0.01]} castShadow>
          <boxGeometry args={[length, BASEBOARD_HEIGHT, 0.02]} />
          <meshStandardMaterial color={MATERIALS.baseboard.color} roughness={MATERIALS.baseboard.roughness} />
        </mesh>
      </group>
    );
  }

  // Wall with door opening
  if (hasDoor && !hasWindow) {
    const leftWidth = (length / 2 + doorOffset - DOOR_WIDTH / 2);
    const rightWidth = (length / 2 - doorOffset - DOOR_WIDTH / 2);
    const topHeight = height - DOOR_HEIGHT;

    return (
      <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
        {/* Left wall section */}
        {leftWidth > 0.1 && (
          <mesh position={[-length / 2 + leftWidth / 2, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[leftWidth, height, WALL_THICKNESS]} />
            <meshStandardMaterial
              color={MATERIALS.wall.color}
              roughness={MATERIALS.wall.roughness}
              transparent={isTransparent}
              opacity={isTransparent ? 0.3 : 1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Right wall section */}
        {rightWidth > 0.1 && (
          <mesh position={[length / 2 - rightWidth / 2, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[rightWidth, height, WALL_THICKNESS]} />
            <meshStandardMaterial
              color={MATERIALS.wall.color}
              roughness={MATERIALS.wall.roughness}
              transparent={isTransparent}
              opacity={isTransparent ? 0.3 : 1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Top section above door */}
        {topHeight > 0.1 && (
          <mesh position={[doorOffset, DOOR_HEIGHT + topHeight / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[DOOR_WIDTH + 0.2, topHeight, WALL_THICKNESS]} />
            <meshStandardMaterial
              color={MATERIALS.wall.color}
              roughness={MATERIALS.wall.roughness}
              transparent={isTransparent}
              opacity={isTransparent ? 0.3 : 1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Door */}
        <Door position={[doorOffset, 0, 0]} rotation={0} />
        
        {/* Baseboards */}
        {leftWidth > 0.1 && (
          <mesh position={[-length / 2 + leftWidth / 2, BASEBOARD_HEIGHT / 2, WALL_THICKNESS / 2 + 0.01]} castShadow>
            <boxGeometry args={[leftWidth, BASEBOARD_HEIGHT, 0.02]} />
            <meshStandardMaterial color={MATERIALS.baseboard.color} roughness={MATERIALS.baseboard.roughness} />
          </mesh>
        )}
        {rightWidth > 0.1 && (
          <mesh position={[length / 2 - rightWidth / 2, BASEBOARD_HEIGHT / 2, WALL_THICKNESS / 2 + 0.01]} castShadow>
            <boxGeometry args={[rightWidth, BASEBOARD_HEIGHT, 0.02]} />
            <meshStandardMaterial color={MATERIALS.baseboard.color} roughness={MATERIALS.baseboard.roughness} />
          </mesh>
        )}
      </group>
    );
  }

  // Wall with window opening
  if (hasWindow && !hasDoor) {
    const leftWidth = (length / 2 + windowOffset - WINDOW_WIDTH / 2);
    const rightWidth = (length / 2 - windowOffset - WINDOW_WIDTH / 2);
    const topHeight = height - WINDOW_SILL_HEIGHT - WINDOW_HEIGHT;

    return (
      <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
        {/* Left wall section */}
        {leftWidth > 0.1 && (
          <mesh position={[-length / 2 + leftWidth / 2, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[leftWidth, height, WALL_THICKNESS]} />
            <meshStandardMaterial
              color={MATERIALS.wall.color}
              roughness={MATERIALS.wall.roughness}
              transparent={isTransparent}
              opacity={isTransparent ? 0.3 : 1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Right wall section */}
        {rightWidth > 0.1 && (
          <mesh position={[length / 2 - rightWidth / 2, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[rightWidth, height, WALL_THICKNESS]} />
            <meshStandardMaterial
              color={MATERIALS.wall.color}
              roughness={MATERIALS.wall.roughness}
              transparent={isTransparent}
              opacity={isTransparent ? 0.3 : 1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Bottom section below window */}
        <mesh position={[windowOffset, WINDOW_SILL_HEIGHT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[WINDOW_WIDTH + 0.2, WINDOW_SILL_HEIGHT, WALL_THICKNESS]} />
          <meshStandardMaterial
            color={MATERIALS.wall.color}
            roughness={MATERIALS.wall.roughness}
            transparent={isTransparent}
            opacity={isTransparent ? 0.3 : 1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Top section above window */}
        {topHeight > 0.1 && (
          <mesh position={[windowOffset, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT + topHeight / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[WINDOW_WIDTH + 0.2, topHeight, WALL_THICKNESS]} />
            <meshStandardMaterial
              color={MATERIALS.wall.color}
              roughness={MATERIALS.wall.roughness}
              transparent={isTransparent}
              opacity={isTransparent ? 0.3 : 1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Window */}
        <Window position={[windowOffset, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT / 2, 0]} rotation={0} />
        
        {/* Baseboard */}
        <mesh position={[0, BASEBOARD_HEIGHT / 2, WALL_THICKNESS / 2 + 0.01]} castShadow>
          <boxGeometry args={[length, BASEBOARD_HEIGHT, 0.02]} />
          <meshStandardMaterial color={MATERIALS.baseboard.color} roughness={MATERIALS.baseboard.roughness} />
        </mesh>
      </group>
    );
  }

  // Default: both door and window
  return (
    <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, height, WALL_THICKNESS]} />
        <meshStandardMaterial
          color={MATERIALS.wall.color}
          roughness={MATERIALS.wall.roughness}
          transparent={isTransparent}
          opacity={isTransparent ? 0.3 : 1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Determine wall openings based on room type
const getWallOpenings = (roomName: string, wallIndex: number): { hasDoor: boolean; hasWindow: boolean; doorPos: number; windowPos: number } => {
  const name = roomName.toLowerCase();
  
  // Living room - door on one wall, windows on two walls, sliding door on one
  if (name.includes("living")) {
    if (wallIndex === 0) return { hasDoor: false, hasWindow: true, doorPos: 0.5, windowPos: 0.3 };
    if (wallIndex === 1) return { hasDoor: false, hasWindow: true, doorPos: 0.5, windowPos: 0.7 };
    if (wallIndex === 2) return { hasDoor: true, hasWindow: false, doorPos: 0.3, windowPos: 0.5 };
    return { hasDoor: false, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
  }
  
  // Kitchen - door and window
  if (name.includes("kitchen")) {
    if (wallIndex === 0) return { hasDoor: false, hasWindow: true, doorPos: 0.5, windowPos: 0.5 };
    if (wallIndex === 2) return { hasDoor: true, hasWindow: false, doorPos: 0.6, windowPos: 0.5 };
    return { hasDoor: false, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
  }
  
  // Master Bedroom - door and windows
  if (name.includes("master") || (name.includes("bedroom") && !name.includes("2"))) {
    if (wallIndex === 0) return { hasDoor: false, hasWindow: true, doorPos: 0.5, windowPos: 0.5 };
    if (wallIndex === 1) return { hasDoor: false, hasWindow: true, doorPos: 0.5, windowPos: 0.5 };
    if (wallIndex === 3) return { hasDoor: true, hasWindow: false, doorPos: 0.7, windowPos: 0.5 };
    return { hasDoor: false, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
  }
  
  // Bedroom 2 - door and one window
  if (name.includes("bedroom 2") || name.includes("bedroom2") || name.includes("guest")) {
    if (wallIndex === 1) return { hasDoor: false, hasWindow: true, doorPos: 0.5, windowPos: 0.5 };
    if (wallIndex === 2) return { hasDoor: true, hasWindow: false, doorPos: 0.4, windowPos: 0.5 };
    return { hasDoor: false, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
  }
  
  // Bathroom - door and small window
  if (name.includes("bathroom") || name.includes("bath") || name.includes("wc")) {
    if (wallIndex === 0) return { hasDoor: false, hasWindow: true, doorPos: 0.5, windowPos: 0.5 };
    if (wallIndex === 3) return { hasDoor: true, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
    return { hasDoor: false, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
  }
  
  // Entrance - main door
  if (name.includes("entrance") || name.includes("hall") || name.includes("foyer")) {
    if (wallIndex === 1) return { hasDoor: true, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
    if (wallIndex === 3) return { hasDoor: true, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
    return { hasDoor: false, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
  }
  
  return { hasDoor: false, hasWindow: false, doorPos: 0.5, windowPos: 0.5 };
};

// Get furniture for a room based on its name
const RoomFurniture = ({ room, isWireframe }: { room: RoomConfig; isWireframe: boolean }) => {
  if (isWireframe) return null;
  
  const roomName = room.name.toLowerCase();
  const baseX = room.position[0];
  const baseZ = room.position[2];
  const floorY = 0.01;
  
  // Living Room
  if (roomName.includes("living")) {
    return (
      <group>
        <Sofa position={[baseX, floorY, baseZ + room.depth / 4]} rotation={0} />
        <CoffeeTable position={[baseX, floorY, baseZ - 0.3]} />
        <TVUnit position={[baseX, floorY, baseZ - room.depth / 3]} rotation={0} />
        <Rug position={[baseX, floorY, baseZ]} color="#8b6b5b" />
        <Plant position={[baseX + room.width / 3, floorY, baseZ + room.depth / 3]} scale={0.8} />
      </group>
    );
  }
  
  // Kitchen
  if (roomName.includes("kitchen")) {
    return (
      <group>
        <KitchenCounter position={[baseX, floorY, baseZ - room.depth / 4]} rotation={0} />
        <UpperCabinets position={[baseX, floorY, baseZ - room.depth / 4]} rotation={0} />
        <Refrigerator position={[baseX + room.width / 3, floorY, baseZ - room.depth / 4]} />
        <DiningTable position={[baseX - 0.3, floorY, baseZ + room.depth / 5]} scale={0.9} />
        <Chair position={[baseX - 0.3, floorY, baseZ + room.depth / 5 + 0.5]} rotation={0} scale={0.9} />
        <Chair position={[baseX - 0.3, floorY, baseZ + room.depth / 5 - 0.5]} rotation={Math.PI} scale={0.9} />
      </group>
    );
  }
  
  // Master Bedroom
  if (roomName.includes("master") || (roomName.includes("bedroom") && !roomName.includes("2"))) {
    return (
      <group>
        <Bed position={[baseX, floorY, baseZ - room.depth / 6]} rotation={0} />
        <Nightstand position={[baseX - room.width / 3, floorY, baseZ - room.depth / 4]} rotation={0} />
        <Nightstand position={[baseX + room.width / 3, floorY, baseZ - room.depth / 4]} rotation={0} />
        <Wardrobe position={[baseX + room.width / 3 - 0.2, floorY, baseZ + room.depth / 3]} rotation={Math.PI} />
        <Rug position={[baseX, floorY, baseZ + 0.3]} color="#9b8b7b" scale={1.2} />
      </group>
    );
  }
  
  // Bedroom 2
  if (roomName.includes("bedroom 2") || roomName.includes("bedroom2") || roomName.includes("guest")) {
    return (
      <group>
        <SmallBed position={[baseX - room.width / 6, floorY, baseZ - room.depth / 6]} rotation={0} />
        <Nightstand position={[baseX + room.width / 4, floorY, baseZ - room.depth / 5]} scale={0.9} />
        <Desk position={[baseX, floorY, baseZ + room.depth / 4]} rotation={Math.PI} scale={0.9} />
        <OfficeChair position={[baseX, floorY, baseZ + room.depth / 4 + 0.5]} rotation={Math.PI} scale={0.9} />
        <Plant position={[baseX + room.width / 3, floorY, baseZ + room.depth / 4]} scale={0.7} />
      </group>
    );
  }
  
  // Bathroom
  if (roomName.includes("bathroom") || roomName.includes("bath") || roomName.includes("wc")) {
    return (
      <group>
        <Toilet position={[baseX - room.width / 4, floorY, baseZ + room.depth / 4]} rotation={0} scale={0.9} />
        <BathroomSink position={[baseX + room.width / 5, floorY, baseZ - room.depth / 4]} rotation={0} scale={0.9} />
        <Bathtub position={[baseX - room.width / 5, floorY, baseZ - room.depth / 6]} rotation={Math.PI / 2} scale={0.8} />
      </group>
    );
  }
  
  // Entrance
  if (roomName.includes("entrance") || roomName.includes("hall") || roomName.includes("foyer")) {
    return (
      <group>
        <ShoeRack position={[baseX - room.width / 4, floorY, baseZ]} rotation={Math.PI / 2} scale={0.8} />
        <CoatRack position={[baseX + room.width / 4, floorY, baseZ - room.depth / 4]} scale={0.8} />
        <Plant position={[baseX + room.width / 4, floorY, baseZ + room.depth / 4]} scale={0.6} />
      </group>
    );
  }
  
  return null;
};

// Room component with walls, floor, ceiling, and openings
const Room = ({
  room,
  isWireframe,
  isTransparent,
  showLabel,
}: {
  room: RoomConfig;
  isWireframe: boolean;
  isTransparent: boolean;
  showLabel: boolean;
}) => {
  const { name, width, depth, height, position, color } = room;
  const [hovered, setHovered] = useState(false);

  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const baseX = position[0];
  const baseZ = position[2];

  // Wall segments with openings
  const walls: Array<{ start: [number, number]; end: [number, number]; index: number }> = [
    { start: [baseX - halfWidth, baseZ - halfDepth], end: [baseX + halfWidth, baseZ - halfDepth], index: 0 },
    { start: [baseX - halfWidth, baseZ + halfDepth], end: [baseX + halfWidth, baseZ + halfDepth], index: 1 },
    { start: [baseX - halfWidth, baseZ - halfDepth], end: [baseX - halfWidth, baseZ + halfDepth], index: 2 },
    { start: [baseX + halfWidth, baseZ - halfDepth], end: [baseX + halfWidth, baseZ + halfDepth], index: 3 },
  ];

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Floor */}
      <mesh
        position={[baseX, 0.01, baseZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width - WALL_THICKNESS * 2, depth - WALL_THICKNESS * 2]} />
        {isWireframe ? (
          <meshBasicMaterial color={hovered ? "#3b82f6" : color} wireframe />
        ) : (
          <meshStandardMaterial
            color={hovered ? "#d4a574" : color}
            roughness={0.8}
            metalness={0.0}
            transparent
            opacity={0.95}
          />
        )}
      </mesh>

      {/* Ceiling */}
      <mesh
        position={[baseX, height - 0.01, baseZ]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width - WALL_THICKNESS * 2, depth - WALL_THICKNESS * 2]} />
        {isWireframe ? (
          <meshBasicMaterial color="#1e3a5f" wireframe />
        ) : (
          <meshStandardMaterial
            color={MATERIALS.ceiling.color}
            roughness={MATERIALS.ceiling.roughness}
            metalness={MATERIALS.ceiling.metalness}
            transparent={isTransparent}
            opacity={isTransparent ? 0.2 : 1}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Walls with openings */}
      {walls.map((wall) => {
        const openings = getWallOpenings(name, wall.index);
        return (
          <WallSegmentWithOpenings
            key={wall.index}
            start={wall.start}
            end={wall.end}
            height={height}
            isWireframe={isWireframe}
            isTransparent={isTransparent || hovered}
            hasDoor={openings.hasDoor}
            hasWindow={openings.hasWindow}
            doorPosition={openings.doorPos}
            windowPosition={openings.windowPos}
          />
        );
      })}

      {/* Room label */}
      {showLabel && (
        <group position={[baseX, height / 2, baseZ]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.4}
            color={isWireframe ? "#1e3a5f" : "#374151"}
            anchorX="center"
            anchorY="middle"
          >
            {name}
          </Text>
          <Text
            position={[0, 0, 0]}
            fontSize={0.25}
            color={isWireframe ? "#64748b" : "#6b7280"}
            anchorX="center"
            anchorY="middle"
          >
            {`${width.toFixed(1)}m × ${depth.toFixed(1)}m`}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.2}
            color={isWireframe ? "#94a3b8" : "#9ca3af"}
            anchorX="center"
            anchorY="middle"
          >
            {`${(width * depth).toFixed(1)}m²`}
          </Text>
        </group>
      )}

      {/* Furniture */}
      <RoomFurniture room={room} isWireframe={isWireframe} />
    </group>
  );
};

// Ground plane
const GroundPlane = ({
  width,
  depth,
  isWireframe,
}: {
  width: number;
  depth: number;
  isWireframe: boolean;
}) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[width + 4, depth + 4]} />
      {isWireframe ? (
        <meshBasicMaterial color="#e2e8f0" />
      ) : (
        <meshStandardMaterial color="#e7e5e4" roughness={1} metalness={0} />
      )}
    </mesh>
  );
};

// First person camera
const FirstPersonCamera = () => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    velocity.current.x *= 0.9;
    velocity.current.z *= 0.9;
    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={75} />
      <PointerLockControls />
    </>
  );
};

// Orbit camera
const OrbitCamera = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[18, 14, 18]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </>
  );
};

// Main scene
const RealisticFloorPlan3DScene = ({
  rooms = [],
  plotWidth = 20,
  plotDepth = 16,
  viewMode = "realistic",
  transparentWalls = false,
  showLabels = true,
  enableFirstPerson = false,
}: RealisticFloorPlan3DProps) => {
  const isWireframe = viewMode === "wireframe";

  return (
    <>
      {enableFirstPerson ? <FirstPersonCamera /> : <OrbitCamera />}

      <ambientLight intensity={isWireframe ? 0.8 : 0.5} />
      
      {!isWireframe && (
        <>
          <Sky distance={450000} sunPosition={[100, 50, 100]} inclination={0.5} azimuth={0.25} />
          <directionalLight
            position={[15, 25, 15]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={100}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          <directionalLight position={[-10, 15, -10]} intensity={0.4} />
          <hemisphereLight args={["#87CEEB", "#8B4513", 0.4]} />
          <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={60} blur={1.5} far={25} />
        </>
      )}

      <GroundPlane width={plotWidth} depth={plotDepth} isWireframe={isWireframe} />

      <Grid
        position={[0, 0.02, 0]}
        args={[plotWidth, plotDepth]}
        cellSize={1}
        cellThickness={0.5}
        cellColor={isWireframe ? "#64748b" : "#a8a29e"}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={isWireframe ? "#475569" : "#78716c"}
        fadeDistance={60}
        fadeStrength={1}
        followCamera={false}
      />

      {rooms.map((room, index) => (
        <Room
          key={index}
          room={room}
          isWireframe={isWireframe}
          isTransparent={transparentWalls}
          showLabel={showLabels}
        />
      ))}

      <EnhancedCompass position={[plotWidth / 2 - 1.5, 0.05, plotDepth / 2 - 1.5]} isWireframe={isWireframe} />
      <ScaleIndicator position={[-plotWidth / 2 + 3, 0.05, plotDepth / 2 + 1]} length={5} isWireframe={isWireframe} />
      <PlotDimensions plotWidth={plotWidth} plotDepth={plotDepth} isWireframe={isWireframe} />

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(plotWidth, 0.1, plotDepth)]} />
        <lineBasicMaterial color={isWireframe ? "#1e3a5f" : "#78716c"} />
      </lineSegments>
    </>
  );
};

const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 6, depth: 5, height: 3, position: [-3, 1.5, 0], color: "#d4a574" },
  { name: "Kitchen", width: 4, depth: 4, height: 3, position: [3, 1.5, -2], color: "#c4b5a3" },
  { name: "Master Bedroom", width: 5, depth: 4, height: 3, position: [-2, 1.5, -5], color: "#b8a88a" },
  { name: "Bedroom 2", width: 4, depth: 3.5, height: 3, position: [3.5, 1.5, 2.5], color: "#c9b896" },
  { name: "Bathroom", width: 3, depth: 2.5, height: 3, position: [4, 1.5, -6], color: "#a8c4c4" },
  { name: "Entrance", width: 2, depth: 2, height: 3, position: [-6, 1.5, 3], color: "#b5c4a8" },
];

const RealisticFloorPlan3D = (props: RealisticFloorPlan3DProps) => {
  const roomsToRender = props.rooms && props.rooms.length > 0 ? props.rooms : defaultRooms;

  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-100 to-stone-100 rounded-xl overflow-hidden">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <RealisticFloorPlan3DScene {...props} rooms={roomsToRender} />
      </Canvas>
    </div>
  );
};

export default RealisticFloorPlan3D;
