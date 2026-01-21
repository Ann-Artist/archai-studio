import { Text } from "@react-three/drei";
import * as THREE from "three";

interface ScaleIndicatorProps {
  position: [number, number, number];
  length?: number;
  isWireframe?: boolean;
}

export const ScaleIndicator = ({ position, length = 5, isWireframe = false }: ScaleIndicatorProps) => {
  const color = isWireframe ? "#64748b" : "#78716c";
  const tickHeight = 0.15;
  
  return (
    <group position={position}>
      {/* Main line */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[length, 0.03, 0.03]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Start tick */}
      <mesh position={[-length / 2, 0, 0]}>
        <boxGeometry args={[0.03, tickHeight, 0.03]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* End tick */}
      <mesh position={[length / 2, 0, 0]}>
        <boxGeometry args={[0.03, tickHeight, 0.03]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Middle ticks */}
      {Array.from({ length: length - 1 }, (_, i) => (
        <mesh key={i} position={[-length / 2 + (i + 1), 0, 0]}>
          <boxGeometry args={[0.02, tickHeight * 0.5, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      
      {/* Label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="top"
      >
        {`${length} meters`}
      </Text>
    </group>
  );
};

interface PlotDimensionsProps {
  plotWidth: number;
  plotDepth: number;
  isWireframe?: boolean;
}

export const PlotDimensions = ({ plotWidth, plotDepth, isWireframe = false }: PlotDimensionsProps) => {
  const color = isWireframe ? "#64748b" : "#78716c";
  
  return (
    <group>
      {/* Width dimension (top) */}
      <group position={[0, 0.1, -plotDepth / 2 - 0.8]}>
        {/* Line */}
        <mesh>
          <boxGeometry args={[plotWidth, 0.02, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* End caps */}
        <mesh position={[-plotWidth / 2, 0, 0]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[plotWidth / 2, 0, 0]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Label */}
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="bottom"
        >
          {`${plotWidth}m`}
        </Text>
      </group>
      
      {/* Depth dimension (left side) */}
      <group position={[-plotWidth / 2 - 0.8, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Line */}
        <mesh>
          <boxGeometry args={[plotDepth, 0.02, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* End caps */}
        <mesh position={[-plotDepth / 2, 0, 0]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[plotDepth / 2, 0, 0]}>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Label */}
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="bottom"
          rotation={[0, Math.PI, 0]}
        >
          {`${plotDepth}m`}
        </Text>
      </group>
    </group>
  );
};

interface EnhancedCompassProps {
  position: [number, number, number];
  isWireframe?: boolean;
}

export const EnhancedCompass = ({ position, isWireframe = false }: EnhancedCompassProps) => {
  const primaryColor = "#dc2626";
  const secondaryColor = isWireframe ? "#64748b" : "#78716c";
  
  return (
    <group position={position}>
      {/* Compass base circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      {/* North indicator */}
      <mesh position={[0, 0.03, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.25, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
      
      {/* South indicator */}
      <mesh position={[0, 0.03, 0.25]} rotation={[-Math.PI / 2, Math.PI, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      
      {/* East indicator */}
      <mesh position={[0.2, 0.03, 0]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]}>
        <coneGeometry args={[0.06, 0.15, 6]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      
      {/* West indicator */}
      <mesh position={[-0.2, 0.03, 0]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
        <coneGeometry args={[0.06, 0.15, 6]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      
      {/* Direction labels */}
      <Text
        position={[0, 0.15, -0.55]}
        fontSize={0.25}
        color={primaryColor}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        N
      </Text>
      <Text
        position={[0, 0.15, 0.55]}
        fontSize={0.2}
        color={secondaryColor}
        anchorX="center"
        anchorY="middle"
      >
        S
      </Text>
      <Text
        position={[0.5, 0.15, 0]}
        fontSize={0.2}
        color={secondaryColor}
        anchorX="center"
        anchorY="middle"
      >
        E
      </Text>
      <Text
        position={[-0.5, 0.15, 0]}
        fontSize={0.2}
        color={secondaryColor}
        anchorX="center"
        anchorY="middle"
      >
        W
      </Text>
    </group>
  );
};

export default { ScaleIndicator, PlotDimensions, EnhancedCompass };
