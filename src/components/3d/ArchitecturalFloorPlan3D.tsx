import { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  OrthographicCamera,
  ContactShadows,
  Environment,
  Plane
} from "@react-three/drei";
import * as THREE from "three";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

export interface ArchitecturalFloorPlan3DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
  wallHeight?: number;
  showGrid?: boolean;
}

// Material textures and colors
const FLOOR_MATERIALS = {
  wood: { color: "#C4A77D", roughness: 0.8, metalness: 0.0 },
  woodDark: { color: "#8B7355", roughness: 0.7, metalness: 0.0 },
  tile: { color: "#E8E4E0", roughness: 0.3, metalness: 0.1 },
  tileDark: { color: "#B8B4B0", roughness: 0.4, metalness: 0.1 },
  marble: { color: "#F5F5F5", roughness: 0.2, metalness: 0.1 },
};

const WALL_COLOR = "#FAFAF8";
const CUTAWAY_WALL_HEIGHT = 0.8; // Low walls for visibility

// Helper to determine floor material based on room type
const getFloorMaterial = (roomName: string) => {
  const name = roomName.toLowerCase();
  if (name.includes("bathroom") || name.includes("kitchen")) {
    return FLOOR_MATERIALS.tile;
  }
  if (name.includes("entrance") || name.includes("hall")) {
    return FLOOR_MATERIALS.marble;
  }
  return FLOOR_MATERIALS.wood;
};

// Realistic Double Bed with proper proportions
const DoubleBed = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Bed frame base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 2.1]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.38, 0.05]} castShadow>
        <boxGeometry args={[1.7, 0.18, 1.95]} />
        <meshStandardMaterial color="#F8F6F0" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.55, -0.95]} castShadow>
        <boxGeometry args={[1.8, 0.7, 0.08]} />
        <meshStandardMaterial color="#4A3C2A" roughness={0.6} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.45, 0.52, -0.65]} castShadow>
        <boxGeometry args={[0.55, 0.1, 0.35]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      <mesh position={[0.45, 0.52, -0.65]} castShadow>
        <boxGeometry args={[0.55, 0.1, 0.35]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      {/* Duvet/Blanket */}
      <mesh position={[0, 0.48, 0.35]} castShadow>
        <boxGeometry args={[1.65, 0.06, 1.2]} />
        <meshStandardMaterial color="#B8C4D0" roughness={0.95} />
      </mesh>
    </group>
  );
};

// Nightstand
const Nightstand = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.5, 0.4]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.7} />
      </mesh>
      {/* Drawer front */}
      <mesh position={[0, 0.25, 0.205]} castShadow>
        <boxGeometry args={[0.4, 0.18, 0.01]} />
        <meshStandardMaterial color="#4A3C2A" roughness={0.6} />
      </mesh>
      {/* Lamp base */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#A0926C" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Lamp shade */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.2, 16, 1, true]} />
        <meshStandardMaterial color="#F5F0E6" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

// Wardrobe
const Wardrobe = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.8, 0.55]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.7} />
      </mesh>
      {/* Door line */}
      <mesh position={[0, 0.9, 0.28]} castShadow>
        <boxGeometry args={[0.01, 1.7, 0.01]} />
        <meshStandardMaterial color="#3A2F1F" roughness={0.6} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.08, 0.9, 0.29]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0.08, 0.9, 0.29]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// Modern Sofa Set
const ModernSofa = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main sofa base */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.36, 0.85]} />
        <meshStandardMaterial color="#7A6B5A" roughness={0.85} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.48, -0.32]} castShadow>
        <boxGeometry args={[2.2, 0.45, 0.2]} />
        <meshStandardMaterial color="#6B5C4B" roughness={0.85} />
      </mesh>
      {/* Left armrest */}
      <mesh position={[-1.0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.2, 0.28, 0.85]} />
        <meshStandardMaterial color="#6B5C4B" roughness={0.85} />
      </mesh>
      {/* Right armrest */}
      <mesh position={[1.0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.2, 0.28, 0.85]} />
        <meshStandardMaterial color="#6B5C4B" roughness={0.85} />
      </mesh>
      {/* Seat cushions */}
      <mesh position={[-0.5, 0.4, 0.05]} castShadow>
        <boxGeometry args={[0.85, 0.1, 0.65]} />
        <meshStandardMaterial color="#8B7B6B" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.4, 0.05]} castShadow>
        <boxGeometry args={[0.85, 0.1, 0.65]} />
        <meshStandardMaterial color="#8B7B6B" roughness={0.9} />
      </mesh>
      {/* Back cushions */}
      <mesh position={[-0.5, 0.55, -0.22]} castShadow>
        <boxGeometry args={[0.75, 0.35, 0.12]} />
        <meshStandardMaterial color="#9B8B7B" roughness={0.95} />
      </mesh>
      <mesh position={[0.5, 0.55, -0.22]} castShadow>
        <boxGeometry args={[0.75, 0.35, 0.12]} />
        <meshStandardMaterial color="#9B8B7B" roughness={0.95} />
      </mesh>
      {/* Legs */}
      {[[-0.95, -0.32], [0.95, -0.32], [-0.95, 0.32], [0.95, 0.32]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.04, pos[1]]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#2A2A2A" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Center/Coffee Table
const CenterTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Table top */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.04, 0.6]} />
        <meshStandardMaterial color="#4A3C2A" roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-0.42, -0.22], [0.42, -0.22], [-0.42, 0.22], [0.42, 0.22]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.175, pos[1]]} castShadow>
          <boxGeometry args={[0.04, 0.35, 0.04]} />
          <meshStandardMaterial color="#3A2F1F" roughness={0.6} />
        </mesh>
      ))}
      {/* Decorative items on table */}
      <mesh position={[0.2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.25, 0.04, 0.18]} />
        <meshStandardMaterial color="#8B7355" roughness={0.7} />
      </mesh>
    </group>
  );
};

// Indoor Plant
const IndoorPlant = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  return (
    <group position={position} scale={scale}>
      {/* Pot */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 12]} />
        <meshStandardMaterial color="#D4C4B0" roughness={0.8} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
        <meshStandardMaterial color="#3D2914" roughness={0.95} />
      </mesh>
      {/* Leaves cluster */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#4A7C59" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.6, 0.05]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color="#5A8C69" roughness={0.9} />
      </mesh>
      <mesh position={[-0.08, 0.55, -0.08]} castShadow>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#3A6C49" roughness={0.9} />
      </mesh>
    </group>
  );
};

// L-Shaped Kitchen Counter
const LShapedKitchen = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main counter section */}
      <mesh position={[0, 0.45, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.9, 0.6]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.4} />
      </mesh>
      {/* Counter top - main */}
      <mesh position={[0, 0.92, -0.3]} castShadow>
        <boxGeometry args={[2.1, 0.04, 0.65]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.3} />
      </mesh>
      {/* L-section */}
      <mesh position={[1.15, 0.45, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.9, 1.2]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.4} />
      </mesh>
      {/* Counter top - L */}
      <mesh position={[1.15, 0.92, 0.45]} castShadow>
        <boxGeometry args={[0.65, 0.04, 1.25]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.3} />
      </mesh>
      {/* Sink */}
      <mesh position={[0.4, 0.91, -0.3]} castShadow>
        <boxGeometry args={[0.5, 0.02, 0.4]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Stove */}
      <mesh position={[-0.5, 0.93, -0.3]} castShadow>
        <boxGeometry args={[0.6, 0.02, 0.45]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.4} />
      </mesh>
      {/* Burners */}
      {[[-0.65, -0.1], [-0.35, -0.1], [-0.65, 0.1], [-0.35, 0.1]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.95, pos[1] - 0.3]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
          <meshStandardMaterial color="#3A3A3A" roughness={0.5} />
        </mesh>
      ))}
      {/* Upper cabinets */}
      <mesh position={[0, 1.5, -0.45]} castShadow>
        <boxGeometry args={[2.0, 0.6, 0.35]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Refrigerator
const Refrigerator = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.7, 0.65]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Door line */}
      <mesh position={[0, 0.55, 0.33]} castShadow>
        <boxGeometry args={[0.65, 0.02, 0.01]} />
        <meshStandardMaterial color="#D0D0D0" roughness={0.3} />
      </mesh>
      {/* Handles */}
      <mesh position={[0.3, 1.15, 0.35]} castShadow>
        <boxGeometry args={[0.02, 0.35, 0.03]} />
        <meshStandardMaterial color="#A0A0A0" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.35, 0.35]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.03]} />
        <meshStandardMaterial color="#A0A0A0" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// Toilet
const Toilet = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Bowl */}
      <mesh position={[0, 0.2, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.4, 0.5]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.45, -0.18]} castShadow>
        <boxGeometry args={[0.34, 0.5, 0.18]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.42, 0.08]} castShadow>
        <boxGeometry args={[0.36, 0.04, 0.42]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.3} />
      </mesh>
    </group>
  );
};

// Bathroom Sink/Vanity
const BathroomVanity = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Cabinet */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.7, 0.45]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.65, 0.04, 0.5]} />
        <meshStandardMaterial color="#E8E4E0" roughness={0.3} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, 0.71, 0.05]} castShadow>
        <cylinderGeometry args={[0.16, 0.14, 0.06, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      {/* Mirror */}
      <mesh position={[0, 1.2, -0.2]} castShadow>
        <boxGeometry args={[0.5, 0.65, 0.02]} />
        <meshStandardMaterial color="#B8C8D8" roughness={0.1} metalness={0.4} />
      </mesh>
      {/* Mirror frame */}
      <mesh position={[0, 1.2, -0.21]}>
        <boxGeometry args={[0.54, 0.69, 0.01]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
};

// Shower Area
const ShowerArea = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Shower base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#E8E4E0" roughness={0.3} />
      </mesh>
      {/* Glass panel hint */}
      <mesh position={[0.45, 0.55, 0]} castShadow>
        <boxGeometry args={[0.02, 1.0, 0.9]} />
        <meshStandardMaterial color="#C8D8E8" roughness={0.1} metalness={0.2} transparent opacity={0.4} />
      </mesh>
      {/* Shower head */}
      <mesh position={[0, 1.1, -0.35]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 12]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
};

// Entrance Console/Shoe Cabinet
const EntranceConsole = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Cabinet */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.7, 0.35]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.7} />
      </mesh>
      {/* Top surface */}
      <mesh position={[0, 0.71, 0]} castShadow>
        <boxGeometry args={[0.95, 0.02, 0.38]} />
        <meshStandardMaterial color="#4A3C2A" roughness={0.6} />
      </mesh>
      {/* Decorative bowl/item */}
      <mesh position={[0.2, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#A0926C" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
};

// Wall segment for cutaway view
const CutawayWall = ({
  start,
  end,
  height,
}: {
  start: [number, number];
  end: [number, number];
  height: number;
}) => {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[1] + end[1]) / 2;
  const thickness = 0.12;

  return (
    <group position={[midX, height / 2, midZ]} rotation={[0, -angle, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial
          color={WALL_COLOR}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      {/* Baseboard */}
      <mesh position={[0, -height / 2 + 0.04, thickness / 2 + 0.005]} castShadow>
        <boxGeometry args={[length, 0.08, 0.01]} />
        <meshStandardMaterial color="#E8E4E0" roughness={0.7} />
      </mesh>
    </group>
  );
};

// Room with floor, low walls, and furniture
const ArchitecturalRoom = ({ room }: { room: RoomConfig }) => {
  const { name, width, depth, position } = room;
  const floorMaterial = getFloorMaterial(name);
  
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const baseX = position[0];
  const baseZ = position[2];

  // Wall positions
  const walls: Array<{ start: [number, number]; end: [number, number] }> = [
    { start: [baseX - halfWidth, baseZ - halfDepth], end: [baseX + halfWidth, baseZ - halfDepth] },
    { start: [baseX - halfWidth, baseZ + halfDepth], end: [baseX + halfWidth, baseZ + halfDepth] },
    { start: [baseX - halfWidth, baseZ - halfDepth], end: [baseX - halfWidth, baseZ + halfDepth] },
    { start: [baseX + halfWidth, baseZ - halfDepth], end: [baseX + halfWidth, baseZ + halfDepth] },
  ];

  // Furniture based on room type
  const renderFurniture = () => {
    const roomName = name.toLowerCase();
    const floorY = 0.02;

    if (roomName.includes("bedroom") && roomName.includes("master") || (roomName.includes("bedroom") && !roomName.includes("2"))) {
      return (
        <group>
          <DoubleBed position={[baseX, floorY, baseZ - depth / 6]} rotation={0} />
          <Nightstand position={[baseX - width / 3, floorY, baseZ - depth / 4]} />
          <Nightstand position={[baseX + width / 3, floorY, baseZ - depth / 4]} />
          <Wardrobe position={[baseX + width / 3 - 0.3, floorY, baseZ + depth / 3]} rotation={Math.PI} />
        </group>
      );
    }

    if (roomName.includes("bedroom 2") || roomName.includes("bedroom2") || roomName.includes("guest")) {
      return (
        <group>
          <DoubleBed position={[baseX - width / 8, floorY, baseZ]} rotation={0} />
          <Nightstand position={[baseX + width / 3, floorY, baseZ - depth / 5]} />
        </group>
      );
    }

    if (roomName.includes("living")) {
      return (
        <group>
          <ModernSofa position={[baseX, floorY, baseZ + depth / 5]} rotation={0} />
          <CenterTable position={[baseX, floorY, baseZ - 0.4]} />
          <IndoorPlant position={[baseX + width / 3, floorY, baseZ + depth / 3]} scale={0.9} />
          <IndoorPlant position={[baseX - width / 3, floorY, baseZ - depth / 3]} scale={0.7} />
        </group>
      );
    }

    if (roomName.includes("kitchen")) {
      return (
        <group>
          <LShapedKitchen position={[baseX - 0.3, floorY, baseZ - depth / 4]} rotation={0} />
          <Refrigerator position={[baseX + width / 3, floorY, baseZ - depth / 4]} />
        </group>
      );
    }

    if (roomName.includes("bathroom") || roomName.includes("bath") || roomName.includes("wc")) {
      return (
        <group>
          <Toilet position={[baseX - width / 4, floorY, baseZ + depth / 4]} rotation={0} />
          <BathroomVanity position={[baseX + width / 4, floorY, baseZ - depth / 4]} rotation={0} />
          <ShowerArea position={[baseX - width / 4, floorY, baseZ - depth / 4]} rotation={0} />
        </group>
      );
    }

    if (roomName.includes("entrance") || roomName.includes("hall") || roomName.includes("foyer")) {
      return (
        <group>
          <EntranceConsole position={[baseX, floorY, baseZ - depth / 4]} rotation={0} />
          <IndoorPlant position={[baseX + width / 4, floorY, baseZ + depth / 4]} scale={0.6} />
        </group>
      );
    }

    return null;
  };

  return (
    <group>
      {/* Floor */}
      <mesh
        position={[baseX, 0.01, baseZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width - 0.24, depth - 0.24]} />
        <meshStandardMaterial
          color={floorMaterial.color}
          roughness={floorMaterial.roughness}
          metalness={floorMaterial.metalness}
        />
      </mesh>

      {/* Cutaway walls */}
      {walls.map((wall, index) => (
        <CutawayWall
          key={index}
          start={wall.start}
          end={wall.end}
          height={CUTAWAY_WALL_HEIGHT}
        />
      ))}

      {/* Furniture */}
      {renderFurniture()}
    </group>
  );
};

// Ground plane for entire plot
const GroundPlane = ({ width, depth }: { width: number; depth: number }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
      <planeGeometry args={[width + 6, depth + 6]} />
      <meshStandardMaterial color="#E8E4E0" roughness={1} metalness={0} />
    </mesh>
  );
};

// Main scene
const ArchitecturalFloorPlan3DScene = ({
  rooms = [],
  plotWidth = 20,
  plotDepth = 16,
  showGrid = false,
}: ArchitecturalFloorPlan3DProps) => {
  // Calculate camera position for top-down orthographic view
  const maxDimension = Math.max(plotWidth, plotDepth);
  const cameraDistance = maxDimension * 0.7;

  return (
    <>
      {/* Orthographic camera for top-down view with slight angle */}
      <OrthographicCamera
        makeDefault
        position={[0, cameraDistance, cameraDistance * 0.3]}
        zoom={22}
        near={0.1}
        far={1000}
      />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minZoom={10}
        maxZoom={80}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 6}
        target={[0, 0, 0]}
      />

      {/* Soft ambient lighting */}
      <ambientLight intensity={0.6} color="#FFF8F0" />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[15, 30, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0001}
        color="#FFF5E6"
      />
      
      {/* Fill light */}
      <directionalLight position={[-10, 20, -10]} intensity={0.4} color="#E6F0FF" />
      
      {/* Hemisphere light for natural sky/ground bounce */}
      <hemisphereLight args={["#B4D7FF", "#E8DDD0", 0.5]} />

      {/* Contact shadows for soft ground shadows */}
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.35} 
        scale={50} 
        blur={2} 
        far={20} 
        color="#4A3C2A"
      />

      {/* Ground */}
      <GroundPlane width={plotWidth} depth={plotDepth} />

      {/* Rooms */}
      {rooms.map((room, index) => (
        <ArchitecturalRoom key={index} room={room} />
      ))}

      {/* Plot boundary outline */}
      <lineSegments position={[0, 0.02, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(plotWidth, 0.01, plotDepth)]} />
        <lineBasicMaterial color="#8B7355" linewidth={2} />
      </lineSegments>
    </>
  );
};

const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 6, depth: 5, height: 3, position: [-3, 1.5, 0], color: "#C4A77D" },
  { name: "Kitchen", width: 4, depth: 4, height: 3, position: [3, 1.5, -2], color: "#E8E4E0" },
  { name: "Master Bedroom", width: 5, depth: 4, height: 3, position: [-2, 1.5, -5], color: "#C4A77D" },
  { name: "Bedroom 2", width: 4, depth: 3.5, height: 3, position: [3.5, 1.5, 2.5], color: "#C4A77D" },
  { name: "Bathroom", width: 3, depth: 2.5, height: 3, position: [4, 1.5, -6], color: "#E8E4E0" },
  { name: "Entrance", width: 2, depth: 2, height: 3, position: [-6, 1.5, 3], color: "#F5F5F5" },
];

const ArchitecturalFloorPlan3D = (props: ArchitecturalFloorPlan3DProps) => {
  const roomsToRender = props.rooms && props.rooms.length > 0 ? props.rooms : defaultRooms;

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#F5F0E8] to-[#E8E4DC] rounded-xl overflow-hidden">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 2]}
      >
        <ArchitecturalFloorPlan3DScene {...props} rooms={roomsToRender} />
      </Canvas>
    </div>
  );
};

export default ArchitecturalFloorPlan3D;
