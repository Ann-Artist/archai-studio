import { useRef, useState, useMemo } from "react";
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
  floor: {
    color: "#d4a574",
    roughness: 0.8,
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

// Create a single wall segment
const WallSegment = ({
  start,
  end,
  height,
  isWireframe,
  isTransparent,
}: {
  start: [number, number];
  end: [number, number];
  height: number;
  isWireframe: boolean;
  isTransparent: boolean;
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
        <boxGeometry args={[length, height, WALL_THICKNESS]} />
        {isWireframe ? (
          <meshBasicMaterial color="#1e3a5f" wireframe />
        ) : (
          <meshStandardMaterial
            color={MATERIALS.wall.color}
            roughness={MATERIALS.wall.roughness}
            metalness={MATERIALS.wall.metalness}
            transparent={isTransparent}
            opacity={isTransparent ? 0.3 : 1}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Baseboard */}
      {!isWireframe && (
        <mesh position={[0, -height / 2 + BASEBOARD_HEIGHT / 2, WALL_THICKNESS / 2 + 0.01]} castShadow>
          <boxGeometry args={[length, BASEBOARD_HEIGHT, 0.02]} />
          <meshStandardMaterial
            color={MATERIALS.baseboard.color}
            roughness={MATERIALS.baseboard.roughness}
          />
        </mesh>
      )}
    </group>
  );
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
  
  // Bedroom 2 / Secondary Bedroom
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
  
  // Entrance / Hallway / Foyer
  if (roomName.includes("entrance") || roomName.includes("hall") || roomName.includes("foyer")) {
    return (
      <group>
        <ShoeRack position={[baseX - room.width / 4, floorY, baseZ]} rotation={Math.PI / 2} scale={0.8} />
        <CoatRack position={[baseX + room.width / 4, floorY, baseZ - room.depth / 4]} scale={0.8} />
        <Plant position={[baseX + room.width / 4, floorY, baseZ + room.depth / 4]} scale={0.6} />
      </group>
    );
  }
  
  // Study / Office
  if (roomName.includes("study") || roomName.includes("office")) {
    return (
      <group>
        <Desk position={[baseX, floorY, baseZ - room.depth / 4]} rotation={0} />
        <OfficeChair position={[baseX, floorY, baseZ]} rotation={0} />
        <Wardrobe position={[baseX + room.width / 3, floorY, baseZ - room.depth / 4]} rotation={Math.PI / 2} scale={0.8} />
        <Plant position={[baseX - room.width / 3, floorY, baseZ + room.depth / 4]} scale={0.7} />
      </group>
    );
  }
  
  // Dining Room
  if (roomName.includes("dining")) {
    return (
      <group>
        <DiningTable position={[baseX, floorY, baseZ]} scale={1.2} />
        <Chair position={[baseX - 0.6, floorY, baseZ]} rotation={Math.PI / 2} />
        <Chair position={[baseX + 0.6, floorY, baseZ]} rotation={-Math.PI / 2} />
        <Chair position={[baseX, floorY, baseZ + 0.5]} rotation={0} />
        <Chair position={[baseX, floorY, baseZ - 0.5]} rotation={Math.PI} />
        <Rug position={[baseX, floorY, baseZ]} color="#7b6b5b" scale={1.5} />
      </group>
    );
  }
  
  return null;
};

// Create room with walls, floor, and ceiling
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

  // Calculate room corners (centered on position)
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const baseX = position[0];
  const baseZ = position[2];

  // Wall segments: [start, end] for each wall
  const walls: Array<{ start: [number, number]; end: [number, number] }> = [
    // Front wall
    { start: [baseX - halfWidth, baseZ - halfDepth], end: [baseX + halfWidth, baseZ - halfDepth] },
    // Back wall
    { start: [baseX - halfWidth, baseZ + halfDepth], end: [baseX + halfWidth, baseZ + halfDepth] },
    // Left wall
    { start: [baseX - halfWidth, baseZ - halfDepth], end: [baseX - halfWidth, baseZ + halfDepth] },
    // Right wall
    { start: [baseX + halfWidth, baseZ - halfDepth], end: [baseX + halfWidth, baseZ + halfDepth] },
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

      {/* Walls */}
      {walls.map((wall, index) => (
        <WallSegment
          key={index}
          start={wall.start}
          end={wall.end}
          height={height}
          isWireframe={isWireframe}
          isTransparent={isTransparent || hovered}
        />
      ))}

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
        <meshStandardMaterial
          color="#e7e5e4"
          roughness={1}
          metalness={0}
        />
      )}
    </mesh>
  );
};

// First person camera controls
const FirstPersonCamera = () => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  useFrame((_, delta) => {
    const speed = 5;
    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.normalize();

    if (moveForward.current || moveBackward.current) {
      velocity.current.z -= direction.current.z * speed * delta;
    }
    if (moveLeft.current || moveRight.current) {
      velocity.current.x -= direction.current.x * speed * delta;
    }

    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;

    velocity.current.x *= 0.9;
    velocity.current.z *= 0.9;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={75} />
      <PointerLockControls />
    </>
  );
};

// Standard orbit camera
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

// Main 3D Scene
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

      {/* Lighting */}
      <ambientLight intensity={isWireframe ? 0.8 : 0.5} />
      
      {!isWireframe && (
        <>
          {/* Sky background */}
          <Sky
            distance={450000}
            sunPosition={[100, 50, 100]}
            inclination={0.5}
            azimuth={0.25}
          />

          {/* Main directional light (sun) */}
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
          
          {/* Fill light */}
          <directionalLight
            position={[-10, 15, -10]}
            intensity={0.4}
          />
          
          {/* Hemisphere light for ambient color */}
          <hemisphereLight
            args={["#87CEEB", "#8B4513", 0.4]}
          />

          {/* Contact shadows for realism */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.5}
            scale={60}
            blur={1.5}
            far={25}
          />
        </>
      )}

      {/* Ground plane */}
      <GroundPlane width={plotWidth} depth={plotDepth} isWireframe={isWireframe} />

      {/* Grid */}
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

      {/* Rooms */}
      {rooms.map((room, index) => (
        <Room
          key={index}
          room={room}
          isWireframe={isWireframe}
          isTransparent={transparentWalls}
          showLabel={showLabels}
        />
      ))}

      {/* Enhanced compass indicator */}
      <EnhancedCompass 
        position={[plotWidth / 2 - 1.5, 0.05, plotDepth / 2 - 1.5]} 
        isWireframe={isWireframe} 
      />

      {/* Scale indicator */}
      <ScaleIndicator 
        position={[-plotWidth / 2 + 3, 0.05, plotDepth / 2 + 1]} 
        length={5} 
        isWireframe={isWireframe} 
      />

      {/* Plot dimensions */}
      <PlotDimensions 
        plotWidth={plotWidth} 
        plotDepth={plotDepth} 
        isWireframe={isWireframe} 
      />

      {/* Plot boundary markers */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(plotWidth, 0.1, plotDepth)]}
        />
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
