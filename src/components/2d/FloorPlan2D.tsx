import { useState } from "react";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface FloorPlan2DProps {
  rooms?: RoomConfig[];
  plotWidth?: number;
  plotDepth?: number;
}

const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 6, depth: 5, height: 3, position: [-3, 1.5, 0], color: "#93c5fd" },
  { name: "Kitchen", width: 4, depth: 4, height: 3, position: [3, 1.5, -2], color: "#fcd34d" },
  { name: "Master Bedroom", width: 5, depth: 4, height: 3, position: [-2, 1.5, -5], color: "#a5b4fc" },
  { name: "Bedroom 2", width: 4, depth: 3.5, height: 3, position: [3.5, 1.5, 2.5], color: "#c4b5fd" },
  { name: "Bathroom", width: 3, depth: 2.5, height: 3, position: [4, 1.5, -6], color: "#67e8f9" },
  { name: "Entrance", width: 2, depth: 2, height: 3, position: [-6, 1.5, 3], color: "#86efac" },
];

const FloorPlan2D = ({ 
  rooms = defaultRooms, 
  plotWidth = 20, 
  plotDepth = 16 
}: FloorPlan2DProps) => {
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  
  // Scale factor to fit the plot into the viewport
  const padding = 40;
  const viewBoxWidth = plotWidth + 4;
  const viewBoxHeight = plotDepth + 4;
  
  // Convert 3D position to 2D (x stays same, z becomes y)
  const getRoom2DPosition = (room: RoomConfig) => {
    // Center the room based on its position in the 3D space
    const x = room.position[0] + plotWidth / 2;
    const y = -room.position[2] + plotDepth / 2; // Invert z for 2D
    return { x, y };
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden p-4">
      <svg
        viewBox={`-2 -2 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full"
        style={{ maxHeight: "100%" }}
      >
        {/* Grid */}
        <defs>
          <pattern
            id="grid"
            width="1"
            height="1"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 1 0 L 0 0 0 1"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.02"
              className="text-slate-300 dark:text-slate-600"
            />
          </pattern>
          <pattern
            id="grid-large"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 5 0 L 0 0 0 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.05"
              className="text-slate-400 dark:text-slate-500"
            />
          </pattern>
        </defs>
        
        {/* Plot background */}
        <rect
          x="0"
          y="0"
          width={plotWidth}
          height={plotDepth}
          fill="url(#grid)"
          stroke="currentColor"
          strokeWidth="0.1"
          className="text-slate-400 dark:text-slate-500"
        />
        <rect
          x="0"
          y="0"
          width={plotWidth}
          height={plotDepth}
          fill="url(#grid-large)"
        />
        
        {/* Plot outline */}
        <rect
          x="0"
          y="0"
          width={plotWidth}
          height={plotDepth}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.15"
          className="text-slate-600 dark:text-slate-400"
        />
        
        {/* Rooms */}
        {rooms.map((room, index) => {
          const pos = getRoom2DPosition(room);
          const isHovered = hoveredRoom === index;
          
          return (
            <g
              key={index}
              onMouseEnter={() => setHoveredRoom(index)}
              onMouseLeave={() => setHoveredRoom(null)}
              className="cursor-pointer transition-opacity"
            >
              {/* Room fill */}
              <rect
                x={pos.x - room.width / 2}
                y={pos.y - room.depth / 2}
                width={room.width}
                height={room.depth}
                fill={room.color}
                fillOpacity={isHovered ? 0.9 : 0.7}
                stroke={isHovered ? "#3b82f6" : "#1e3a5f"}
                strokeWidth={isHovered ? 0.12 : 0.08}
                rx="0.1"
                className="transition-all duration-200"
              />
              
              {/* Room name */}
              <text
                x={pos.x}
                y={pos.y - 0.2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="0.5"
                fontWeight="600"
                fill="#1e3a5f"
                className="pointer-events-none select-none"
              >
                {room.name}
              </text>
              
              {/* Room dimensions */}
              <text
                x={pos.x}
                y={pos.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="0.35"
                fill="#64748b"
                className="pointer-events-none select-none"
              >
                {room.width.toFixed(1)}m × {room.depth.toFixed(1)}m
              </text>
              
              {/* Room area */}
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="0.3"
                fill="#94a3b8"
                className="pointer-events-none select-none"
              >
                ({(room.width * room.depth).toFixed(1)}m²)
              </text>
            </g>
          );
        })}
        
        {/* Compass */}
        <g transform={`translate(${plotWidth - 1}, 1)`}>
          <circle r="0.6" fill="white" fillOpacity="0.9" stroke="#dc2626" strokeWidth="0.05" />
          <text
            x="0"
            y="0.15"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="0.5"
            fontWeight="bold"
            fill="#dc2626"
          >
            N
          </text>
          <path
            d="M 0 -0.4 L 0.15 0.1 L 0 0 L -0.15 0.1 Z"
            fill="#dc2626"
          />
        </g>
        
        {/* Scale indicator */}
        <g transform={`translate(1, ${plotDepth - 0.5})`}>
          <line x1="0" y1="0" x2="5" y2="0" stroke="#64748b" strokeWidth="0.08" />
          <line x1="0" y1="-0.15" x2="0" y2="0.15" stroke="#64748b" strokeWidth="0.08" />
          <line x1="5" y1="-0.15" x2="5" y2="0.15" stroke="#64748b" strokeWidth="0.08" />
          <text
            x="2.5"
            y="0.5"
            textAnchor="middle"
            fontSize="0.35"
            fill="#64748b"
          >
            5 meters
          </text>
        </g>
        
        {/* Plot dimensions */}
        <text
          x={plotWidth / 2}
          y={-0.8}
          textAnchor="middle"
          fontSize="0.4"
          fill="#64748b"
        >
          {plotWidth}m
        </text>
        <text
          x={-0.8}
          y={plotDepth / 2}
          textAnchor="middle"
          fontSize="0.4"
          fill="#64748b"
          transform={`rotate(-90, -0.8, ${plotDepth / 2})`}
        >
          {plotDepth}m
        </text>
      </svg>
    </div>
  );
};

export default FloorPlan2D;
