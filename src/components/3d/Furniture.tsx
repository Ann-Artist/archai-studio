import { useMemo } from "react";
import * as THREE from "three";

// Furniture component types
interface FurnitureProps {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}

// Sofa component
export const Sofa = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Sofa base */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.4, 0.9]} />
        <meshStandardMaterial color="#6b5b4f" roughness={0.8} />
      </mesh>
      {/* Sofa back */}
      <mesh position={[0, 0.5, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.6, 0.2]} />
        <meshStandardMaterial color="#5a4a3f" roughness={0.8} />
      </mesh>
      {/* Left armrest */}
      <mesh position={[-0.9, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.3, 0.9]} />
        <meshStandardMaterial color="#5a4a3f" roughness={0.8} />
      </mesh>
      {/* Right armrest */}
      <mesh position={[0.9, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.3, 0.9]} />
        <meshStandardMaterial color="#5a4a3f" roughness={0.8} />
      </mesh>
      {/* Cushions */}
      <mesh position={[-0.5, 0.45, 0.05]} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.6]} />
        <meshStandardMaterial color="#8b7b6b" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.45, 0.05]} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.6]} />
        <meshStandardMaterial color="#8b7b6b" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Coffee table
export const CoffeeTable = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Table top */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.05, 0.6]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.4, 0], [0.4, 0], [-0.4, 0], [0.4, 0]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.175, i < 2 ? 0.25 : -0.25]} castShadow>
          <boxGeometry args={[0.05, 0.35, 0.05]} />
          <meshStandardMaterial color="#3a2718" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// TV unit
export const TVUnit = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Cabinet */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 0.4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      {/* TV Screen */}
      <mesh position={[0, 0.85, 0.05]} castShadow>
        <boxGeometry args={[1.4, 0.8, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* TV frame */}
      <mesh position={[0, 0.85, 0.02]}>
        <boxGeometry args={[1.5, 0.9, 0.02]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Bed
export const Bed = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Bed frame */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.3, 2.2]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.4, 0.1]} castShadow>
        <boxGeometry args={[1.9, 0.2, 2]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.7, -1]} castShadow>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial color="#4a3328" roughness={0.7} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.5, 0.55, -0.7]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.4]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.95} />
      </mesh>
      <mesh position={[0.5, 0.55, -0.7]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.4]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.95} />
      </mesh>
      {/* Blanket */}
      <mesh position={[0, 0.52, 0.4]} castShadow>
        <boxGeometry args={[1.85, 0.08, 1.2]} />
        <meshStandardMaterial color="#7c9eb2" roughness={0.95} />
      </mesh>
    </group>
  );
};

// Small bed (for bedroom 2)
export const SmallBed = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Bed frame */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.3, 2]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.35, 0.1]} castShadow>
        <boxGeometry args={[1.1, 0.15, 1.8]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.55, -0.9]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.08]} />
        <meshStandardMaterial color="#4a3328" roughness={0.7} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.48, -0.6]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.35]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.95} />
      </mesh>
      {/* Blanket */}
      <mesh position={[0, 0.45, 0.3]} castShadow>
        <boxGeometry args={[1.05, 0.06, 1]} />
        <meshStandardMaterial color="#b8a4c9" roughness={0.95} />
      </mesh>
    </group>
  );
};

// Nightstand
export const Nightstand = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      {/* Drawer */}
      <mesh position={[0, 0.25, 0.21]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.02]} />
        <meshStandardMaterial color="#4a3328" roughness={0.6} />
      </mesh>
      {/* Lamp base */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#8b7355" roughness={0.5} />
      </mesh>
      {/* Lamp shade */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.15, 0.25, 16, 1, true]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Wardrobe
export const Wardrobe = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2, 0.6]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      {/* Door line */}
      <mesh position={[0, 1, 0.31]} castShadow>
        <boxGeometry args={[0.02, 1.9, 0.01]} />
        <meshStandardMaterial color="#3a2718" roughness={0.6} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.1, 1, 0.32]} castShadow>
        <boxGeometry args={[0.03, 0.15, 0.02]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0.1, 1, 0.32]} castShadow>
        <boxGeometry args={[0.03, 0.15, 0.02]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// Kitchen counter
export const KitchenCounter = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Counter base */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.9, 0.6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[2.6, 0.04, 0.65]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} />
      </mesh>
      {/* Sink */}
      <mesh position={[0.5, 0.91, 0]} castShadow>
        <boxGeometry args={[0.6, 0.02, 0.4]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Stove */}
      <mesh position={[-0.7, 0.93, 0]} castShadow>
        <boxGeometry args={[0.8, 0.02, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* Burners */}
      {[[-0.9, -0.1], [-0.5, -0.1], [-0.9, 0.1], [-0.5, 0.1]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.95, pos[1]]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Upper cabinets
export const UpperCabinets = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.7, 0.35]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      {/* Door lines */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 0.18]} castShadow>
          <boxGeometry args={[0.02, 0.6, 0.01]} />
          <meshStandardMaterial color="#d0d0d0" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Refrigerator
export const Refrigerator = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.8, 0.7]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Door line */}
      <mesh position={[0, 0.6, 0.36]} castShadow>
        <boxGeometry args={[0.7, 0.02, 0.01]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} />
      </mesh>
      {/* Handles */}
      <mesh position={[0.35, 1.2, 0.38]} castShadow>
        <boxGeometry args={[0.02, 0.4, 0.03]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.35, 0.38]} castShadow>
        <boxGeometry args={[0.02, 0.3, 0.03]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// Dining table
export const DiningTable = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Table top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.8]} />
        <meshStandardMaterial color="#5c4033" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.375, pos[1]]} castShadow>
          <boxGeometry args={[0.06, 0.75, 0.06]} />
          <meshStandardMaterial color="#4a3328" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Chair
export const Chair = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.05, 0.45]} />
        <meshStandardMaterial color="#5c4033" roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.04]} />
        <meshStandardMaterial color="#5c4033" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.225, pos[1]]} castShadow>
          <boxGeometry args={[0.04, 0.45, 0.04]} />
          <meshStandardMaterial color="#4a3328" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Toilet
export const Toilet = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Bowl */}
      <mesh position={[0, 0.2, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.4, 0.5]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.45, -0.15]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.42, 0.1]} castShadow>
        <boxGeometry args={[0.38, 0.04, 0.45]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.4} />
      </mesh>
    </group>
  );
};

// Bathtub
export const Bathtub = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Outer shell */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 1.6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
      {/* Inner cutout (visual) */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.65, 0.5, 1.45]} />
        <meshStandardMaterial color="#e0e8f0" roughness={0.2} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, 0.65, -0.7]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
};

// Bathroom sink
export const BathroomSink = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Cabinet */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.7, 0.45]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      {/* Sink top */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.65, 0.04, 0.5]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, 0.71, 0.05]} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.08, 16]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.2} />
      </mesh>
      {/* Mirror */}
      <mesh position={[0, 1.2, -0.2]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.02]} />
        <meshStandardMaterial color="#b8c8d8" roughness={0.1} metalness={0.3} />
      </mesh>
    </group>
  );
};

// Shoe rack (for entrance)
export const ShoeRack = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.35]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      {/* Shelves */}
      {[0.15, 0.35].map((y, i) => (
        <mesh key={i} position={[0, y, 0.01]} castShadow>
          <boxGeometry args={[0.75, 0.02, 0.32]} />
          <meshStandardMaterial color="#4a3328" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Coat rack
export const CoatRack = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Stand */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.05, 1.8, 8]} />
        <meshStandardMaterial color="#4a3328" roughness={0.6} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
        <meshStandardMaterial color="#3a2718" roughness={0.6} />
      </mesh>
      {/* Hooks */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, i) => (
        <mesh 
          key={i} 
          position={[Math.cos(angle) * 0.15, 1.6, Math.sin(angle) * 0.15]}
          rotation={[0, angle, Math.PI / 4]} 
          castShadow
        >
          <cylinderGeometry args={[0.015, 0.015, 0.12, 6]} />
          <meshStandardMaterial color="#5c4a3d" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Rug
export const Rug = ({ position, rotation = 0, scale = 1, color = "#8b6b5b" }: FurnitureProps & { color?: string }) => {
  return (
    <mesh position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, rotation]} scale={scale} receiveShadow>
      <planeGeometry args={[2, 1.5]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
};

// Plant
export const Plant = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {/* Plant */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Desk
export const Desk = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Table top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.6]} />
        <meshStandardMaterial color="#5c4033" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.375, pos[1]]} castShadow>
          <boxGeometry args={[0.05, 0.75, 0.05]} />
          <meshStandardMaterial color="#4a3328" roughness={0.6} />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 1.05, -0.15]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.03]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.82, -0.15]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.1]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.78, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Office chair
export const OfficeChair = ({ position, rotation = 0, scale = 1 }: FurnitureProps) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.8, -0.22]} castShadow>
        <boxGeometry args={[0.45, 0.6, 0.05]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
};

export default {
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
};
