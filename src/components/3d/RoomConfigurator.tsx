import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface RoomConfiguratorProps {
  rooms: RoomConfig[];
  onRoomsChange: (rooms: RoomConfig[]) => void;
}

const ROOM_COLORS = [
  { name: "Blue", value: "#93c5fd" },
  { name: "Yellow", value: "#fcd34d" },
  { name: "Purple", value: "#a5b4fc" },
  { name: "Violet", value: "#c4b5fd" },
  { name: "Cyan", value: "#67e8f9" },
  { name: "Green", value: "#86efac" },
  { name: "Orange", value: "#fdba74" },
  { name: "Pink", value: "#f9a8d4" },
];

const ROOM_PRESETS = [
  "Living Room",
  "Kitchen",
  "Master Bedroom",
  "Bedroom",
  "Bathroom",
  "Dining Room",
  "Office",
  "Garage",
  "Entrance",
  "Hallway",
];

const RoomConfigurator = ({ rooms, onRoomsChange }: RoomConfiguratorProps) => {
  const addRoom = () => {
    const newRoom: RoomConfig = {
      name: "New Room",
      width: 4,
      depth: 4,
      height: 3,
      position: [0, 1.5, 0],
      color: ROOM_COLORS[rooms.length % ROOM_COLORS.length].value,
    };
    onRoomsChange([...rooms, newRoom]);
  };

  const updateRoom = (index: number, field: keyof RoomConfig, value: any) => {
    const updatedRooms = [...rooms];
    if (field === "position") {
      updatedRooms[index] = { ...updatedRooms[index], position: value };
    } else {
      updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    }
    onRoomsChange(updatedRooms);
  };

  const removeRoom = (index: number) => {
    onRoomsChange(rooms.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Room Configuration</h3>
        <Button onClick={addRoom} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {rooms.map((room, index) => (
          <Card key={index} className="bg-card/50">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: room.color }}
                  />
                  <CardTitle className="text-sm font-medium">{room.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeRoom(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Room Type</Label>
                  <Select
                    value={room.name}
                    onValueChange={(value) => updateRoom(index, "name", value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <Select
                    value={room.color}
                    onValueChange={(value) => updateRoom(index, "color", value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: room.color }}
                        />
                        <span>{ROOM_COLORS.find((c) => c.value === room.color)?.name || "Custom"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Width (m)</Label>
                  <Input
                    type="number"
                    value={room.width}
                    onChange={(e) => updateRoom(index, "width", parseFloat(e.target.value) || 1)}
                    className="h-8 text-xs"
                    min={1}
                    step={0.5}
                  />
                </div>
                <div>
                  <Label className="text-xs">Depth (m)</Label>
                  <Input
                    type="number"
                    value={room.depth}
                    onChange={(e) => updateRoom(index, "depth", parseFloat(e.target.value) || 1)}
                    className="h-8 text-xs"
                    min={1}
                    step={0.5}
                  />
                </div>
                <div>
                  <Label className="text-xs">Height (m)</Label>
                  <Input
                    type="number"
                    value={room.height}
                    onChange={(e) => updateRoom(index, "height", parseFloat(e.target.value) || 1)}
                    className="h-8 text-xs"
                    min={1}
                    step={0.5}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">X Position</Label>
                  <Input
                    type="number"
                    value={room.position[0]}
                    onChange={(e) =>
                      updateRoom(index, "position", [
                        parseFloat(e.target.value) || 0,
                        room.position[1],
                        room.position[2],
                      ])
                    }
                    className="h-8 text-xs"
                    step={0.5}
                  />
                </div>
                <div>
                  <Label className="text-xs">Y Position</Label>
                  <Input
                    type="number"
                    value={room.position[1]}
                    onChange={(e) =>
                      updateRoom(index, "position", [
                        room.position[0],
                        parseFloat(e.target.value) || 0,
                        room.position[2],
                      ])
                    }
                    className="h-8 text-xs"
                    step={0.5}
                  />
                </div>
                <div>
                  <Label className="text-xs">Z Position</Label>
                  <Input
                    type="number"
                    value={room.position[2]}
                    onChange={(e) =>
                      updateRoom(index, "position", [
                        room.position[0],
                        room.position[1],
                        parseFloat(e.target.value) || 0,
                      ])
                    }
                    className="h-8 text-xs"
                    step={0.5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No rooms configured. Click "Add Room" to start.</p>
        </div>
      )}
    </div>
  );
};

export default RoomConfigurator;
