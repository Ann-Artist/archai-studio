import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  RotateCcw, 
  Maximize2, 
  Camera,
  Box,
  Eye,
  Grid3X3,
  Settings2
} from "lucide-react";
import { toast } from "sonner";
import FloorPlan3D from "@/components/3d/FloorPlan3D";
import RoomConfigurator from "@/components/3d/RoomConfigurator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 6, depth: 5, height: 3, position: [-3, 1.5, 0], color: "#93c5fd" },
  { name: "Kitchen", width: 4, depth: 4, height: 3, position: [3, 1.5, -2], color: "#fcd34d" },
  { name: "Master Bedroom", width: 5, depth: 4, height: 3, position: [-2, 1.5, -5], color: "#a5b4fc" },
  { name: "Bedroom 2", width: 4, depth: 3.5, height: 3, position: [3.5, 1.5, 2.5], color: "#c4b5fd" },
  { name: "Bathroom", width: 3, depth: 2.5, height: 3, position: [4, 1.5, -6], color: "#67e8f9" },
  { name: "Entrance", width: 2, depth: 2, height: 3, position: [-6, 1.5, 3], color: "#86efac" },
];

const Model3DPreview = () => {
  const [rooms, setRooms] = useState<RoomConfig[]>(defaultRooms);
  const [plotWidth, setPlotWidth] = useState(20);
  const [plotDepth, setPlotDepth] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReset = () => {
    setRooms(defaultRooms);
    setPlotWidth(20);
    setPlotDepth(16);
    toast.success("Scene reset to defaults");
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = "3d-floor-plan.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Screenshot saved!");
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("3d-container");
    if (!document.fullscreenElement && container) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const totalArea = rooms.reduce((acc, room) => acc + room.width * room.depth, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Box className="w-6 h-6 text-blueprint" />
                <h1 className="text-xl font-display font-bold">3D Model Preview</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleScreenshot}>
                <Camera className="w-4 h-4 mr-2" />
                Screenshot
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blueprint" />
                    <CardTitle className="text-sm font-medium">3D Viewport</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Drag to rotate • Scroll to zoom • Shift+drag to pan
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  id="3d-container" 
                  className="h-[500px] lg:h-[600px] w-full"
                >
                  <FloorPlan3D 
                    rooms={rooms} 
                    plotWidth={plotWidth} 
                    plotDepth={plotDepth} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Card className="bg-blueprint/10 border-blueprint/20">
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-blueprint">{rooms.length}</p>
                  <p className="text-sm text-muted-foreground">Rooms</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/10 border-emerald-500/20">
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{totalArea.toFixed(0)}m²</p>
                  <p className="text-sm text-muted-foreground">Total Area</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{plotWidth * plotDepth}m²</p>
                  <p className="text-sm text-muted-foreground">Plot Size</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="rooms" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rooms" className="gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Rooms
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings2 className="w-4 h-4" />
                  Plot
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="rooms" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <RoomConfigurator rooms={rooms} onRoomsChange={setRooms} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plot Settings</CardTitle>
                    <CardDescription>Configure the overall plot dimensions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Plot Width (meters)</Label>
                      <Input
                        type="number"
                        value={plotWidth}
                        onChange={(e) => setPlotWidth(parseFloat(e.target.value) || 10)}
                        min={10}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label>Plot Depth (meters)</Label>
                      <Input
                        type="number"
                        value={plotDepth}
                        onChange={(e) => setPlotDepth(parseFloat(e.target.value) || 10)}
                        min={10}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-medium mb-2">Controls Guide</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Left-click + drag:</strong> Rotate view</li>
                        <li>• <strong>Right-click + drag:</strong> Pan view</li>
                        <li>• <strong>Scroll wheel:</strong> Zoom in/out</li>
                        <li>• <strong>Hover rooms:</strong> Highlight</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Model3DPreview;
