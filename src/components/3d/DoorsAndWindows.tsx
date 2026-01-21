import * as THREE from "three";

interface DoorProps {
  position: [number, number, number];
  rotation?: number;
  width?: number;
  height?: number;
  isOpen?: boolean;
  openAngle?: number;
}

// Realistic door with frame
export const Door = ({ 
  position, 
  rotation = 0, 
  width = 0.9, 
  height = 2.1,
  isOpen = false,
  openAngle = Math.PI / 3
}: DoorProps) => {
  const frameThickness = 0.08;
  const frameDepth = 0.12;
  const doorThickness = 0.04;
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Door frame - left */}
      <mesh position={[-width / 2 - frameThickness / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[frameThickness, height + frameThickness, frameDepth]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      
      {/* Door frame - right */}
      <mesh position={[width / 2 + frameThickness / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[frameThickness, height + frameThickness, frameDepth]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      
      {/* Door frame - top */}
      <mesh position={[0, height + frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      
      {/* Door panel */}
      <group 
        position={[-width / 2 + doorThickness / 2, height / 2, 0]}
        rotation={[0, isOpen ? openAngle : 0, 0]}
      >
        <mesh position={[width / 2 - doorThickness / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width - 0.02, height - 0.02, doorThickness]} />
          <meshStandardMaterial color="#8b7355" roughness={0.6} />
        </mesh>
        
        {/* Door panels (decorative) */}
        <mesh position={[width / 2 - doorThickness / 2, height / 4, doorThickness / 2 + 0.005]} castShadow>
          <boxGeometry args={[width * 0.7, height * 0.35, 0.01]} />
          <meshStandardMaterial color="#7a6245" roughness={0.7} />
        </mesh>
        <mesh position={[width / 2 - doorThickness / 2, -height / 4, doorThickness / 2 + 0.005]} castShadow>
          <boxGeometry args={[width * 0.7, height * 0.35, 0.01]} />
          <meshStandardMaterial color="#7a6245" roughness={0.7} />
        </mesh>
        
        {/* Door handle */}
        <mesh position={[width - 0.15, 0, doorThickness / 2 + 0.02]} castShadow>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[width - 0.15, 0, -doorThickness / 2 - 0.02]} castShadow>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
      
      {/* Threshold */}
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[width, 0.02, frameDepth + 0.02]} />
        <meshStandardMaterial color="#4a3328" roughness={0.6} />
      </mesh>
    </group>
  );
};

interface WindowProps {
  position: [number, number, number];
  rotation?: number;
  width?: number;
  height?: number;
  hasCurtains?: boolean;
  curtainColor?: string;
}

// Realistic window with frame and glass
export const Window = ({ 
  position, 
  rotation = 0, 
  width = 1.2, 
  height = 1.2,
  hasCurtains = true,
  curtainColor = "#e8e0d5"
}: WindowProps) => {
  const frameThickness = 0.06;
  const frameDepth = 0.1;
  const glassThickness = 0.01;
  const dividerThickness = 0.03;
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Window frame - outer */}
      <mesh castShadow>
        <boxGeometry args={[width + frameThickness * 2, height + frameThickness * 2, frameDepth]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>
      
      {/* Inner frame cutout (visual) */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width, height, frameDepth]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.4} />
      </mesh>
      
      {/* Glass pane */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width - 0.02, height - 0.02, glassThickness]} />
        <meshStandardMaterial 
          color="#a8d4e6" 
          transparent 
          opacity={0.3} 
          roughness={0.1}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Vertical divider */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[dividerThickness, height - 0.04, 0.02]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      
      {/* Horizontal divider */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[width - 0.04, dividerThickness, 0.02]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      
      {/* Window sill */}
      <mesh position={[0, -height / 2 - 0.04, frameDepth / 2 + 0.03]} castShadow>
        <boxGeometry args={[width + frameThickness * 3, 0.04, 0.12]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.4} />
      </mesh>
      
      {/* Curtains */}
      {hasCurtains && (
        <>
          {/* Left curtain */}
          <mesh position={[-width / 2 - 0.05, 0.1, frameDepth / 2 + 0.08]} castShadow>
            <boxGeometry args={[width * 0.35, height + 0.3, 0.03]} />
            <meshStandardMaterial color={curtainColor} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          
          {/* Right curtain */}
          <mesh position={[width / 2 + 0.05, 0.1, frameDepth / 2 + 0.08]} castShadow>
            <boxGeometry args={[width * 0.35, height + 0.3, 0.03]} />
            <meshStandardMaterial color={curtainColor} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          
          {/* Curtain rod */}
          <mesh position={[0, height / 2 + 0.2, frameDepth / 2 + 0.06]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, width + 0.5, 8]} />
            <meshStandardMaterial color="#8b7355" roughness={0.4} metalness={0.3} />
          </mesh>
          
          {/* Rod ends */}
          <mesh position={[-width / 2 - 0.28, height / 2 + 0.2, frameDepth / 2 + 0.06]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#8b7355" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[width / 2 + 0.28, height / 2 + 0.2, frameDepth / 2 + 0.06]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#8b7355" roughness={0.4} metalness={0.3} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Sliding glass door (for living room / patio access)
export const SlidingDoor = ({ 
  position, 
  rotation = 0, 
  width = 2, 
  height = 2.2 
}: DoorProps) => {
  const frameThickness = 0.06;
  const frameDepth = 0.12;
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[-width / 2 - frameThickness / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[width / 2 + frameThickness / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, height + frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.3} />
      </mesh>
      
      {/* Glass panels */}
      <mesh position={[-width / 4, height / 2, -0.02]}>
        <boxGeometry args={[width / 2 - 0.02, height - 0.04, 0.02]} />
        <meshStandardMaterial 
          color="#b8d4e6" 
          transparent 
          opacity={0.25} 
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[width / 4, height / 2, 0.02]}>
        <boxGeometry args={[width / 2 - 0.02, height - 0.04, 0.02]} />
        <meshStandardMaterial 
          color="#b8d4e6" 
          transparent 
          opacity={0.25} 
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Panel frames */}
      <mesh position={[-width / 4, height / 2, -0.02]} castShadow>
        <boxGeometry args={[width / 2, 0.04, 0.03]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[width / 4, height / 2, 0.02]} castShadow>
        <boxGeometry args={[width / 2, 0.04, 0.03]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.3} />
      </mesh>
      
      {/* Handle */}
      <mesh position={[0.1, height / 2, 0.05]} castShadow>
        <boxGeometry args={[0.02, 0.2, 0.03]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Track */}
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[width, 0.02, frameDepth]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
};

// Bathroom window (smaller, frosted)
export const BathroomWindow = ({ 
  position, 
  rotation = 0, 
  width = 0.6, 
  height = 0.6 
}: WindowProps) => {
  const frameThickness = 0.05;
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[width + frameThickness * 2, height + frameThickness * 2, 0.08]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>
      
      {/* Frosted glass */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width, height, 0.01]} />
        <meshStandardMaterial 
          color="#e8f4f8" 
          transparent 
          opacity={0.6} 
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Cross dividers */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[0.02, height, 0.015]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[width, 0.02, 0.015]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
    </group>
  );
};

export default { Door, Window, SlidingDoor, BathroomWindow };
