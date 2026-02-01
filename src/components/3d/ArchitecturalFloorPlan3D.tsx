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

export interface ArchitecturalFloorPlan3DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
}

// Constants for architectural accuracy
const WALL_THICKNESS = 0.12;
const WALL_HEIGHT = 0.8; // Low cutaway for full interior visibility
const FLOOR_HEIGHT = 0.02;

// ============================================================================
// REALISTIC MATERIALS - Physically plausible textures
// ============================================================================

const createWoodMaterial = (baseColor: string, variation: number = 0) => ({
  color: baseColor,
  roughness: 0.7 + variation * 0.1,
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

// ============================================================================
// FLOOR COMPONENTS - Realistic textures with subtle variation
// ============================================================================

const HerringboneWoodFloor = ({ 
  width, 
  depth 
}: { 
  width: number; 
  depth: number;
}) => {
  const plankWidth = 0.08;
  const plankLength = 0.35;
  const planksX = Math.ceil(width / plankWidth) + 2;
  const planksZ = Math.ceil(depth / plankLength) + 2;
  
  const planks = useMemo(() => {
    const items: { x: number; z: number; rot: number; shade: number }[] = [];
    for (let i = 0; i < planksX; i++) {
      for (let j = 0; j < planksZ; j++) {
        const isEven = (i + j) % 2 === 0;
        items.push({
          x: -width/2 + i * plankWidth * 2 + (j % 2) * plankWidth,
          z: -depth/2 + j * plankLength/2,
          rot: isEven ? Math.PI/4 : -Math.PI/4,
          shade: 0.9 + Math.random() * 0.2,
        });
      }
    }
    return items;
  }, [width, depth, planksX, planksZ]);

  return (
    <group position={[0, FLOOR_HEIGHT, 0]}>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#C4A575" roughness={0.75} />
      </mesh>
      {/* Herringbone pattern overlay */}
      {planks.slice(0, 400).map((plank, i) => (
        <mesh 
          key={i}
          position={[plank.x, 0.001, plank.z]}
          rotation={[-Math.PI / 2, 0, plank.rot]}
          receiveShadow
        >
          <planeGeometry args={[plankWidth - 0.003, plankLength - 0.003]} />
          <meshStandardMaterial 
            color={new THREE.Color("#C4A575").multiplyScalar(plank.shade)} 
            roughness={0.72}
          />
        </mesh>
      ))}
    </group>
  );
};

const CeramicTileFloor = ({ 
  width, 
  depth,
  tileSize = 0.3,
  groutColor = "#D0C8C0",
  tileColor = "#E8E4DC"
}: { 
  width: number; 
  depth: number;
  tileSize?: number;
  groutColor?: string;
  tileColor?: string;
}) => {
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
    <group position={[0, FLOOR_HEIGHT, 0]}>
      {/* Grout base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={groutColor} roughness={0.9} />
      </mesh>
      {/* Individual tiles */}
      {tiles.map((tile, i) => (
        <mesh 
          key={i}
          position={[tile.x, 0.001, tile.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[tileSize - 0.012, tileSize - 0.012]} />
          <meshStandardMaterial 
            color={new THREE.Color(tileColor).multiplyScalar(tile.shade)}
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
  color = "#8B7B6A"
}: { 
  width: number; 
  depth: number;
  color?: string;
}) => (
  <group position={[0, FLOOR_HEIGHT, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} roughness={0.98} />
    </mesh>
    {/* Carpet texture simulation with subtle border */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <planeGeometry args={[width - 0.1, depth - 0.1]} />
      <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(1.02)} roughness={0.96} />
    </mesh>
  </group>
);

// ============================================================================
// WALL COMPONENT - Clean architectural walls with proper thickness
// ============================================================================

const ArchitecturalWall = ({
  start,
  end,
  height = WALL_HEIGHT,
  thickness = WALL_THICKNESS,
  hasOpening = false,
  openingWidth = 0.9,
  openingType = "door"
}: {
  start: [number, number];
  end: [number, number];
  height?: number;
  thickness?: number;
  hasOpening?: boolean;
  openingWidth?: number;
  openingType?: "door" | "window";
}) => {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[1] + end[1]) / 2;

  if (hasOpening && length > openingWidth * 1.5) {
    const segmentLength = (length - openingWidth) / 2;
    const windowSillHeight = openingType === "window" ? height * 0.35 : 0;
    
    return (
      <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
        {/* Left wall segment */}
        <mesh position={[-length/2 + segmentLength/2, height/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[segmentLength, height, thickness]} />
          <meshStandardMaterial color="#F5F2EC" roughness={0.85} />
        </mesh>
        
        {/* Right wall segment */}
        <mesh position={[length/2 - segmentLength/2, height/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[segmentLength, height, thickness]} />
          <meshStandardMaterial color="#F5F2EC" roughness={0.85} />
        </mesh>
        
        {/* Header above opening */}
        {openingType === "door" && (
          <mesh position={[0, height - 0.05, 0]} castShadow>
            <boxGeometry args={[openingWidth + 0.08, 0.1, thickness + 0.02]} />
            <meshStandardMaterial color="#E8E4DC" roughness={0.8} />
          </mesh>
        )}
        
        {/* Window sill and header */}
        {openingType === "window" && (
          <>
            <mesh position={[0, windowSillHeight, 0]} castShadow>
              <boxGeometry args={[openingWidth + 0.06, 0.04, thickness + 0.03]} />
              <meshStandardMaterial color="#E8E4DC" roughness={0.7} />
            </mesh>
            <mesh position={[0, height - 0.05, 0]} castShadow>
              <boxGeometry args={[openingWidth + 0.06, 0.06, thickness + 0.02]} />
              <meshStandardMaterial color="#E8E4DC" roughness={0.7} />
            </mesh>
            {/* Glass pane */}
            <mesh position={[0, (windowSillHeight + height - 0.05) / 2, 0]}>
              <planeGeometry args={[openingWidth, height * 0.5 - 0.1]} />
              <meshStandardMaterial 
                color="#B8D4E8" 
                transparent 
                opacity={0.35} 
                roughness={0.1}
              />
            </mesh>
          </>
        )}
        
        {/* Baseboard */}
        <mesh position={[0, 0.04, thickness/2 + 0.01]} castShadow>
          <boxGeometry args={[length, 0.08, 0.015]} />
          <meshStandardMaterial color="#E0DCD4" roughness={0.7} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
      {/* Main wall */}
      <mesh position={[0, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length + thickness, height, thickness]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.85} />
      </mesh>
      
      {/* Wall cap */}
      <mesh position={[0, height - 0.01, 0]}>
        <boxGeometry args={[length + thickness, 0.02, thickness + 0.01]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      
      {/* Baseboard */}
      <mesh position={[0, 0.04, thickness/2 + 0.01]} castShadow>
        <boxGeometry args={[length + thickness, 0.08, 0.015]} />
        <meshStandardMaterial color="#E0DCD4" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ============================================================================
// FURNITURE COMPONENTS - Realistic proportions and materials
// ============================================================================

// Standard double bed: 160cm x 200cm with 45cm height
const DoubleBed = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Bed frame */}
    <mesh position={[0, 0.12, 0]} castShadow>
      <boxGeometry args={[1.6, 0.24, 2.0]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4030")} />
    </mesh>
    
    {/* Headboard */}
    <mesh position={[0, 0.55, -0.96]} castShadow>
      <boxGeometry args={[1.62, 0.75, 0.06]} />
      <meshStandardMaterial {...createWoodMaterial("#4A3025")} />
    </mesh>
    
    {/* Mattress */}
    <mesh position={[0, 0.32, 0.02]} castShadow>
      <boxGeometry args={[1.54, 0.16, 1.92]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
    </mesh>
    
    {/* Duvet/blanket */}
    <mesh position={[0, 0.42, 0.15]} castShadow>
      <boxGeometry args={[1.48, 0.06, 1.5]} />
      <meshStandardMaterial {...createFabricMaterial("#E8E4DC")} />
    </mesh>
    
    {/* Pillows */}
    <mesh position={[-0.42, 0.46, -0.7]} castShadow>
      <boxGeometry args={[0.5, 0.1, 0.35]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
    </mesh>
    <mesh position={[0.42, 0.46, -0.7]} castShadow>
      <boxGeometry args={[0.5, 0.1, 0.35]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
    </mesh>
  </group>
);

// Single bed: 100cm x 200cm
const SingleBed = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.12, 0]} castShadow>
      <boxGeometry args={[1.0, 0.24, 2.0]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4030")} />
    </mesh>
    <mesh position={[0, 0.48, -0.96]} castShadow>
      <boxGeometry args={[1.02, 0.6, 0.06]} />
      <meshStandardMaterial {...createWoodMaterial("#4A3025")} />
    </mesh>
    <mesh position={[0, 0.32, 0.02]} castShadow>
      <boxGeometry args={[0.94, 0.16, 1.92]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
    </mesh>
    <mesh position={[0, 0.42, 0.15]} castShadow>
      <boxGeometry args={[0.9, 0.06, 1.5]} />
      <meshStandardMaterial {...createFabricMaterial("#C5D5E5")} />
    </mesh>
    <mesh position={[0, 0.44, -0.7]} castShadow>
      <boxGeometry args={[0.45, 0.1, 0.35]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
    </mesh>
  </group>
);

// Nightstand: 45cm x 40cm x 50cm height
const Nightstand = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[0.45, 0.5, 0.4]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4030")} />
    </mesh>
    {/* Drawer handle */}
    <mesh position={[0, 0.25, 0.21]} castShadow>
      <boxGeometry args={[0.08, 0.02, 0.02]} />
      <meshStandardMaterial {...createMetalMaterial("#B0A090")} />
    </mesh>
    {/* Lamp */}
    <mesh position={[0, 0.55, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
      <meshStandardMaterial color="#8B7355" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.68, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.12, 0.18, 12]} />
      <meshStandardMaterial color="#F5E8D0" roughness={0.9} transparent opacity={0.85} />
    </mesh>
  </group>
);

// 3-seater sofa: 220cm x 90cm, seat height 45cm
const Sofa3Seater = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Base/frame */}
    <mesh position={[0, 0.08, 0]} castShadow>
      <boxGeometry args={[2.2, 0.16, 0.9]} />
      <meshStandardMaterial {...createWoodMaterial("#4A4040")} />
    </mesh>
    
    {/* Seat cushions */}
    <mesh position={[0, 0.25, 0.05]} castShadow>
      <boxGeometry args={[2.1, 0.18, 0.75]} />
      <meshStandardMaterial {...createFabricMaterial("#6B7A68")} />
    </mesh>
    
    {/* Back cushion */}
    <mesh position={[0, 0.5, -0.32]} castShadow>
      <boxGeometry args={[2.1, 0.35, 0.22]} />
      <meshStandardMaterial {...createFabricMaterial("#5A6958")} />
    </mesh>
    
    {/* Armrests */}
    <mesh position={[-1.0, 0.32, 0]} castShadow>
      <boxGeometry args={[0.18, 0.32, 0.85]} />
      <meshStandardMaterial {...createFabricMaterial("#5A6958")} />
    </mesh>
    <mesh position={[1.0, 0.32, 0]} castShadow>
      <boxGeometry args={[0.18, 0.32, 0.85]} />
      <meshStandardMaterial {...createFabricMaterial("#5A6958")} />
    </mesh>
    
    {/* Throw pillows */}
    <mesh position={[-0.65, 0.45, 0.1]} rotation={[0.15, 0.2, 0.1]} castShadow>
      <boxGeometry args={[0.35, 0.35, 0.1]} />
      <meshStandardMaterial {...createFabricMaterial("#C8B090")} />
    </mesh>
    <mesh position={[0.65, 0.45, 0.1]} rotation={[0.15, -0.2, -0.1]} castShadow>
      <boxGeometry args={[0.35, 0.35, 0.1]} />
      <meshStandardMaterial {...createFabricMaterial("#A08060")} />
    </mesh>
  </group>
);

// Coffee table: 120cm x 60cm, 40cm height
const CoffeeTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Top */}
    <mesh position={[0, 0.38, 0]} castShadow>
      <boxGeometry args={[1.2, 0.04, 0.6]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4530")} />
    </mesh>
    {/* Legs */}
    {[[-0.52, -0.24], [0.52, -0.24], [-0.52, 0.24], [0.52, 0.24]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.18, pos[1]]} castShadow>
        <boxGeometry args={[0.05, 0.36, 0.05]} />
        <meshStandardMaterial {...createWoodMaterial("#4A3520")} />
      </mesh>
    ))}
    {/* Decorative books */}
    <mesh position={[-0.25, 0.42, 0.1]} castShadow>
      <boxGeometry args={[0.18, 0.04, 0.25]} />
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </mesh>
    <mesh position={[-0.25, 0.45, 0.08]} rotation={[0, 0.1, 0]} castShadow>
      <boxGeometry args={[0.16, 0.03, 0.22]} />
      <meshStandardMaterial color="#2F4F4F" roughness={0.8} />
    </mesh>
  </group>
);

// TV Unit: 180cm x 45cm, 50cm height
const TVUnit = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Cabinet */}
    <mesh position={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[1.8, 0.5, 0.45]} />
      <meshStandardMaterial {...createWoodMaterial("#3A3535")} />
    </mesh>
    {/* TV screen */}
    <mesh position={[0, 0.75, 0.1]} castShadow>
      <boxGeometry args={[1.4, 0.8, 0.05]} />
      <meshStandardMaterial color="#0A0A0A" roughness={0.1} />
    </mesh>
    {/* TV stand */}
    <mesh position={[0, 0.52, 0.05]} castShadow>
      <boxGeometry args={[0.25, 0.04, 0.15]} />
      <meshStandardMaterial {...createMetalMaterial("#404040")} />
    </mesh>
  </group>
);

// Dining table: 180cm x 90cm, 75cm height
const DiningTable = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Top */}
    <mesh position={[0, 0.73, 0]} castShadow>
      <boxGeometry args={[1.8, 0.05, 0.9]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4530")} />
    </mesh>
    {/* Legs */}
    {[[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.35, pos[1]]} castShadow>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial {...createWoodMaterial("#4A3520")} />
      </mesh>
    ))}
  </group>
);

// Dining chair: 45cm x 45cm, seat height 45cm
const DiningChair = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Seat */}
    <mesh position={[0, 0.43, 0]} castShadow>
      <boxGeometry args={[0.45, 0.06, 0.42]} />
      <meshStandardMaterial {...createFabricMaterial("#8B7B6A")} />
    </mesh>
    {/* Back */}
    <mesh position={[0, 0.72, -0.18]} castShadow>
      <boxGeometry args={[0.42, 0.52, 0.04]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4530")} />
    </mesh>
    {/* Legs */}
    {[[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.2, pos[1]]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial {...createWoodMaterial("#4A3520")} />
      </mesh>
    ))}
  </group>
);

// Kitchen counter: 90cm height, 60cm depth
const KitchenCounter = ({ position, rotation = 0, width = 2.4 }: { position: [number, number, number]; rotation?: number; width?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Base cabinets */}
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[width, 0.8, 0.6]} />
      <meshStandardMaterial {...createWoodMaterial("#8B7355")} />
    </mesh>
    {/* Countertop */}
    <mesh position={[0, 0.82, 0]} castShadow>
      <boxGeometry args={[width + 0.04, 0.04, 0.62]} />
      <meshStandardMaterial color="#E8E4DC" roughness={0.25} />
    </mesh>
    {/* Sink */}
    <mesh position={[width * 0.2, 0.81, 0]} castShadow>
      <boxGeometry args={[0.55, 0.02, 0.4]} />
      <meshStandardMaterial {...createMetalMaterial("#C0C0C0")} />
    </mesh>
    {/* Faucet */}
    <mesh position={[width * 0.2, 0.95, -0.15]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
      <meshStandardMaterial {...createMetalMaterial("#B8B8B8")} />
    </mesh>
    <mesh position={[width * 0.2, 1.0, -0.05]} rotation={[Math.PI/3, 0, 0]} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
      <meshStandardMaterial {...createMetalMaterial("#B8B8B8")} />
    </mesh>
    {/* Cooktop */}
    <mesh position={[-width * 0.25, 0.83, 0]} castShadow>
      <boxGeometry args={[0.6, 0.01, 0.52]} />
      <meshStandardMaterial color="#1A1A1A" roughness={0.2} />
    </mesh>
    {/* Burners */}
    {[[-0.15, 0], [0.15, 0]].map((pos, i) => (
      <mesh key={i} position={[-width * 0.25 + pos[0], 0.84, pos[1]]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.06, 0.08, 16]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} />
      </mesh>
    ))}
  </group>
);

// Refrigerator: 70cm x 70cm, 180cm height
const Refrigerator = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, 0.9, 0]} castShadow>
      <boxGeometry args={[0.7, 1.8, 0.68]} />
      <meshStandardMaterial color="#E8E8E8" roughness={0.3} metalness={0.15} />
    </mesh>
    {/* Door line */}
    <mesh position={[0, 0.55, 0.35]} castShadow>
      <boxGeometry args={[0.65, 0.02, 0.01]} />
      <meshStandardMaterial color="#D0D0D0" roughness={0.4} />
    </mesh>
    {/* Handle */}
    <mesh position={[0.28, 1.2, 0.36]} castShadow>
      <boxGeometry args={[0.03, 0.3, 0.03]} />
      <meshStandardMaterial {...createMetalMaterial("#C0C0C0")} />
    </mesh>
  </group>
);

// Wardrobe: 200cm x 60cm, wall height
const Wardrobe = ({ position, rotation = 0, width = 2.0 }: { position: [number, number, number]; rotation?: number; width?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[0, WALL_HEIGHT * 0.5, 0]} castShadow>
      <boxGeometry args={[width, WALL_HEIGHT, 0.6]} />
      <meshStandardMaterial {...createWoodMaterial("#5A4030")} />
    </mesh>
    {/* Door line */}
    <mesh position={[0, WALL_HEIGHT * 0.5, 0.31]} castShadow>
      <boxGeometry args={[0.02, WALL_HEIGHT - 0.1, 0.01]} />
      <meshStandardMaterial color="#3A2515" roughness={0.7} />
    </mesh>
    {/* Handles */}
    <mesh position={[-0.08, WALL_HEIGHT * 0.5, 0.32]} castShadow>
      <boxGeometry args={[0.02, 0.08, 0.02]} />
      <meshStandardMaterial {...createMetalMaterial("#A09080")} />
    </mesh>
    <mesh position={[0.08, WALL_HEIGHT * 0.5, 0.32]} castShadow>
      <boxGeometry args={[0.02, 0.08, 0.02]} />
      <meshStandardMaterial {...createMetalMaterial("#A09080")} />
    </mesh>
  </group>
);

// Area rug
const AreaRug = ({ position, width = 2.0, depth = 1.4, color = "#A08060" }: { position: [number, number, number]; width?: number; depth?: number; color?: string }) => (
  <mesh position={[position[0], FLOOR_HEIGHT + 0.005, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[width, depth]} />
    <meshStandardMaterial color={color} roughness={0.98} />
  </mesh>
);

// Potted plant
const PottedPlant = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.1, 0.24, 12]} />
      <meshStandardMaterial color="#C4A070" roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.12, 0.06, 12]} />
      <meshStandardMaterial color="#5A4030" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.45, 0]} castShadow>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshStandardMaterial color="#4A7050" roughness={0.92} />
    </mesh>
    <mesh position={[0.08, 0.55, 0.05]} castShadow>
      <sphereGeometry args={[0.12, 10, 10]} />
      <meshStandardMaterial color="#3A6040" roughness={0.92} />
    </mesh>
    <mesh position={[-0.06, 0.5, -0.08]} castShadow>
      <sphereGeometry args={[0.14, 10, 10]} />
      <meshStandardMaterial color="#5A8060" roughness={0.92} />
    </mesh>
  </group>
);

// Bathroom fixtures
const Toilet = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Base */}
    <mesh position={[0, 0.18, 0.08]} castShadow>
      <boxGeometry args={[0.38, 0.36, 0.55]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.2} />
    </mesh>
    {/* Tank */}
    <mesh position={[0, 0.45, -0.18]} castShadow>
      <boxGeometry args={[0.35, 0.35, 0.15]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.2} />
    </mesh>
    {/* Lid */}
    <mesh position={[0, 0.38, 0.12]} castShadow>
      <boxGeometry args={[0.36, 0.04, 0.42]} />
      <meshStandardMaterial color="#F5F5F5" roughness={0.15} />
    </mesh>
  </group>
);

const BathroomSink = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Pedestal */}
    <mesh position={[0, 0.35, 0]} castShadow>
      <boxGeometry args={[0.15, 0.7, 0.15]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.2} />
    </mesh>
    {/* Basin */}
    <mesh position={[0, 0.72, 0.05]} castShadow>
      <boxGeometry args={[0.5, 0.08, 0.4]} />
      <meshStandardMaterial color="#FAFAFA" roughness={0.15} />
    </mesh>
    {/* Faucet */}
    <mesh position={[0, 0.82, -0.1]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
      <meshStandardMaterial {...createMetalMaterial("#C0C0C0")} />
    </mesh>
  </group>
);

// ============================================================================
// UNIFIED APARTMENT FLOOR RENDERER
// ============================================================================

const getFloorMaterial = (roomName: string) => {
  const name = roomName.toLowerCase();
  if (name.includes("kitchen") || name.includes("bathroom")) {
    return "tile";
  }
  if (name.includes("meeting") || name.includes("office") || name.includes("study")) {
    return "carpet";
  }
  return "wood";
};

const UnifiedRoom = ({ room }: { room: RoomConfig }) => {
  const { name, width, depth, position } = room;
  const roomX = position[0];
  const roomZ = position[2];
  const floorType = getFloorMaterial(name);
  const roomName = name.toLowerCase();
  const halfW = width / 2;
  const halfD = depth / 2;

  // Calculate furniture placement within room boundaries with safety margins
  const safeMargin = 0.25;
  const safeWidth = width - safeMargin * 2;
  const safeDepth = depth - safeMargin * 2;

  const renderFurniture = () => {
    // Living room furniture
    if (roomName.includes("living")) {
      return (
        <>
          <Sofa3Seater position={[0, 0, -safeDepth * 0.25]} rotation={0} />
          <CoffeeTable position={[0, 0, safeDepth * 0.08]} rotation={0} />
          <TVUnit position={[0, 0, safeDepth * 0.4]} rotation={Math.PI} />
          <AreaRug position={[0, 0, 0]} width={Math.min(2.4, safeWidth * 0.8)} depth={Math.min(1.6, safeDepth * 0.5)} color="#B89070" />
          <PottedPlant position={[safeWidth * 0.4, 0, -safeDepth * 0.35]} scale={0.9} />
          <PottedPlant position={[-safeWidth * 0.42, 0, safeDepth * 0.38]} scale={0.7} />
        </>
      );
    }

    // Master bedroom
    if (roomName.includes("master")) {
      return (
        <>
          <DoubleBed position={[0, 0, -safeDepth * 0.1]} rotation={0} />
          <Nightstand position={[-safeWidth * 0.38, 0, -safeDepth * 0.1]} rotation={0} />
          <Nightstand position={[safeWidth * 0.38, 0, -safeDepth * 0.1]} rotation={0} />
          <Wardrobe position={[safeWidth * 0.3, 0, safeDepth * 0.38]} rotation={Math.PI} width={Math.min(1.6, safeWidth * 0.5)} />
          <AreaRug position={[0, 0, safeDepth * 0.1]} width={1.4} depth={0.8} color="#9A8B7A" />
        </>
      );
    }

    // Secondary bedroom
    if (roomName.includes("bedroom") || roomName.includes("bed")) {
      return (
        <>
          <SingleBed position={[0, 0, -safeDepth * 0.15]} rotation={0} />
          <Nightstand position={[safeWidth * 0.35, 0, -safeDepth * 0.15]} rotation={0} />
          <Wardrobe position={[-safeWidth * 0.32, 0, safeDepth * 0.35]} rotation={0} width={Math.min(1.2, safeWidth * 0.4)} />
        </>
      );
    }

    // Kitchen
    if (roomName.includes("kitchen")) {
      const counterWidth = Math.min(safeWidth * 0.85, 2.4);
      return (
        <>
          <KitchenCounter position={[0, 0, -safeDepth * 0.32]} rotation={0} width={counterWidth} />
          <Refrigerator position={[safeWidth * 0.35, 0, safeDepth * 0.2]} rotation={Math.PI} />
          <DiningTable position={[0, 0, safeDepth * 0.15]} rotation={0} />
          <DiningChair position={[-0.5, 0, safeDepth * 0.15 - 0.5]} rotation={0} />
          <DiningChair position={[0.5, 0, safeDepth * 0.15 - 0.5]} rotation={0} />
          <DiningChair position={[-0.5, 0, safeDepth * 0.15 + 0.5]} rotation={Math.PI} />
          <DiningChair position={[0.5, 0, safeDepth * 0.15 + 0.5]} rotation={Math.PI} />
        </>
      );
    }

    // Bathroom
    if (roomName.includes("bathroom") || roomName.includes("bath")) {
      return (
        <>
          <Toilet position={[-safeWidth * 0.25, 0, -safeDepth * 0.25]} rotation={0} />
          <BathroomSink position={[safeWidth * 0.25, 0, -safeDepth * 0.28]} rotation={0} />
        </>
      );
    }

    // Study/Office
    if (roomName.includes("study") || roomName.includes("office") || roomName.includes("meeting")) {
      return (
        <>
          <DiningTable position={[0, 0, 0]} rotation={0} />
          <DiningChair position={[0, 0, -0.6]} rotation={0} />
          <DiningChair position={[-0.6, 0, 0]} rotation={Math.PI / 2} />
          <DiningChair position={[0.6, 0, 0]} rotation={-Math.PI / 2} />
        </>
      );
    }

    return null;
  };

  // Determine wall openings based on room type
  const getWallOpenings = () => {
    const openings: { wall: string; type: "door" | "window" }[] = [];
    
    if (roomName.includes("entrance")) {
      openings.push({ wall: "south", type: "door" });
    } else if (roomName.includes("living")) {
      openings.push({ wall: "north", type: "window" });
      openings.push({ wall: "east", type: "door" });
    } else if (roomName.includes("bedroom") || roomName.includes("master")) {
      openings.push({ wall: "north", type: "window" });
      openings.push({ wall: "west", type: "door" });
    } else if (roomName.includes("kitchen")) {
      openings.push({ wall: "west", type: "door" });
      openings.push({ wall: "east", type: "window" });
    } else if (roomName.includes("bathroom")) {
      openings.push({ wall: "south", type: "door" });
    }
    
    return openings;
  };

  const openings = getWallOpenings();
  const hasNorthDoor = openings.some(o => o.wall === "north" && o.type === "door");
  const hasNorthWindow = openings.some(o => o.wall === "north" && o.type === "window");
  const hasSouthDoor = openings.some(o => o.wall === "south" && o.type === "door");
  const hasEastDoor = openings.some(o => o.wall === "east" && o.type === "door");
  const hasEastWindow = openings.some(o => o.wall === "east" && o.type === "window");
  const hasWestDoor = openings.some(o => o.wall === "west" && o.type === "door");

  return (
    <group position={[roomX, 0, roomZ]}>
      {/* Floor rendering based on room type */}
      {floorType === "wood" ? (
        <HerringboneWoodFloor width={width} depth={depth} />
      ) : floorType === "tile" ? (
        <CeramicTileFloor width={width} depth={depth} />
      ) : (
        <CarpetFloor width={width} depth={depth} />
      )}

      {/* Walls with exact room geometry - architectural accuracy */}
      {/* North wall */}
      <ArchitecturalWall 
        start={[-halfW, -halfD]} 
        end={[halfW, -halfD]}
        hasOpening={hasNorthDoor || hasNorthWindow}
        openingType={hasNorthWindow ? "window" : "door"}
      />
      {/* South wall - lower for visibility */}
      <ArchitecturalWall 
        start={[-halfW, halfD]} 
        end={[halfW, halfD]}
        height={WALL_HEIGHT * 0.5}
        hasOpening={hasSouthDoor}
        openingType="door"
      />
      {/* West wall */}
      <ArchitecturalWall 
        start={[-halfW, -halfD]} 
        end={[-halfW, halfD]}
        hasOpening={hasWestDoor}
        openingType="door"
      />
      {/* East wall - lower for visibility */}
      <ArchitecturalWall 
        start={[halfW, -halfD]} 
        end={[halfW, halfD]}
        height={WALL_HEIGHT * 0.5}
        hasOpening={hasEastDoor || hasEastWindow}
        openingType={hasEastWindow ? "window" : "door"}
      />

      {/* Furniture placed within room bounds */}
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
      
      {/* Key light - soft sun through window */}
      <directionalLight
        position={[15, 40, 15]}
        intensity={0.8}
        color="#FFF5E8"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={80}
        shadow-camera-left={-plotWidth}
        shadow-camera-right={plotWidth}
        shadow-camera-top={plotDepth}
        shadow-camera-bottom={-plotDepth}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light - softer, cooler */}
      <directionalLight 
        position={[-10, 20, -10]} 
        intensity={0.25} 
        color="#E8F0FF"
      />
      
      {/* Rim light for depth */}
      <directionalLight 
        position={[0, 15, -20]} 
        intensity={0.15} 
        color="#FFFFFF"
      />

      {/* Ground plane with subtle texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[plotWidth * 2, plotDepth * 2]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.98} />
      </mesh>

      {/* Building foundation */}
      <mesh position={[0, -0.03, 0]} receiveShadow castShadow>
        <boxGeometry args={[plotWidth * 0.98, 0.05, plotDepth * 0.98]} />
        <meshStandardMaterial color="#D8D4CC" roughness={0.9} />
      </mesh>

      {/* Unified apartment floor plan */}
      {rooms.map((room, index) => (
        <UnifiedRoom key={`${room.name}-${index}`} room={room} />
      ))}

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={Math.max(plotWidth, plotDepth) * 1.5}
        blur={2}
        far={10}
        color="#4A4040"
      />

      {/* Environment for realistic reflections */}
      <Environment preset="apartment" />
    </>
  );
};

// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================

export default function ArchitecturalFloorPlan3D({
  rooms = [],
  plotWidth = 12,
  plotDepth = 18,
}: ArchitecturalFloorPlan3DProps) {
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
