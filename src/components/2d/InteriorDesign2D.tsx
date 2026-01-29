import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

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

interface FurnitureItem {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  room: string;
}

interface InteriorDesign2DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
  designConfig?: DesignConfig;
  showFurniture?: boolean;
  showDecor?: boolean;
  onFurnitureChange?: (furniture: FurnitureItem[]) => void;
}

// Render furniture item based on type
const renderFurnitureItem = (item: FurnitureItem, isSelected: boolean, isDragging: boolean) => {
  const { type, x, y, width: w, height: h, rotation, color } = item;
  const strokeColor = isSelected ? "#3b82f6" : "#333";
  const strokeWidth = isSelected ? 0.06 : 0.03;
  const opacity = isDragging ? 0.7 : 1;
  
  const baseProps = {
    style: { cursor: "grab", opacity },
  };

  switch (type) {
    case "sofa":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.08" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.05} y={-h/2 + 0.05} width={w - 0.1} height={h * 0.6} rx="0.05" fill={`${color}dd`} />
          <circle cx={-w/4} cy={0} r="0.08" fill={`${color}aa`} />
          <circle cx={w/4} cy={0} r="0.08" fill={`${color}aa`} />
        </g>
      );
    case "coffeeTable":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.03" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.02} y={-h/2 + 0.02} width={w - 0.04} height={h - 0.04} rx="0.02" fill="none" stroke="#5c403380" strokeWidth="0.01" />
        </g>
      );
    case "bed":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.05" fill="#e8e0d8" stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.05} y={-h/2} width={w - 0.1} height={h * 0.15} fill="#4a3328" rx="0.02" />
          <rect x={-w/3} y={-h/2 + h * 0.18} width={w/4} height={h * 0.12} rx="0.02" fill="#f5f5f5" />
          <rect x={w/12} y={-h/2 + h * 0.18} width={w/4} height={h * 0.12} rx="0.02" fill="#f5f5f5" />
          <rect x={-w/2 + 0.08} y={h * 0.1} width={w - 0.16} height={h * 0.35} rx="0.03" fill={color} />
        </g>
      );
    case "smallBed":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.04" fill="#e8e0d8" stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.03} y={-h/2} width={w - 0.06} height={h * 0.12} fill="#4a3328" rx="0.02" />
          <rect x={-w/6} y={-h/2 + h * 0.15} width={w/3} height={h * 0.1} rx="0.02" fill="#f5f5f5" />
          <rect x={-w/2 + 0.05} y={h * 0.05} width={w - 0.1} height={h * 0.35} rx="0.02" fill={color} />
        </g>
      );
    case "nightstand":
      return (
        <g transform={`translate(${x}, ${y})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="0" cy="0" r={w * 0.15} fill="#8b7355" />
        </g>
      );
    case "wardrobe":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="0" y1={-h/2 + 0.03} x2="0" y2={h/2 - 0.03} stroke="#3a2718" strokeWidth="0.02" />
          <circle cx={-0.08} cy="0" r="0.03" fill="#a0a0a0" />
          <circle cx="0.08" cy="0" r="0.03" fill="#a0a0a0" />
        </g>
      );
    case "diningTable":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.03" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      );
    case "chair":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.02} y={-h/2} width={w - 0.04} height={h * 0.25} fill="#3a2718" rx="0.01" />
        </g>
      );
    case "kitchenCounter":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} fill="#f5f5f5" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx={-w/3} cy={0} r="0.1" fill="#333" stroke="#555" strokeWidth="0.02" />
          <circle cx={-w/3 + 0.25} cy={0} r="0.1" fill="#333" stroke="#555" strokeWidth="0.02" />
          <rect x={w/6} y={-h/4} width={w/4} height={h/2} rx="0.03" fill="#c0c0c0" stroke="#999" strokeWidth="0.02" />
        </g>
      );
    case "refrigerator":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill="#e8e8e8" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1={-w/2 + 0.02} y1={h/6} x2={w/2 - 0.02} y2={h/6} stroke="#ccc" strokeWidth="0.02" />
          <rect x={w/2 - 0.08} y={-h/4} width="0.03" height={h/4} rx="0.01" fill="#999" />
        </g>
      );
    case "toilet":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <ellipse cx="0" cy={h/6} rx={w/2.2} ry={h/3} fill="#f5f5f5" stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/3} y={-h/2} width={w/1.5} height={h/3} rx="0.02" fill="#f0f0f0" stroke="#ccc" strokeWidth="0.02" />
        </g>
      );
    case "bathtub":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.1" fill="#f5f5f5" stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.06} y={-h/2 + 0.06} width={w - 0.12} height={h - 0.12} rx="0.08" fill="#e0e8f0" stroke="#d0d8e0" strokeWidth="0.02" />
          <circle cx={0} cy={-h/2 + 0.15} r="0.04" fill="#c0c0c0" />
        </g>
      );
    case "sink":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill="#f0f0f0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse cx="0" cy="0" rx={w/3} ry={h/3} fill="#f5f5f5" stroke="#ddd" strokeWidth="0.015" />
          <circle cx="0" cy={-h/4} r="0.03" fill="#c0c0c0" />
        </g>
      );
    case "shoeRack":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1={-w/2 + 0.03} y1="0" x2={w/2 - 0.03} y2="0" stroke="#3a2718" strokeWidth="0.01" />
        </g>
      );
    case "coatRack":
      return (
        <g transform={`translate(${x}, ${y})`} {...baseProps}>
          <circle cx="0" cy="0" r={w/2} fill="#4a3328" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="0" cy="0" r={w * 0.15} fill="#5c4a3d" />
        </g>
      );
    case "rug":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.05" fill={color} fillOpacity="0.7" stroke={isSelected ? "#3b82f6" : color} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.1} y={-h/2 + 0.1} width={w - 0.2} height={h - 0.2} rx="0.03" fill="none" stroke={`${color}80`} strokeWidth="0.03" strokeDasharray="0.1 0.05" />
        </g>
      );
    case "plant":
      return (
        <g transform={`translate(${x}, ${y})`} {...baseProps}>
          <circle cx="0" cy="0" r={w/2} fill="#22c55e" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="0" cy="0" r={w * 0.2} fill="#8b4513" />
        </g>
      );
    case "tvUnit":
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`} {...baseProps}>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="0.02" fill="#4a3728" stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x={-w/2 + 0.1} y={-h/2 + 0.02} width={w - 0.2} height={h * 0.4} rx="0.01" fill="#1a1a1a" />
        </g>
      );
    default:
      return (
        <rect x={x - w/2} y={y - h/2} width={w} height={h} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} {...baseProps} />
      );
  }
};

// Wall decor icons (non-draggable)
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

// Generate initial furniture for all rooms
const generateInitialFurniture = (rooms: RoomConfig[], designConfig?: DesignConfig): FurnitureItem[] => {
  const furniture: FurnitureItem[] = [];
  const accentColor = designConfig?.colorPalette?.[2] || "#7c9eb2";
  const woodColor = designConfig?.style === "rustic" ? "#8b4513" : 
                    designConfig?.style === "modern" ? "#2a2a2a" : "#5c4033";
  
  rooms.forEach((room, roomIndex) => {
    const pos = { x: room.position[0], y: -room.position[2] };
    const roomName = room.name.toLowerCase();
    
    if (roomName.includes("living")) {
      furniture.push(
        { id: `${roomIndex}-rug`, type: "rug", x: pos.x, y: pos.y, width: room.width * 0.6, height: room.depth * 0.5, rotation: 0, color: accentColor, room: room.name },
        { id: `${roomIndex}-sofa`, type: "sofa", x: pos.x, y: pos.y + room.depth * 0.15, width: room.width * 0.5, height: room.depth * 0.22, rotation: 0, color: accentColor, room: room.name },
        { id: `${roomIndex}-coffeeTable`, type: "coffeeTable", x: pos.x, y: pos.y - room.depth * 0.08, width: room.width * 0.25, height: room.depth * 0.12, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-tvUnit`, type: "tvUnit", x: pos.x, y: pos.y - room.depth * 0.35, width: room.width * 0.4, height: room.depth * 0.1, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-plant`, type: "plant", x: pos.x + room.width * 0.35, y: pos.y + room.depth * 0.35, width: 0.24, height: 0.24, rotation: 0, color: "#22c55e", room: room.name }
      );
    } else if (roomName.includes("master bedroom")) {
      furniture.push(
        { id: `${roomIndex}-bed`, type: "bed", x: pos.x, y: pos.y, width: room.width * 0.5, height: room.depth * 0.55, rotation: 0, color: accentColor, room: room.name },
        { id: `${roomIndex}-nightstand1`, type: "nightstand", x: pos.x - room.width * 0.35, y: pos.y - room.depth * 0.15, width: 0.25, height: 0.25, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-nightstand2`, type: "nightstand", x: pos.x + room.width * 0.35, y: pos.y - room.depth * 0.15, width: 0.25, height: 0.25, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-wardrobe`, type: "wardrobe", x: pos.x + room.width * 0.35, y: pos.y + room.depth * 0.3, width: room.width * 0.25, height: room.depth * 0.15, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-rug`, type: "rug", x: pos.x, y: pos.y + room.depth * 0.15, width: room.width * 0.4, height: room.depth * 0.25, rotation: 0, color: accentColor, room: room.name }
      );
    } else if (roomName.includes("bedroom")) {
      furniture.push(
        { id: `${roomIndex}-smallBed`, type: "smallBed", x: pos.x, y: pos.y, width: room.width * 0.4, height: room.depth * 0.5, rotation: 0, color: accentColor, room: room.name },
        { id: `${roomIndex}-nightstand`, type: "nightstand", x: pos.x - room.width * 0.3, y: pos.y - room.depth * 0.1, width: 0.2, height: 0.2, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-wardrobe`, type: "wardrobe", x: pos.x + room.width * 0.3, y: pos.y + room.depth * 0.25, width: room.width * 0.22, height: room.depth * 0.12, rotation: 0, color: woodColor, room: room.name }
      );
    } else if (roomName.includes("kitchen")) {
      furniture.push(
        { id: `${roomIndex}-counter`, type: "kitchenCounter", x: pos.x, y: pos.y - room.depth * 0.3, width: room.width * 0.7, height: room.depth * 0.18, rotation: 0, color: "#f5f5f5", room: room.name },
        { id: `${roomIndex}-fridge`, type: "refrigerator", x: pos.x + room.width * 0.35, y: pos.y - room.depth * 0.25, width: room.width * 0.12, height: room.depth * 0.15, rotation: 0, color: "#e8e8e8", room: room.name },
        { id: `${roomIndex}-table`, type: "diningTable", x: pos.x, y: pos.y + room.depth * 0.2, width: room.width * 0.35, height: room.depth * 0.25, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-chair1`, type: "chair", x: pos.x - room.width * 0.12, y: pos.y + room.depth * 0.2, width: 0.22, height: 0.22, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-chair2`, type: "chair", x: pos.x + room.width * 0.12, y: pos.y + room.depth * 0.2, width: 0.22, height: 0.22, rotation: 180, color: woodColor, room: room.name },
        { id: `${roomIndex}-chair3`, type: "chair", x: pos.x, y: pos.y + room.depth * 0.32, width: 0.22, height: 0.22, rotation: 90, color: woodColor, room: room.name },
        { id: `${roomIndex}-chair4`, type: "chair", x: pos.x, y: pos.y + room.depth * 0.08, width: 0.22, height: 0.22, rotation: -90, color: woodColor, room: room.name }
      );
    } else if (roomName.includes("bathroom")) {
      furniture.push(
        { id: `${roomIndex}-toilet`, type: "toilet", x: pos.x - room.width * 0.25, y: pos.y - room.depth * 0.2, width: room.width * 0.15, height: room.depth * 0.2, rotation: 0, color: "#f5f5f5", room: room.name },
        { id: `${roomIndex}-bathtub`, type: "bathtub", x: pos.x + room.width * 0.2, y: pos.y, width: room.width * 0.25, height: room.depth * 0.5, rotation: 0, color: "#f5f5f5", room: room.name },
        { id: `${roomIndex}-sink`, type: "sink", x: pos.x - room.width * 0.25, y: pos.y + room.depth * 0.25, width: room.width * 0.2, height: room.depth * 0.15, rotation: 0, color: "#f0f0f0", room: room.name }
      );
    } else if (roomName.includes("entrance")) {
      furniture.push(
        { id: `${roomIndex}-shoeRack`, type: "shoeRack", x: pos.x, y: pos.y - room.depth * 0.2, width: room.width * 0.5, height: room.depth * 0.2, rotation: 0, color: woodColor, room: room.name },
        { id: `${roomIndex}-coatRack`, type: "coatRack", x: pos.x + room.width * 0.25, y: pos.y + room.depth * 0.2, width: 0.2, height: 0.2, rotation: 0, color: "#4a3328", room: room.name }
      );
    }
  });
  
  return furniture;
};

// Get wall decor for room type
const getDecorForRoom = (room: RoomConfig, designConfig?: DesignConfig) => {
  const pos = { x: room.position[0], y: -room.position[2] };
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
    decor.push(DecorIcons.clock(pos.x - room.width * 0.35, pos.y - room.depth * 0.35, 0.1));
  } else if (roomName.includes("bathroom")) {
    decor.push(DecorIcons.mirror(pos.x - room.width * 0.25, pos.y + room.depth * 0.4, 0.2, 0.15));
  } else if (roomName.includes("entrance")) {
    decor.push(DecorIcons.mirror(pos.x - room.width * 0.3, pos.y, 0.2, 0.3));
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
  showDecor = true,
  onFurnitureChange
}: InteriorDesign2DProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasNotified, setHasNotified] = useState(false);
  
  // Initialize furniture when rooms or design config change
  useEffect(() => {
    setFurniture(generateInitialFurniture(rooms, designConfig));
  }, [rooms, designConfig]);
  
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

  // Convert screen coordinates to SVG coordinates
  const screenToSVG = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const item = furniture.find(f => f.id === id);
    if (!item) return;
    
    const svgCoords = screenToSVG(e.clientX, e.clientY);
    setDragOffset({ x: svgCoords.x - item.x, y: svgCoords.y - item.y });
    setDraggingId(id);
    setSelectedId(id);
    
    if (!hasNotified) {
      toast.info("Drag furniture to reposition. Double-click to rotate.", { duration: 3000 });
      setHasNotified(true);
    }
  }, [furniture, screenToSVG, hasNotified]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId) return;
    
    const svgCoords = screenToSVG(e.clientX, e.clientY);
    const newX = svgCoords.x - dragOffset.x;
    const newY = svgCoords.y - dragOffset.y;
    
    setFurniture(prev => prev.map(item => 
      item.id === draggingId 
        ? { ...item, x: newX, y: newY }
        : item
    ));
  }, [draggingId, dragOffset, screenToSVG]);

  const handleMouseUp = useCallback(() => {
    if (draggingId) {
      setDraggingId(null);
      if (onFurnitureChange) {
        onFurnitureChange(furniture);
      }
    }
  }, [draggingId, furniture, onFurnitureChange]);

  const handleDoubleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFurniture(prev => prev.map(item => 
      item.id === id 
        ? { ...item, rotation: (item.rotation + 45) % 360 }
        : item
    ));
    toast.success("Rotated 45°");
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden p-4">
      {/* Instructions bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Drag</span> to move furniture • <span className="font-medium text-foreground">Double-click</span> to rotate
        </p>
      </div>
      
      <svg
        ref={svgRef}
        viewBox={`-2 -2 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full"
        style={{ maxHeight: "100%", cursor: draggingId ? "grabbing" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleBackgroundClick}
      >
        <defs>
          <pattern id="grid2d" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="currentColor" strokeWidth="0.02" className="text-slate-300 dark:text-slate-600" />
          </pattern>
          <pattern id="grid-large2d" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.05" className="text-slate-400 dark:text-slate-500" />
          </pattern>
          <filter id="shadow2d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.05" dy="0.05" stdDeviation="0.08" floodOpacity="0.2" />
          </filter>
          <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="0.15" floodColor="#3b82f6" floodOpacity="0.6" />
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
            >
              {/* Room fill */}
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
                {room.width.toFixed(1)}m × {room.depth.toFixed(1)}m
              </text>
            </g>
          );
        })}
        
        {/* Wall decor layer (non-draggable) */}
        {showDecor && (
          <g className="decor-layer pointer-events-none">
            {rooms.map((room, index) => (
              <g key={`decor-${index}`}>
                {getDecorForRoom(room, designConfig)}
              </g>
            ))}
          </g>
        )}
        
        {/* Furniture layer (draggable) */}
        {showFurniture && (
          <g className="furniture-layer">
            {furniture.map((item) => {
              const isSelected = selectedId === item.id;
              const isDragging = draggingId === item.id;
              
              return (
                <g
                  key={item.id}
                  filter={isSelected ? "url(#selectedGlow)" : "url(#shadow2d)"}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onDoubleClick={(e) => handleDoubleClick(e, item.id)}
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                >
                  {renderFurnitureItem(item, isSelected, isDragging)}
                </g>
              );
            })}
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
          <rect x="0" y="0.6" width="0.2" height="0.15" fill="#3b82f6" rx="0.02" />
          <text x="0.3" y="0.7" fontSize="0.22" fill="#64748b">Selected</text>
          <rect x="1.5" y="0.6" width="0.2" height="0.15" fill="#c0c0c0" rx="0.02" />
          <text x="1.8" y="0.7" fontSize="0.22" fill="#64748b">Fixtures</text>
        </g>
      </svg>
    </div>
  );
};

export default InteriorDesign2D;
