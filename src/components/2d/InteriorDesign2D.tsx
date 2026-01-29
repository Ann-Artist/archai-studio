import { useState } from "react";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface DesignConfig {
  style: string;
  colorPalette: string[];
  furnitureEnabled: boolean;
  materialsEnabled: boolean;
  lightingStyle: string;
}

interface InteriorDesign2DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
  designConfig?: DesignConfig;
  showFurniture?: boolean;
  showDecor?: boolean;
}

// Furniture icons as SVG paths (top-down view)
const FurnitureIcons = {
  sofa: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`sofa-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.08" fill={color} stroke="#333" strokeWidth="0.03" />
      <rect x={-w/2 + 0.05} y={-h/2 + 0.05} width={w - 0.1} height={h * 0.6} rx="0.05" fill={`${color}dd`} />
      <circle cx={-w/4} cy={0} r="0.08" fill={`${color}aa`} />
      <circle cx={w/4} cy={0} r="0.08" fill={`${color}aa`} />
    </g>
  ),
  coffeeTable: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`table-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.03" fill={color} stroke="#5c4033" strokeWidth="0.02" />
      <rect x={-w/2 + 0.02} y={-h/2 + 0.02} width={w - 0.04} height={h - 0.04} rx="0.02" fill="none" stroke="#5c403380" strokeWidth="0.01" />
    </g>
  ),
  bed: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`bed-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.05" fill="#e8e0d8" stroke="#5c4033" strokeWidth="0.03" />
      <rect x={-w/2 + 0.05} y={-h/2} width={w - 0.1} height={h * 0.15} fill="#4a3328" rx="0.02" />
      <rect x={-w/3} y={-h/2 + h * 0.18} width={w/4} height={h * 0.12} rx="0.02" fill="#f5f5f5" />
      <rect x={w/12} y={-h/2 + h * 0.18} width={w/4} height={h * 0.12} rx="0.02" fill="#f5f5f5" />
      <rect x={-w/2 + 0.08} y={h * 0.1} width={w - 0.16} height={h * 0.35} rx="0.03" fill={color} />
    </g>
  ),
  smallBed: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`sbed-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.04" fill="#e8e0d8" stroke="#5c4033" strokeWidth="0.02" />
      <rect x={-w/2 + 0.03} y={-h/2} width={w - 0.06} height={h * 0.12} fill="#4a3328" rx="0.02" />
      <rect x={-w/6} y={-h/2 + h * 0.15} width={w/3} height={h * 0.1} rx="0.02" fill="#f5f5f5" />
      <rect x={-w/2 + 0.05} y={h * 0.05} width={w - 0.1} height={h * 0.35} rx="0.02" fill={color} />
    </g>
  ),
  nightstand: (x: number, y: number, size: number, color: string) => (
    <g transform={`translate(${x}, ${y})`} key={`ns-${x}-${y}`}>
      <rect x={-size/2} y={-size/2} width={size} height={size} rx="0.02" fill={color} stroke="#4a3328" strokeWidth="0.02" />
      <circle cx="0" cy="0" r={size * 0.15} fill="#8b7355" />
    </g>
  ),
  wardrobe: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`ward-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill={color} stroke="#3a2718" strokeWidth="0.03" />
      <line x1="0" y1={-h/2 + 0.03} x2="0" y2={h/2 - 0.03} stroke="#3a2718" strokeWidth="0.02" />
      <circle cx={-0.08} cy="0" r="0.03" fill="#a0a0a0" />
      <circle cx="0.08" cy="0" r="0.03" fill="#a0a0a0" />
    </g>
  ),
  diningTable: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`dtable-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.03" fill={color} stroke="#4a3328" strokeWidth="0.02" />
    </g>
  ),
  chair: (x: number, y: number, size: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`chair-${x}-${y}`}>
      <rect x={-size/2} y={-size/2} width={size} height={size} rx="0.02" fill={color} stroke="#4a3328" strokeWidth="0.015" />
      <rect x={-size/2 + 0.02} y={-size/2} width={size - 0.04} height={size * 0.25} fill="#3a2718" rx="0.01" />
    </g>
  ),
  kitchenCounter: (x: number, y: number, w: number, h: number, rotation: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`counter-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} fill="#f5f5f5" stroke="#333" strokeWidth="0.02" />
      <rect x={-w/2} y={-h/2} width={w} height={h} fill="url(#counterPattern)" />
      {/* Stove burners */}
      <circle cx={-w/3} cy={0} r="0.1" fill="#333" stroke="#555" strokeWidth="0.02" />
      <circle cx={-w/3 + 0.25} cy={0} r="0.1" fill="#333" stroke="#555" strokeWidth="0.02" />
      {/* Sink */}
      <rect x={w/6} y={-h/4} width={w/4} height={h/2} rx="0.03" fill="#c0c0c0" stroke="#999" strokeWidth="0.02" />
    </g>
  ),
  refrigerator: (x: number, y: number, w: number, h: number, rotation: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`fridge-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill="#e8e8e8" stroke="#999" strokeWidth="0.02" />
      <line x1={-w/2 + 0.02} y1={h/6} x2={w/2 - 0.02} y2={h/6} stroke="#ccc" strokeWidth="0.02" />
      <rect x={w/2 - 0.08} y={-h/4} width="0.03" height={h/4} rx="0.01" fill="#999" />
    </g>
  ),
  toilet: (x: number, y: number, w: number, h: number, rotation: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`toilet-${x}-${y}`}>
      <ellipse cx="0" cy={h/6} rx={w/2.2} ry={h/3} fill="#f5f5f5" stroke="#ccc" strokeWidth="0.02" />
      <rect x={-w/3} y={-h/2} width={w/1.5} height={h/3} rx="0.02" fill="#f0f0f0" stroke="#ccc" strokeWidth="0.02" />
    </g>
  ),
  bathtub: (x: number, y: number, w: number, h: number, rotation: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`tub-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.1" fill="#f5f5f5" stroke="#ccc" strokeWidth="0.03" />
      <rect x={-w/2 + 0.06} y={-h/2 + 0.06} width={w - 0.12} height={h - 0.12} rx="0.08" fill="#e0e8f0" stroke="#d0d8e0" strokeWidth="0.02" />
      <circle cx={0} cy={-h/2 + 0.15} r="0.04" fill="#c0c0c0" />
    </g>
  ),
  sink: (x: number, y: number, w: number, h: number, rotation: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`sink-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill="#f0f0f0" stroke="#ccc" strokeWidth="0.02" />
      <ellipse cx="0" cy="0" rx={w/3} ry={h/3} fill="#f5f5f5" stroke="#ddd" strokeWidth="0.015" />
      <circle cx="0" cy={-h/4} r="0.03" fill="#c0c0c0" />
    </g>
  ),
  shoeRack: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`shoes-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill={color} stroke="#4a3328" strokeWidth="0.02" />
      <line x1={-w/2 + 0.03} y1="0" x2={w/2 - 0.03} y2="0" stroke="#3a2718" strokeWidth="0.01" />
    </g>
  ),
  coatRack: (x: number, y: number, size: number) => (
    <g transform={`translate(${x}, ${y})`} key={`coat-${x}-${y}`}>
      <circle cx="0" cy="0" r={size} fill="#4a3328" stroke="#3a2718" strokeWidth="0.02" />
      <circle cx="0" cy="0" r={size * 0.3} fill="#5c4a3d" />
    </g>
  ),
  rug: (x: number, y: number, w: number, h: number, rotation: number, color: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`rug-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.05" fill={color} fillOpacity="0.7" stroke={color} strokeWidth="0.02" />
      <rect x={-w/2 + 0.1} y={-h/2 + 0.1} width={w - 0.2} height={h - 0.2} rx="0.03" fill="none" stroke={`${color}80`} strokeWidth="0.03" strokeDasharray="0.1 0.05" />
    </g>
  ),
  plant: (x: number, y: number, size: number) => (
    <g transform={`translate(${x}, ${y})`} key={`plant-${x}-${y}`}>
      <circle cx="0" cy="0" r={size} fill="#22c55e" stroke="#166534" strokeWidth="0.02" />
      <circle cx="0" cy="0" r={size * 0.4} fill="#8b4513" />
    </g>
  ),
  tvUnit: (x: number, y: number, w: number, h: number, rotation: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} key={`tv-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill="#4a3728" stroke="#3a2718" strokeWidth="0.02" />
      <rect x={-w/2 + 0.1} y={-h/2 + 0.02} width={w - 0.2} height={h * 0.4} rx="0.01" fill="#1a1a1a" />
    </g>
  ),
};

// Wall decor icons
const DecorIcons = {
  painting: (x: number, y: number, w: number, h: number, color: string) => (
    <g transform={`translate(${x}, ${y})`} key={`paint-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} fill="#3a2718" rx="0.02" />
      <rect x={-w/2 + 0.02} y={-h/2 + 0.02} width={w - 0.04} height={h - 0.04} fill={color} rx="0.01" />
    </g>
  ),
  mirror: (x: number, y: number, w: number, h: number) => (
    <g transform={`translate(${x}, ${y})`} key={`mirror-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} fill="#c4b5fd" fillOpacity="0.6" stroke="#d4af37" strokeWidth="0.03" rx="0.02" />
    </g>
  ),
  clock: (x: number, y: number, r: number) => (
    <g transform={`translate(${x}, ${y})`} key={`clock-${x}-${y}`}>
      <circle cx="0" cy="0" r={r} fill="#f5f5f5" stroke="#333" strokeWidth="0.02" />
      <line x1="0" y1="0" x2="0" y2={-r * 0.6} stroke="#333" strokeWidth="0.02" />
      <line x1="0" y1="0" x2={r * 0.4} y2="0" stroke="#333" strokeWidth="0.015" />
    </g>
  ),
  shelf: (x: number, y: number, w: number) => (
    <g transform={`translate(${x}, ${y})`} key={`shelf-${x}-${y}`}>
      <rect x={-w/2} y="-0.03" width={w} height="0.06" fill="#5c4033" stroke="#4a3328" strokeWidth="0.01" />
      <rect x={-w/2 + 0.05} y="-0.08" width="0.08" height="0.05" fill="#22c55e" rx="0.01" />
      <rect x={w/2 - 0.13} y="-0.1" width="0.08" height="0.07" fill="#3b82f6" rx="0.01" />
    </g>
  ),
  wallTV: (x: number, y: number, w: number, h: number) => (
    <g transform={`translate(${x}, ${y})`} key={`wtv-${x}-${y}`}>
      <rect x={-w/2} y={-h/2} width={w} height={h} fill="#1a1a1a" stroke="#333" strokeWidth="0.02" rx="0.02" />
      <rect x={-w/2 + 0.02} y={-h/2 + 0.02} width={w - 0.04} height={h - 0.04} fill="#2a2a3a" rx="0.01" />
    </g>
  ),
};

// Get furniture for room type
const getFurnitureForRoom = (room: RoomConfig, designConfig?: DesignConfig) => {
  const pos = {
    x: room.position[0],
    y: -room.position[2]
  };
  const accentColor = designConfig?.colorPalette?.[2] || "#7c9eb2";
  const woodColor = designConfig?.style === "rustic" ? "#8b4513" : 
                    designConfig?.style === "modern" ? "#2a2a2a" : "#5c4033";
  
  const furniture: JSX.Element[] = [];
  const roomName = room.name.toLowerCase();
  
  if (roomName.includes("living")) {
    furniture.push(
      FurnitureIcons.rug(pos.x, pos.y, room.width * 0.6, room.depth * 0.5, 0, accentColor),
      FurnitureIcons.sofa(pos.x, pos.y + room.depth * 0.15, room.width * 0.5, room.depth * 0.22, 0, accentColor),
      FurnitureIcons.coffeeTable(pos.x, pos.y - room.depth * 0.08, room.width * 0.25, room.depth * 0.12, 0, woodColor),
      FurnitureIcons.tvUnit(pos.x, pos.y - room.depth * 0.35, room.width * 0.4, room.depth * 0.1, 0),
      FurnitureIcons.plant(pos.x + room.width * 0.35, pos.y + room.depth * 0.35, 0.12)
    );
  } else if (roomName.includes("master bedroom")) {
    furniture.push(
      FurnitureIcons.bed(pos.x, pos.y, room.width * 0.5, room.depth * 0.55, 0, accentColor),
      FurnitureIcons.nightstand(pos.x - room.width * 0.35, pos.y - room.depth * 0.15, 0.25, woodColor),
      FurnitureIcons.nightstand(pos.x + room.width * 0.35, pos.y - room.depth * 0.15, 0.25, woodColor),
      FurnitureIcons.wardrobe(pos.x + room.width * 0.35, pos.y + room.depth * 0.3, room.width * 0.25, room.depth * 0.15, 0, woodColor),
      FurnitureIcons.rug(pos.x, pos.y + room.depth * 0.15, room.width * 0.4, room.depth * 0.25, 0, accentColor)
    );
  } else if (roomName.includes("bedroom")) {
    furniture.push(
      FurnitureIcons.smallBed(pos.x, pos.y, room.width * 0.4, room.depth * 0.5, 0, accentColor),
      FurnitureIcons.nightstand(pos.x - room.width * 0.3, pos.y - room.depth * 0.1, 0.2, woodColor),
      FurnitureIcons.wardrobe(pos.x + room.width * 0.3, pos.y + room.depth * 0.25, room.width * 0.22, room.depth * 0.12, 0, woodColor)
    );
  } else if (roomName.includes("kitchen")) {
    furniture.push(
      FurnitureIcons.kitchenCounter(pos.x, pos.y - room.depth * 0.3, room.width * 0.7, room.depth * 0.18, 0),
      FurnitureIcons.refrigerator(pos.x + room.width * 0.35, pos.y - room.depth * 0.25, room.width * 0.12, room.depth * 0.15, 0),
      FurnitureIcons.diningTable(pos.x, pos.y + room.depth * 0.2, room.width * 0.35, room.depth * 0.25, 0, woodColor),
      FurnitureIcons.chair(pos.x - room.width * 0.12, pos.y + room.depth * 0.2, 0.22, 0, woodColor),
      FurnitureIcons.chair(pos.x + room.width * 0.12, pos.y + room.depth * 0.2, 0.22, 180, woodColor),
      FurnitureIcons.chair(pos.x, pos.y + room.depth * 0.32, 0.22, 90, woodColor),
      FurnitureIcons.chair(pos.x, pos.y + room.depth * 0.08, 0.22, -90, woodColor)
    );
  } else if (roomName.includes("bathroom")) {
    furniture.push(
      FurnitureIcons.toilet(pos.x - room.width * 0.25, pos.y - room.depth * 0.2, room.width * 0.15, room.depth * 0.2, 0),
      FurnitureIcons.bathtub(pos.x + room.width * 0.2, pos.y, room.width * 0.25, room.depth * 0.5, 0),
      FurnitureIcons.sink(pos.x - room.width * 0.25, pos.y + room.depth * 0.25, room.width * 0.2, room.depth * 0.15, 0)
    );
  } else if (roomName.includes("entrance")) {
    furniture.push(
      FurnitureIcons.shoeRack(pos.x, pos.y - room.depth * 0.2, room.width * 0.5, room.depth * 0.2, 0, woodColor),
      FurnitureIcons.coatRack(pos.x + room.width * 0.25, pos.y + room.depth * 0.2, 0.1)
    );
  }
  
  return furniture;
};

// Get wall decor for room type
const getDecorForRoom = (room: RoomConfig, designConfig?: DesignConfig) => {
  const pos = {
    x: room.position[0],
    y: -room.position[2]
  };
  const accentColor = designConfig?.colorPalette?.[2] || "#7c9eb2";
  
  const decor: JSX.Element[] = [];
  const roomName = room.name.toLowerCase();
  
  if (roomName.includes("living")) {
    decor.push(
      DecorIcons.wallTV(pos.x, pos.y - room.depth * 0.45, room.width * 0.35, room.depth * 0.12),
      DecorIcons.painting(pos.x - room.width * 0.35, pos.y, 0.25, 0.18, accentColor),
      DecorIcons.shelf(pos.x + room.width * 0.35, pos.y, 0.35)
    );
  } else if (roomName.includes("master bedroom")) {
    decor.push(
      DecorIcons.painting(pos.x, pos.y - room.depth * 0.42, 0.4, 0.25, accentColor),
      DecorIcons.mirror(pos.x + room.width * 0.4, pos.y, 0.15, 0.35)
    );
  } else if (roomName.includes("bedroom")) {
    decor.push(
      DecorIcons.painting(pos.x, pos.y - room.depth * 0.4, 0.25, 0.18, accentColor),
      DecorIcons.clock(pos.x + room.width * 0.35, pos.y - room.depth * 0.25, 0.08)
    );
  } else if (roomName.includes("kitchen")) {
    decor.push(
      DecorIcons.clock(pos.x - room.width * 0.35, pos.y - room.depth * 0.35, 0.1)
    );
  } else if (roomName.includes("bathroom")) {
    decor.push(
      DecorIcons.mirror(pos.x - room.width * 0.25, pos.y + room.depth * 0.4, 0.2, 0.15)
    );
  } else if (roomName.includes("entrance")) {
    decor.push(
      DecorIcons.mirror(pos.x - room.width * 0.3, pos.y, 0.2, 0.3)
    );
  }
  
  return decor;
};

const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 6, depth: 5, height: 3, position: [-3, 1.5, 0], color: "#93c5fd" },
  { name: "Kitchen", width: 4, depth: 4, height: 3, position: [3, 1.5, -2], color: "#fcd34d" },
  { name: "Master Bedroom", width: 5, depth: 4, height: 3, position: [-2, 1.5, -5], color: "#a5b4fc" },
  { name: "Bedroom 2", width: 4, depth: 3.5, height: 3, position: [3.5, 1.5, 2.5], color: "#c4b5fd" },
  { name: "Bathroom", width: 3, depth: 2.5, height: 3, position: [4, 1.5, -6], color: "#67e8f9" },
  { name: "Entrance", width: 2, depth: 2, height: 3, position: [-6, 1.5, 3], color: "#86efac" },
];

const InteriorDesign2D = ({ 
  rooms = defaultRooms, 
  plotWidth = 20, 
  plotDepth = 16,
  designConfig,
  showFurniture = true,
  showDecor = true
}: InteriorDesign2DProps) => {
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  
  const viewBoxWidth = plotWidth + 4;
  const viewBoxHeight = plotDepth + 4;
  
  const getRoom2DPosition = (room: RoomConfig) => {
    const x = room.position[0] + plotWidth / 2;
    const y = -room.position[2] + plotDepth / 2;
    return { x, y };
  };

  const styleColors = designConfig?.colorPalette || ["#f5f5f5", "#333333", "#2563eb", "#f97316", "#10b981"];
  const primaryBg = styleColors[0];
  const accentColor = styleColors[2];

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden p-4">
      <svg
        viewBox={`-2 -2 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full"
        style={{ maxHeight: "100%" }}
      >
        <defs>
          <pattern id="grid2d" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="currentColor" strokeWidth="0.02" className="text-slate-300 dark:text-slate-600" />
          </pattern>
          <pattern id="grid-large2d" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.05" className="text-slate-400 dark:text-slate-500" />
          </pattern>
          <pattern id="counterPattern" width="0.1" height="0.1" patternUnits="userSpaceOnUse">
            <rect width="0.1" height="0.1" fill="none" />
            <circle cx="0.05" cy="0.05" r="0.01" fill="#ddd" />
          </pattern>
          <filter id="shadow2d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.05" dy="0.05" stdDeviation="0.08" floodOpacity="0.2" />
          </filter>
        </defs>
        
        {/* Plot background */}
        <rect x="0" y="0" width={plotWidth} height={plotDepth} fill={primaryBg} stroke="currentColor" strokeWidth="0.1" className="text-slate-400 dark:text-slate-500" />
        <rect x="0" y="0" width={plotWidth} height={plotDepth} fill="url(#grid2d)" />
        <rect x="0" y="0" width={plotWidth} height={plotDepth} fill="url(#grid-large2d)" />
        
        {/* Plot outline */}
        <rect x="0" y="0" width={plotWidth} height={plotDepth} fill="none" stroke="currentColor" strokeWidth="0.15" className="text-slate-600 dark:text-slate-400" />
        
        {/* Rooms */}
        {rooms.map((room, index) => {
          const pos = getRoom2DPosition(room);
          const isHovered = hoveredRoom === index;
          
          return (
            <g
              key={index}
              onMouseEnter={() => setHoveredRoom(index)}
              onMouseLeave={() => setHoveredRoom(null)}
              className="cursor-pointer"
            >
              {/* Room fill with style color */}
              <rect
                x={pos.x - room.width / 2}
                y={pos.y - room.depth / 2}
                width={room.width}
                height={room.depth}
                fill={room.color}
                fillOpacity={isHovered ? 0.85 : 0.6}
                stroke={isHovered ? accentColor : "#1e3a5f"}
                strokeWidth={isHovered ? 0.12 : 0.08}
                rx="0.1"
                filter="url(#shadow2d)"
                className="transition-all duration-200"
              />
              
              {/* Room name */}
              <text
                x={pos.x}
                y={pos.y - room.depth / 2 + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="0.4"
                fontWeight="600"
                fill="#1e3a5f"
                className="pointer-events-none select-none"
              >
                {room.name}
              </text>
              
              {/* Room dimensions */}
              <text
                x={pos.x}
                y={pos.y + room.depth / 2 - 0.3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="0.28"
                fill="#64748b"
                className="pointer-events-none select-none"
              >
                {room.width.toFixed(1)}m × {room.depth.toFixed(1)}m ({(room.width * room.depth).toFixed(1)}m²)
              </text>
            </g>
          );
        })}
        
        {/* Furniture layer */}
        {showFurniture && (
          <g className="furniture-layer">
            {rooms.map((room, index) => (
              <g key={`furniture-${index}`} filter="url(#shadow2d)">
                {getFurnitureForRoom(room, designConfig)}
              </g>
            ))}
          </g>
        )}
        
        {/* Wall decor layer */}
        {showDecor && (
          <g className="decor-layer">
            {rooms.map((room, index) => (
              <g key={`decor-${index}`}>
                {getDecorForRoom(room, designConfig)}
              </g>
            ))}
          </g>
        )}
        
        {/* Compass */}
        <g transform={`translate(${plotWidth - 1}, 1)`}>
          <circle r="0.6" fill="white" fillOpacity="0.95" stroke={accentColor} strokeWidth="0.05" />
          <text x="0" y="0.15" textAnchor="middle" dominantBaseline="middle" fontSize="0.5" fontWeight="bold" fill={accentColor}>N</text>
          <path d="M 0 -0.4 L 0.15 0.1 L 0 0 L -0.15 0.1 Z" fill={accentColor} />
        </g>
        
        {/* Scale indicator */}
        <g transform={`translate(1, ${plotDepth - 0.5})`}>
          <line x1="0" y1="0" x2="5" y2="0" stroke="#64748b" strokeWidth="0.08" />
          <line x1="0" y1="-0.15" x2="0" y2="0.15" stroke="#64748b" strokeWidth="0.08" />
          <line x1="5" y1="-0.15" x2="5" y2="0.15" stroke="#64748b" strokeWidth="0.08" />
          <text x="2.5" y="0.5" textAnchor="middle" fontSize="0.35" fill="#64748b">5 meters</text>
        </g>
        
        {/* Plot dimensions */}
        <text x={plotWidth / 2} y={-0.8} textAnchor="middle" fontSize="0.4" fill="#64748b">{plotWidth}m</text>
        <text x={-0.8} y={plotDepth / 2} textAnchor="middle" fontSize="0.4" fill="#64748b" transform={`rotate(-90, -0.8, ${plotDepth / 2})`}>{plotDepth}m</text>
        
        {/* Legend */}
        <g transform={`translate(${plotWidth - 3.5}, ${plotDepth - 1.8})`}>
          <rect x="-0.2" y="-0.3" width="3.5" height="1.6" fill="white" fillOpacity="0.9" rx="0.1" stroke="#e2e8f0" strokeWidth="0.02" />
          <text x="0" y="0" fontSize="0.28" fontWeight="600" fill="#334155">Legend</text>
          <rect x="0" y="0.25" width="0.2" height="0.15" fill={accentColor} rx="0.02" />
          <text x="0.3" y="0.35" fontSize="0.22" fill="#64748b">Furniture</text>
          <rect x="1.5" y="0.25" width="0.2" height="0.15" fill="#3a2718" rx="0.02" />
          <text x="1.8" y="0.35" fontSize="0.22" fill="#64748b">Wall Decor</text>
          <rect x="0" y="0.6" width="0.2" height="0.15" fill="#22c55e" rx="0.02" />
          <text x="0.3" y="0.7" fontSize="0.22" fill="#64748b">Plants</text>
          <rect x="1.5" y="0.6" width="0.2" height="0.15" fill="#c0c0c0" rx="0.02" />
          <text x="1.8" y="0.7" fontSize="0.22" fill="#64748b">Fixtures</text>
        </g>
      </svg>
    </div>
  );
};

export default InteriorDesign2D;
