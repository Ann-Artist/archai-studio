import { useRef, useEffect } from "react";

interface RoomCoordinates {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface FloorPlanCanvasProps {
  rooms: RoomCoordinates[];
  plotWidth: number;
  plotDepth: number;
  className?: string;
}

const FloorPlanCanvas = ({ rooms, plotWidth, plotDepth, className = "" }: FloorPlanCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with high DPI support
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);

    // Calculate scale to fit plot in canvas
    const padding = 40;
    const availableWidth = displayWidth - padding * 2;
    const availableHeight = displayHeight - padding * 2;
    const scale = Math.min(availableWidth / plotWidth, availableHeight / plotDepth);

    // Center offset
    const offsetX = (displayWidth - plotWidth * scale) / 2;
    const offsetY = (displayHeight - plotDepth * scale) / 2;

    // Clear canvas
    ctx.fillStyle = "#1a1f2e";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw grid
    ctx.strokeStyle = "#2a3142";
    ctx.lineWidth = 0.5;
    const gridSize = 1; // 1 meter grid
    
    for (let x = 0; x <= plotWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * scale, offsetY);
      ctx.lineTo(offsetX + x * scale, offsetY + plotDepth * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= plotDepth; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * scale);
      ctx.lineTo(offsetX + plotWidth * scale, offsetY + y * scale);
      ctx.stroke();
    }

    // Draw plot boundary
    ctx.strokeStyle = "#4a90d9";
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, plotWidth * scale, plotDepth * scale);

    // Draw rooms
    rooms.forEach((room) => {
      const roomX = offsetX + (plotWidth / 2 + room.position[0] - room.width / 2) * scale;
      const roomY = offsetY + (plotDepth / 2 + room.position[2] - room.depth / 2) * scale;
      const roomWidth = room.width * scale;
      const roomHeight = room.depth * scale;

      // Fill room
      ctx.fillStyle = room.color + "40"; // Add transparency
      ctx.fillRect(roomX, roomY, roomWidth, roomHeight);

      // Draw room border
      ctx.strokeStyle = room.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(roomX, roomY, roomWidth, roomHeight);

      // Draw room label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const labelX = roomX + roomWidth / 2;
      const labelY = roomY + roomHeight / 2;
      
      // Room name
      ctx.fillText(room.name, labelX, labelY - 8);
      
      // Room dimensions
      ctx.font = "10px Inter, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`${room.width.toFixed(1)}m × ${room.depth.toFixed(1)}m`, labelX, labelY + 8);
      
      // Area
      const area = room.width * room.depth;
      ctx.fillText(`${area.toFixed(1)} m²`, labelX, labelY + 20);
    });

    // Draw scale indicator
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Scale: 1m", padding, displayHeight - 15);
    
    // Scale bar
    const scaleBarLength = 1 * scale;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding + 50, displayHeight - 18);
    ctx.lineTo(padding + 50 + scaleBarLength, displayHeight - 18);
    ctx.stroke();

    // Title
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillStyle = "#4a90d9";
    ctx.textAlign = "center";
    ctx.fillText(`Floor Plan (${plotWidth.toFixed(1)}m × ${plotDepth.toFixed(1)}m)`, displayWidth / 2, 20);

    // Compass
    const compassX = displayWidth - 45;
    const compassY = 45;
    ctx.beginPath();
    ctx.arc(compassX, compassY, 20, 0, Math.PI * 2);
    ctx.strokeStyle = "#4a90d9";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = "#4a90d9";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", compassX, compassY - 6);
    
    // North arrow
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 15);
    ctx.lineTo(compassX - 5, compassY);
    ctx.lineTo(compassX + 5, compassY);
    ctx.closePath();
    ctx.fill();

  }, [rooms, plotWidth, plotDepth]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full bg-muted rounded-lg ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
};

export default FloorPlanCanvas;
