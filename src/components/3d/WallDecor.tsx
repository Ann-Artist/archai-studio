import { useMemo } from "react";
import * as THREE from "three";

interface WallDecorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  style?: string;
}

// Picture Frame with Canvas Art
export const PictureFrame = ({ 
  position, 
  rotation = [0, 0, 0], 
  style = "modern",
  size = "medium"
}: WallDecorProps & { size?: "small" | "medium" | "large" }) => {
  const dimensions = {
    small: { width: 0.4, height: 0.3, frame: 0.03 },
    medium: { width: 0.6, height: 0.45, frame: 0.04 },
    large: { width: 0.9, height: 0.6, frame: 0.05 },
  };

  const { width, height, frame } = dimensions[size];

  const colors = useMemo(() => {
    const styleColors: Record<string, { frame: string; canvas: string; accent: string }> = {
      modern: { frame: "#1e293b", canvas: "#f1f5f9", accent: "#3b82f6" },
      minimalist: { frame: "#0f172a", canvas: "#ffffff", accent: "#64748b" },
      luxury: { frame: "#d4af37", canvas: "#1a1a2e", accent: "#8b5cf6" },
      rustic: { frame: "#8b4513", canvas: "#f5deb3", accent: "#2e8b57" },
      scandinavian: { frame: "#e2e8f0", canvas: "#ffffff", accent: "#1e293b" },
      industrial: { frame: "#374151", canvas: "#1f2937", accent: "#f97316" },
      bohemian: { frame: "#92400e", canvas: "#fef3c7", accent: "#ec4899" },
      contemporary: { frame: "#1e293b", canvas: "#f8fafc", accent: "#f43f5e" },
    };
    return styleColors[style] || styleColors.modern;
  }, [style]);

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[width + frame * 2, height + frame * 2, 0.02]} />
        <meshStandardMaterial color={colors.frame} roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Canvas/Art */}
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={colors.canvas} roughness={0.9} />
      </mesh>
      
      {/* Abstract art shapes */}
      <mesh position={[-width * 0.2, height * 0.1, 0.012]}>
        <circleGeometry args={[width * 0.15, 32]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      <mesh position={[width * 0.15, -height * 0.1, 0.012]}>
        <planeGeometry args={[width * 0.3, height * 0.2]} />
        <meshStandardMaterial color={colors.frame} />
      </mesh>
    </group>
  );
};

// Landscape Painting
export const LandscapePainting = ({ 
  position, 
  rotation = [0, 0, 0],
  style = "modern"
}: WallDecorProps) => {
  const colors = useMemo(() => {
    const styleColors: Record<string, { frame: string; sky: string; ground: string; sun: string }> = {
      modern: { frame: "#1e293b", sky: "#7dd3fc", ground: "#4ade80", sun: "#fbbf24" },
      minimalist: { frame: "#0f172a", sky: "#e0f2fe", ground: "#d1fae5", sun: "#fef3c7" },
      luxury: { frame: "#d4af37", sky: "#1e40af", ground: "#166534", sun: "#f59e0b" },
      rustic: { frame: "#8b4513", sky: "#fdba74", ground: "#a3e635", sun: "#fbbf24" },
      scandinavian: { frame: "#f1f5f9", sky: "#bae6fd", ground: "#bbf7d0", sun: "#fcd34d" },
      industrial: { frame: "#374151", sky: "#94a3b8", ground: "#6b7280", sun: "#fb923c" },
      bohemian: { frame: "#92400e", sky: "#c084fc", ground: "#4ade80", sun: "#fbbf24" },
      contemporary: { frame: "#1e293b", sky: "#38bdf8", ground: "#34d399", sun: "#fbbf24" },
    };
    return styleColors[style] || styleColors.modern;
  }, [style]);

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.7, 0.03]} />
        <meshStandardMaterial color={colors.frame} roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Sky */}
      <mesh position={[0, 0.1, 0.016]}>
        <planeGeometry args={[0.92, 0.35]} />
        <meshStandardMaterial color={colors.sky} />
      </mesh>
      
      {/* Ground/Hills */}
      <mesh position={[0, -0.15, 0.016]}>
        <planeGeometry args={[0.92, 0.27]} />
        <meshStandardMaterial color={colors.ground} />
      </mesh>
      
      {/* Sun */}
      <mesh position={[0.3, 0.2, 0.017]}>
        <circleGeometry args={[0.08, 32]} />
        <meshStandardMaterial color={colors.sun} emissive={colors.sun} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

// Decorative Mirror
export const DecorativeMirror = ({ 
  position, 
  rotation = [0, 0, 0],
  style = "modern",
  shape = "rectangular"
}: WallDecorProps & { shape?: "rectangular" | "circular" | "oval" }) => {
  const colors = useMemo(() => {
    const styleColors: Record<string, { frame: string }> = {
      modern: { frame: "#1e293b" },
      minimalist: { frame: "#0f172a" },
      luxury: { frame: "#d4af37" },
      rustic: { frame: "#8b4513" },
      scandinavian: { frame: "#f1f5f9" },
      industrial: { frame: "#374151" },
      bohemian: { frame: "#92400e" },
      contemporary: { frame: "#1e293b" },
    };
    return styleColors[style] || styleColors.modern;
  }, [style]);

  const mirrorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#c0d6df",
      roughness: 0.05,
      metalness: 0.9,
      envMapIntensity: 1,
    });
  }, []);

  if (shape === "circular") {
    return (
      <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.03, 32]} />
        <meshStandardMaterial color={colors.frame} roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Mirror surface */}
        <mesh position={[0, 0, 0.016]}>
          <circleGeometry args={[0.32, 32]} />
          <primitive object={mirrorMaterial} attach="material" />
        </mesh>
      </group>
    );
  }

  if (shape === "oval") {
    return (
      <group position={position} rotation={rotation}>
      {/* Frame - using scale to make oval */}
      <mesh castShadow scale={[1, 1.4, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.03, 32]} />
        <meshStandardMaterial color={colors.frame} roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Mirror surface */}
        <mesh position={[0, 0, 0.016]} scale={[1, 1.4, 1]}>
          <circleGeometry args={[0.25, 32]} />
          <primitive object={mirrorMaterial} attach="material" />
        </mesh>
      </group>
    );
  }

  // Rectangular
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.7, 0.03]} />
        <meshStandardMaterial color={colors.frame} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Mirror surface */}
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.44, 0.64]} />
        <primitive object={mirrorMaterial} attach="material" />
      </mesh>
    </group>
  );
};

// Wall Clock
export const WallClock = ({ 
  position, 
  rotation = [0, 0, 0],
  style = "modern"
}: WallDecorProps) => {
  const colors = useMemo(() => {
    const styleColors: Record<string, { frame: string; face: string; hands: string }> = {
      modern: { frame: "#1e293b", face: "#ffffff", hands: "#0f172a" },
      minimalist: { frame: "#0f172a", face: "#f8fafc", hands: "#1e293b" },
      luxury: { frame: "#d4af37", face: "#1a1a2e", hands: "#d4af37" },
      rustic: { frame: "#8b4513", face: "#f5deb3", hands: "#5c3317" },
      scandinavian: { frame: "#e2e8f0", face: "#ffffff", hands: "#1e293b" },
      industrial: { frame: "#374151", face: "#1f2937", hands: "#f97316" },
      bohemian: { frame: "#92400e", face: "#fef3c7", hands: "#7c3aed" },
      contemporary: { frame: "#1e293b", face: "#f8fafc", hands: "#f43f5e" },
    };
    return styleColors[style] || styleColors.modern;
  }, [style]);

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 32]} />
        <meshStandardMaterial color={colors.frame} roughness={0.3} metalness={0.4} />
      </mesh>
      
      {/* Clock face */}
      <mesh position={[0, 0, 0.016]}>
        <circleGeometry args={[0.18, 32]} />
        <meshStandardMaterial color={colors.face} />
      </mesh>
      
      {/* Hour markers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(angle * Math.PI / 180) * 0.14,
            Math.cos(angle * Math.PI / 180) * 0.14,
            0.017
          ]}
        >
          <circleGeometry args={[0.01, 8]} />
          <meshStandardMaterial color={colors.hands} />
        </mesh>
      ))}
      
      {/* Hour hand */}
      <mesh position={[0.03, 0.04, 0.018]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.015, 0.08, 0.005]} />
        <meshStandardMaterial color={colors.hands} />
      </mesh>
      
      {/* Minute hand */}
      <mesh position={[-0.02, 0.06, 0.019]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.01, 0.12, 0.005]} />
        <meshStandardMaterial color={colors.hands} />
      </mesh>
      
      {/* Center dot */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.015, 16]} />
        <meshStandardMaterial color={colors.hands} />
      </mesh>
    </group>
  );
};

// Wall Shelf with Decor Items
export const WallShelf = ({ 
  position, 
  rotation = [0, 0, 0],
  style = "modern"
}: WallDecorProps) => {
  const colors = useMemo(() => {
    const styleColors: Record<string, { shelf: string; items: string[] }> = {
      modern: { shelf: "#1e293b", items: ["#3b82f6", "#10b981", "#f59e0b"] },
      minimalist: { shelf: "#0f172a", items: ["#64748b", "#94a3b8", "#cbd5e1"] },
      luxury: { shelf: "#d4af37", items: ["#8b5cf6", "#ec4899", "#14b8a6"] },
      rustic: { shelf: "#8b4513", items: ["#2e8b57", "#daa520", "#cd853f"] },
      scandinavian: { shelf: "#f1f5f9", items: ["#1e293b", "#64748b", "#f59e0b"] },
      industrial: { shelf: "#374151", items: ["#f97316", "#0ea5e9", "#84cc16"] },
      bohemian: { shelf: "#92400e", items: ["#7c3aed", "#ec4899", "#f59e0b"] },
      contemporary: { shelf: "#1e293b", items: ["#f43f5e", "#3b82f6", "#22d3ee"] },
    };
    return styleColors[style] || styleColors.modern;
  }, [style]);

  return (
    <group position={position} rotation={rotation}>
      {/* Shelf board */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.03, 0.15]} />
        <meshStandardMaterial color={colors.shelf} roughness={0.5} />
      </mesh>
      
      {/* Bracket left */}
      <mesh position={[-0.3, -0.06, 0.05]} castShadow>
        <boxGeometry args={[0.02, 0.1, 0.08]} />
        <meshStandardMaterial color={colors.shelf} roughness={0.5} />
      </mesh>
      
      {/* Bracket right */}
      <mesh position={[0.3, -0.06, 0.05]} castShadow>
        <boxGeometry args={[0.02, 0.1, 0.08]} />
        <meshStandardMaterial color={colors.shelf} roughness={0.5} />
      </mesh>
      
      {/* Decorative items */}
      {/* Small vase */}
      <mesh position={[-0.25, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.03, 0.1, 16]} />
        <meshStandardMaterial color={colors.items[0]} />
      </mesh>
      
      {/* Book */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.08]} />
        <meshStandardMaterial color={colors.items[1]} />
      </mesh>
      
      {/* Small plant */}
      <mesh position={[0.25, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={colors.items[2]} />
      </mesh>
    </group>
  );
};

// Photo Gallery (multiple small frames)
export const PhotoGallery = ({ 
  position, 
  rotation = [0, 0, 0],
  style = "modern"
}: WallDecorProps) => {
  const colors = useMemo(() => {
    const styleColors: Record<string, { frames: string[]; photos: string[] }> = {
      modern: { frames: ["#1e293b", "#374151", "#0f172a"], photos: ["#7dd3fc", "#a5b4fc", "#fda4af"] },
      minimalist: { frames: ["#0f172a", "#1e293b", "#374151"], photos: ["#f1f5f9", "#e2e8f0", "#cbd5e1"] },
      luxury: { frames: ["#d4af37", "#b8860b", "#daa520"], photos: ["#8b5cf6", "#a855f7", "#c084fc"] },
      rustic: { frames: ["#8b4513", "#a0522d", "#cd853f"], photos: ["#90ee90", "#deb887", "#f4a460"] },
      scandinavian: { frames: ["#f1f5f9", "#e2e8f0", "#cbd5e1"], photos: ["#fef3c7", "#d1fae5", "#e0f2fe"] },
      industrial: { frames: ["#374151", "#4b5563", "#6b7280"], photos: ["#fb923c", "#38bdf8", "#a3e635"] },
      bohemian: { frames: ["#92400e", "#78350f", "#a16207"], photos: ["#c084fc", "#f472b6", "#fbbf24"] },
      contemporary: { frames: ["#1e293b", "#334155", "#475569"], photos: ["#f43f5e", "#3b82f6", "#22d3ee"] },
    };
    return styleColors[style] || styleColors.modern;
  }, [style]);

  const framePositions: [number, number, number][] = [
    [-0.25, 0.2, 0],
    [0.25, 0.15, 0],
    [-0.15, -0.15, 0],
    [0.2, -0.2, 0],
  ];

  const frameSizes: [number, number][] = [
    [0.25, 0.2],
    [0.2, 0.25],
    [0.22, 0.18],
    [0.18, 0.22],
  ];

  return (
    <group position={position} rotation={rotation}>
      {framePositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Frame */}
          <mesh castShadow>
            <boxGeometry args={[frameSizes[i][0] + 0.04, frameSizes[i][1] + 0.04, 0.02]} />
            <meshStandardMaterial 
              color={colors.frames[i % colors.frames.length]} 
              roughness={0.3} 
              metalness={0.2} 
            />
          </mesh>
          {/* Photo */}
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={frameSizes[i]} />
            <meshStandardMaterial color={colors.photos[i % colors.photos.length]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Wall-mounted TV (for living rooms)
export const WallTV = ({ 
  position, 
  rotation = [0, 0, 0],
  style = "modern"
}: WallDecorProps) => {
  return (
    <group position={position} rotation={rotation}>
      {/* TV Frame */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.7, 0.05]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[1.1, 0.62]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#1e3a5f" emissiveIntensity={0.1} />
      </mesh>
      
      {/* Stand indicator light */}
      <mesh position={[0, -0.32, 0.03]}>
        <circleGeometry args={[0.01, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

// Helper function to get wall decorations for a room
export const getWallDecorForRoom = (
  room: { name: string; width: number; depth: number; height: number; position: [number, number, number] },
  style: string
): JSX.Element[] => {
  const decorations: JSX.Element[] = [];
  const roomName = room.name.toLowerCase();
  const [x, , z] = room.position;
  const wallHeight = room.height * 0.6; // Place decorations at 60% of wall height

  if (roomName.includes("living")) {
    // Living room: TV on one wall, gallery on another, clock
    decorations.push(
      <WallTV 
        key="tv" 
        position={[x, wallHeight, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
      />,
      <PhotoGallery 
        key="gallery" 
        position={[x - room.width / 2 + 0.1, wallHeight, z]} 
        rotation={[0, Math.PI / 2, 0]}
        style={style}
      />,
      <WallClock 
        key="clock" 
        position={[x + room.width / 2 - 0.1, wallHeight + 0.3, z - room.depth / 4]} 
        rotation={[0, -Math.PI / 2, 0]}
        style={style}
      />
    );
  } else if (roomName.includes("bedroom") || roomName.includes("master")) {
    // Bedroom: landscape painting above bed, mirror, small frame
    decorations.push(
      <LandscapePainting 
        key="painting" 
        position={[x, wallHeight + 0.2, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
      />,
      <DecorativeMirror 
        key="mirror" 
        position={[x - room.width / 2 + 0.1, wallHeight, z + room.depth / 4]} 
        rotation={[0, Math.PI / 2, 0]}
        style={style}
        shape="oval"
      />,
      <PictureFrame 
        key="frame" 
        position={[x + room.width / 2 - 0.1, wallHeight, z]} 
        rotation={[0, -Math.PI / 2, 0]}
        style={style}
        size="small"
      />
    );
  } else if (roomName.includes("kitchen")) {
    // Kitchen: clock, shelf
    decorations.push(
      <WallClock 
        key="clock" 
        position={[x, wallHeight + 0.3, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
      />,
      <WallShelf 
        key="shelf" 
        position={[x + room.width / 4, wallHeight - 0.2, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
      />
    );
  } else if (roomName.includes("bathroom")) {
    // Bathroom: large mirror
    decorations.push(
      <DecorativeMirror 
        key="mirror" 
        position={[x, wallHeight, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
        shape="rectangular"
      />
    );
  } else if (roomName.includes("dining")) {
    // Dining: large painting, wall shelf
    decorations.push(
      <LandscapePainting 
        key="painting" 
        position={[x, wallHeight, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
      />,
      <WallShelf 
        key="shelf" 
        position={[x - room.width / 2 + 0.1, wallHeight - 0.3, z]} 
        rotation={[0, Math.PI / 2, 0]}
        style={style}
      />
    );
  } else if (roomName.includes("entrance") || roomName.includes("hallway")) {
    // Entrance: mirror, small frame
    decorations.push(
      <DecorativeMirror 
        key="mirror" 
        position={[x, wallHeight, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
        shape="circular"
      />,
      <PictureFrame 
        key="frame" 
        position={[x - room.width / 2 + 0.1, wallHeight, z]} 
        rotation={[0, Math.PI / 2, 0]}
        style={style}
        size="small"
      />
    );
  } else {
    // Default: one picture frame
    decorations.push(
      <PictureFrame 
        key="frame" 
        position={[x, wallHeight, z - room.depth / 2 + 0.1]} 
        rotation={[0, 0, 0]}
        style={style}
        size="medium"
      />
    );
  }

  return decorations;
};
