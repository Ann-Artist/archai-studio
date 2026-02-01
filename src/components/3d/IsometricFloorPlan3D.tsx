import { useRef, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

export interface IsometricFloorPlan3DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
}

// Wall colors matching reference image style
const WALL_COLORS: Record<string, string> = {
  "living": "#7A8B7A",      // Sage green
  "bedroom": "#8B9CAB",     // Muted blue-gray
  "master": "#6B7B8B",      // Slate blue
  "kitchen": "#8B9B7A",     // Olive green
  "bathroom": "#9A8B7A",    // Warm taupe
  "dining": "#7A8B7A",      // Sage green
  "entrance": "#8B8B7A",    // Neutral sage
  "office": "#7A8B8B",      // Teal-gray
  "default": "#8B9B8B"      // Default sage
};

// Floor colors
const FLOOR_COLORS: Record<string, string> = {
  "wood": "#D4B896",        // Light wood
  "tile": "#E8E0D8",        // Light tile
  "carpet": "#B8C0A8",      // Carpet green
  "marble": "#E8E4E0"       // Marble white
};

// Get wall color based on room name
const getWallColor = (roomName: string): string => {
  const name = roomName.toLowerCase();
  if (name.includes("living")) return WALL_COLORS.living;
  if (name.includes("master")) return WALL_COLORS.master;
  if (name.includes("bedroom")) return WALL_COLORS.bedroom;
  if (name.includes("kitchen")) return WALL_COLORS.kitchen;
  if (name.includes("bathroom")) return WALL_COLORS.bathroom;
  if (name.includes("dining")) return WALL_COLORS.dining;
  if (name.includes("entrance") || name.includes("foyer")) return WALL_COLORS.entrance;
  if (name.includes("office") || name.includes("study")) return WALL_COLORS.office;
  return WALL_COLORS.default;
};

// Get floor type based on room name
const getFloorColor = (roomName: string): string => {
  const name = roomName.toLowerCase();
  if (name.includes("bathroom") || name.includes("kitchen")) return FLOOR_COLORS.tile;
  if (name.includes("bedroom")) return FLOOR_COLORS.wood;
  if (name.includes("living")) return FLOOR_COLORS.wood;
  return FLOOR_COLORS.wood;
};

// Wood texture simulation with stripes
const WoodFloor = ({ width, depth, position }: { width: number; depth: number; position: [number, number, number] }) => {
  const plankCount = Math.ceil(width * 4);
  const plankWidth = width / plankCount;
  
  return (
    <group position={position}>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#C8B090" roughness={0.8} />
      </mesh>
      {/* Planks */}
      {Array.from({ length: plankCount }).map((_, i) => (
        <mesh 
          key={i}
          position={[-width/2 + plankWidth/2 + i * plankWidth, 0.002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[plankWidth - 0.02, depth - 0.02]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#D4B896" : "#C8A878"} 
            roughness={0.7} 
          />
        </mesh>
      ))}
    </group>
  );
};

// Window component
const Window = ({ 
  position, 
  rotation = 0, 
  width = 0.8, 
  height = 0.6 
}: { 
  position: [number, number, number]; 
  rotation?: number; 
  width?: number;
  height?: number;
}) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Window frame */}
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width - 0.08, height - 0.08, 0.02]} />
        <meshStandardMaterial 
          color="#B8D4E8" 
          transparent 
          opacity={0.5} 
          roughness={0.1}
        />
      </mesh>
      {/* Cross bars */}
      <mesh position={[0, 0, 0.03]} castShadow>
        <boxGeometry args={[0.03, height - 0.08, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.03]} castShadow>
        <boxGeometry args={[width - 0.08, 0.03, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
    </group>
  );
};

// Door component
const Door = ({ 
  position, 
  rotation = 0,
  isOpen = false
}: { 
  position: [number, number, number]; 
  rotation?: number;
  isOpen?: boolean;
}) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Door frame */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>
      {/* Door panels (decorative) */}
      <mesh position={[0, 0.7, 0.06]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0.06]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.5} />
      </mesh>
      {/* Door handle */}
      <mesh position={[0.25, 0.5, 0.07]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#A08050" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
};

// Bed component
const Bed = ({ position, rotation = 0, isDouble = true }: { position: [number, number, number]; rotation?: number; isDouble?: boolean }) => {
  const bedWidth = isDouble ? 1.6 : 1.0;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[bedWidth, 0.3, 2.0]} />
        <meshStandardMaterial color="#5A4030" roughness={0.8} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.5, -0.9]} castShadow>
        <boxGeometry args={[bedWidth, 0.7, 0.1]} />
        <meshStandardMaterial color="#4A3020" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[bedWidth - 0.1, 0.15, 1.85]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.9} />
      </mesh>
      {/* Bedding */}
      <mesh position={[0, 0.45, 0.2]} castShadow>
        <boxGeometry args={[bedWidth - 0.15, 0.1, 1.3]} />
        <meshStandardMaterial color="#4A6048" roughness={0.95} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.35, 0.48, -0.65]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.35]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      {isDouble && (
        <mesh position={[0.35, 0.48, -0.65]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.35]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
        </mesh>
      )}
    </group>
  );
};

// Nightstand
const Nightstand = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.5, 0.4]} />
        <meshStandardMaterial color="#5A4030" roughness={0.7} />
      </mesh>
      {/* Lamp */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.1, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 12]} />
        <meshStandardMaterial color="#F5E8D0" roughness={0.9} transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

// Wardrobe
const Wardrobe = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.4, 0.5]} />
        <meshStandardMaterial color="#5A4030" roughness={0.7} />
      </mesh>
      {/* Door line */}
      <mesh position={[0, 0.7, 0.26]} castShadow>
        <boxGeometry args={[0.02, 1.3, 0.02]} />
        <meshStandardMaterial color="#3A2515" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Sofa
const Sofa = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.4, 0.9]} />
        <meshStandardMaterial color="#5A6048" roughness={0.85} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.5, -0.35]} castShadow>
        <boxGeometry args={[2.0, 0.5, 0.2]} />
        <meshStandardMaterial color="#4A5038" roughness={0.85} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.9]} />
        <meshStandardMaterial color="#4A5038" roughness={0.85} />
      </mesh>
      <mesh position={[0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.9]} />
        <meshStandardMaterial color="#4A5038" roughness={0.85} />
      </mesh>
      {/* Cushions */}
      <mesh position={[-0.4, 0.45, 0.05]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.7]} />
        <meshStandardMaterial color="#6A7058" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.45, 0.05]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.7]} />
        <meshStandardMaterial color="#6A7058" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Coffee table
const CoffeeTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.05, 0.5]} />
        <meshStandardMaterial color="#5A4030" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.38, -0.18], [0.38, -0.18], [-0.38, 0.18], [0.38, 0.18]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.14, pos[1]]} castShadow>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
          <meshStandardMaterial color="#4A3020" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

// Dining table
const DiningTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Table top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.06, 1.0]} />
        <meshStandardMaterial color="#5A4030" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.36, pos[1]]} castShadow>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <meshStandardMaterial color="#4A3020" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

// Dining chair
const DiningChair = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.05, 0.4]} />
        <meshStandardMaterial color="#5A4030" roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.75, -0.18]} castShadow>
        <boxGeometry args={[0.4, 0.55, 0.04]} />
        <meshStandardMaterial color="#5A4030" roughness={0.7} />
      </mesh>
      {/* Legs */}
      {[[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.15], [0.18, 0.15]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.22, pos[1]]} castShadow>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
          <meshStandardMaterial color="#4A3020" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

// Kitchen counter
const KitchenCounter = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base cabinet */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.9, 0.6]} />
        <meshStandardMaterial color="#8B7355" roughness={0.6} />
      </mesh>
      {/* Countertop */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[2.6, 0.05, 0.65]} />
        <meshStandardMaterial color="#E8E0D8" roughness={0.4} />
      </mesh>
      {/* Sink */}
      <mesh position={[0.5, 0.91, 0]} castShadow>
        <boxGeometry args={[0.5, 0.03, 0.4]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Stove */}
      <mesh position={[-0.7, 0.96, 0]} castShadow>
        <boxGeometry args={[0.6, 0.02, 0.45]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.4} />
      </mesh>
      {/* Burners */}
      {[[-0.85, -0.1], [-0.55, -0.1], [-0.85, 0.1], [-0.55, 0.1]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.98, pos[1]]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 12]} />
          <meshStandardMaterial color="#4A4A4A" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Upper cabinets
const UpperCabinets = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.0, 0.5, 0.35]} />
        <meshStandardMaterial color="#8B7355" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Toilet
const Toilet = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.2, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.4, 0.5]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.45, -0.15]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.18]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
    </group>
  );
};

// Bathroom sink
const BathroomSink = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Vanity */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.5]} />
        <meshStandardMaterial color="#8B7355" roughness={0.6} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[0.85, 0.04, 0.55]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.81, 0.05]}>
        <cylinderGeometry args={[0.18, 0.15, 0.08, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      {/* Mirror */}
      <mesh position={[0, 1.2, -0.23]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.03]} />
        <meshStandardMaterial color="#A8C0D8" roughness={0.1} metalness={0.5} />
      </mesh>
    </group>
  );
};

// Shower/Bathtub
const Shower = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.1, 0.8]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.3} />
      </mesh>
      {/* Glass panel */}
      <mesh position={[0.5, 0.5, 0]} castShadow>
        <boxGeometry args={[0.02, 0.9, 0.75]} />
        <meshStandardMaterial color="#C8E0F0" transparent opacity={0.3} roughness={0.1} />
      </mesh>
    </group>
  );
};

// Fireplace
const Fireplace = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.0, 0.3]} />
        <meshStandardMaterial color="#A08060" roughness={0.8} />
      </mesh>
      {/* Opening */}
      <mesh position={[0, 0.35, 0.1]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.15]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>
      {/* Mantle */}
      <mesh position={[0, 1.05, 0.05]} castShadow>
        <boxGeometry args={[1.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#5A4030" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Bookshelf
const Bookshelf = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.4, 0.35]} />
        <meshStandardMaterial color="#5A4030" roughness={0.7} />
      </mesh>
      {/* Shelves */}
      {[0.25, 0.55, 0.85, 1.15].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]} castShadow>
          <boxGeometry args={[0.9, 0.03, 0.28]} />
          <meshStandardMaterial color="#4A3020" roughness={0.7} />
        </mesh>
      ))}
      {/* Books */}
      <mesh position={[-0.2, 0.4, 0.02]} castShadow>
        <boxGeometry args={[0.4, 0.25, 0.2]} />
        <meshStandardMaterial color="#8B4030" roughness={0.8} />
      </mesh>
      <mesh position={[0.25, 0.7, 0.02]} castShadow>
        <boxGeometry args={[0.35, 0.25, 0.2]} />
        <meshStandardMaterial color="#305080" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Plant
const Plant = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 12]} />
        <meshStandardMaterial color="#C4A880" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#4A7050" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Stairs component
const Stairs = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => {
  const stepCount = 8;
  const stepHeight = 0.15;
  const stepDepth = 0.25;
  const stepWidth = 1.0;
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: stepCount }).map((_, i) => (
        <mesh 
          key={i} 
          position={[0, stepHeight * (i + 0.5), -stepDepth * i]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[stepWidth, stepHeight, stepDepth]} />
          <meshStandardMaterial color="#C8B090" roughness={0.7} />
        </mesh>
      ))}
      {/* Railing */}
      <mesh position={[-0.55, stepHeight * stepCount / 2 + 0.4, -stepDepth * (stepCount - 1) / 2]} castShadow>
        <boxGeometry args={[0.05, 0.8, stepDepth * stepCount]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>
      {/* Railing posts */}
      {[0, stepCount - 1].map((i) => (
        <mesh key={i} position={[-0.55, stepHeight * (i + 1) + 0.4, -stepDepth * i]} castShadow>
          <boxGeometry args={[0.08, 0.8, 0.08]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// Isometric room with cutaway walls
const IsometricRoom = ({ room }: { room: RoomConfig }) => {
  const { name, width, depth, position } = room;
  const wallColor = getWallColor(name);
  const floorColor = getFloorColor(name);
  const wallHeight = 1.2;
  const wallThickness = 0.12;
  const roomName = name.toLowerCase();

  // Determine furniture based on room type
  const renderFurniture = () => {
    const centerX = 0;
    const centerZ = 0;

    if (roomName.includes("master bedroom") || roomName.includes("bedroom")) {
      return (
        <>
          <Bed 
            position={[centerX, 0, centerZ - depth/4]} 
            rotation={0}
            isDouble={roomName.includes("master")}
          />
          <Nightstand position={[centerX - width/3, 0, centerZ - depth/4]} />
          <Nightstand position={[centerX + width/3, 0, centerZ - depth/4]} />
          <Wardrobe position={[centerX + width/3, 0, centerZ + depth/3]} rotation={Math.PI} />
        </>
      );
    }

    if (roomName.includes("living")) {
      return (
        <>
          <Sofa position={[centerX, 0, centerZ - depth/4]} rotation={0} />
          <CoffeeTable position={[centerX, 0, centerZ + 0.3]} />
          <Bookshelf position={[centerX - width/3, 0, centerZ + depth/3]} rotation={Math.PI} />
          <Plant position={[centerX + width/3, 0, centerZ + depth/3]} />
          <Fireplace position={[centerX + width/4, 0, centerZ - depth/3]} rotation={0} />
        </>
      );
    }

    if (roomName.includes("kitchen")) {
      return (
        <>
          <KitchenCounter position={[centerX, 0, centerZ - depth/4]} rotation={0} />
          <UpperCabinets position={[centerX, wallHeight * 0.9, centerZ - depth/3]} rotation={0} />
        </>
      );
    }

    if (roomName.includes("dining")) {
      return (
        <>
          <DiningTable position={[centerX, 0, centerZ]} />
          <DiningChair position={[centerX - 0.6, 0, centerZ - 0.6]} rotation={0} />
          <DiningChair position={[centerX + 0.6, 0, centerZ - 0.6]} rotation={0} />
          <DiningChair position={[centerX - 0.6, 0, centerZ + 0.6]} rotation={Math.PI} />
          <DiningChair position={[centerX + 0.6, 0, centerZ + 0.6]} rotation={Math.PI} />
        </>
      );
    }

    if (roomName.includes("bathroom")) {
      return (
        <>
          <Toilet position={[centerX - width/4, 0, centerZ - depth/4]} rotation={0} />
          <BathroomSink position={[centerX + width/4, 0, centerZ - depth/4]} rotation={0} />
          <Shower position={[centerX, 0, centerZ + depth/4]} rotation={0} />
        </>
      );
    }

    if (roomName.includes("entrance") || roomName.includes("foyer") || roomName.includes("hall")) {
      return (
        <>
          <Stairs position={[centerX, 0, centerZ]} rotation={Math.PI / 2} />
        </>
      );
    }

    return null;
  };

  return (
    <group position={position}>
      {/* Floor with wood pattern */}
      {roomName.includes("living") || roomName.includes("bedroom") ? (
        <WoodFloor width={width} depth={depth} position={[0, 0.001, 0]} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color={floorColor} roughness={0.5} />
        </mesh>
      )}

      {/* Walls - cutaway style (only back and left walls visible) */}
      {/* Back wall (full) */}
      <mesh position={[0, wallHeight/2, -depth/2 + wallThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Left wall (full) */}
      <mesh position={[-width/2 + wallThickness/2, wallHeight/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Right wall (partial/low for isometric view) */}
      <mesh position={[width/2 - wallThickness/2, wallHeight/4, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight/2, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Front wall (partial/low for isometric view) */}
      <mesh position={[0, wallHeight/4, depth/2 - wallThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight/2, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Wall trim/baseboard */}
      <mesh position={[0, 0.04, -depth/2 + wallThickness + 0.01]} castShadow>
        <boxGeometry args={[width - wallThickness * 2, 0.08, 0.02]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.7} />
      </mesh>
      <mesh position={[-width/2 + wallThickness + 0.01, 0.04, 0]} castShadow>
        <boxGeometry args={[0.02, 0.08, depth - wallThickness * 2]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.7} />
      </mesh>

      {/* Windows on back wall */}
      {width > 2 && (
        <Window 
          position={[width/4, wallHeight * 0.6, -depth/2 + wallThickness/2 + 0.05]} 
          rotation={0}
          width={0.8}
          height={0.5}
        />
      )}

      {/* Windows on left wall */}
      {depth > 2 && (
        <Window 
          position={[-width/2 + wallThickness/2 + 0.05, wallHeight * 0.6, -depth/4]} 
          rotation={Math.PI / 2}
          width={0.8}
          height={0.5}
        />
      )}

      {/* Door on front wall */}
      {!roomName.includes("bathroom") && (
        <Door 
          position={[-width/4, 0, depth/2 - wallThickness/2 - 0.02]} 
          rotation={0}
        />
      )}

      {/* Furniture */}
      {renderFurniture()}
    </group>
  );
};

// Main scene component
const Scene = ({ rooms, plotWidth, plotDepth }: { rooms: RoomConfig[]; plotWidth: number; plotDepth: number }) => {
  const { camera } = useThree();
  
  // Set up isometric camera position
  useMemo(() => {
    const distance = Math.max(plotWidth, plotDepth) * 1.2;
    camera.position.set(distance, distance * 0.8, distance);
    camera.lookAt(0, 0, 0);
  }, [camera, plotWidth, plotDepth]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-5, 10, -5]} intensity={0.3} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[plotWidth * 2, plotDepth * 2]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.9} />
      </mesh>

      {/* Exterior base/foundation */}
      <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[plotWidth * 0.8, 0.15, plotDepth * 0.8]} />
        <meshStandardMaterial color="#C8B8A0" roughness={0.8} />
      </mesh>

      {/* Render all rooms */}
      {rooms.map((room, index) => (
        <IsometricRoom key={index} room={room} />
      ))}

      {/* Environment */}
      <Environment preset="apartment" />
    </>
  );
};

// Default rooms for demo
const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 5, depth: 4, height: 3, position: [-3, 0, 2], color: "#7A8B7A" },
  { name: "Kitchen", width: 3.5, depth: 3, height: 3, position: [2.5, 0, 3], color: "#8B9B7A" },
  { name: "Dining Room", width: 3.5, depth: 3, height: 3, position: [-5, 0, -1.5], color: "#7A8B7A" },
  { name: "Master Bedroom", width: 4, depth: 3.5, height: 3, position: [2, 0, -2], color: "#6B7B8B" },
  { name: "Bedroom 2", width: 3.5, depth: 3, height: 3, position: [-2, 0, -2.5], color: "#8B9CAB" },
  { name: "Bathroom", width: 2.5, depth: 2, height: 3, position: [5, 0, -1], color: "#9A8B7A" },
  { name: "Entrance Hall", width: 2, depth: 3, height: 3, position: [0, 0, 4], color: "#8B8B7A" },
];

export default function IsometricFloorPlan3D({
  rooms = defaultRooms,
  plotWidth = 14,
  plotDepth = 12,
}: IsometricFloorPlan3DProps) {
  return (
    <Canvas
      shadows
      camera={{ fov: 45, near: 0.1, far: 1000 }}
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2
      }}
      style={{ background: "linear-gradient(to bottom, #E8E4E0, #D8D4D0)" }}
    >
      <Scene rooms={rooms} plotWidth={plotWidth} plotDepth={plotDepth} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={8}
        maxDistance={40}
      />
    </Canvas>
  );
}
