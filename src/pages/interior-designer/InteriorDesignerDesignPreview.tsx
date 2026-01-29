import { useState, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Eye, 
  RotateCcw, 
  Camera,
  Maximize2,
  Loader2,
  Sofa,
  PaintBucket,
  Palette,
  RefreshCw,
  Layers,
  Frame,
  Grid3X3,
  Box
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import InteriorDesignerSidebar from "@/components/layout/InteriorDesignerSidebar";
import DesignPreview3D from "@/components/3d/DesignPreview3D";
import InteriorDesign2D from "@/components/2d/InteriorDesign2D";
import ViewModeControls from "@/components/3d/ViewModeControls";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const DESIGN_STYLES = [
  { id: "modern", name: "Modern" },
  { id: "minimalist", name: "Minimalist" },
  { id: "luxury", name: "Luxury" },
  { id: "rustic", name: "Rustic" },
  { id: "scandinavian", name: "Scandinavian" },
  { id: "industrial", name: "Industrial" },
  { id: "bohemian", name: "Bohemian" },
  { id: "contemporary", name: "Contemporary" },
];

const defaultDesignConfig: DesignConfig = {
  style: "modern",
  colorPalette: ["#f5f5f5", "#333333", "#2563eb", "#f97316", "#10b981"],
  furnitureEnabled: true,
  materialsEnabled: true,
  lightingStyle: "natural",
};

const defaultRooms: RoomConfig[] = [
  { name: "Living Room", width: 6, depth: 5, height: 3, position: [-3, 1.5, 0], color: "#93c5fd" },
  { name: "Kitchen", width: 4, depth: 4, height: 3, position: [3, 1.5, -2], color: "#fcd34d" },
  { name: "Master Bedroom", width: 5, depth: 4, height: 3, position: [-2, 1.5, -5], color: "#a5b4fc" },
  { name: "Bedroom 2", width: 4, depth: 3.5, height: 3, position: [3.5, 1.5, 2.5], color: "#c4b5fd" },
  { name: "Bathroom", width: 3, depth: 2.5, height: 3, position: [4, 1.5, -6], color: "#67e8f9" },
  { name: "Entrance", width: 2, depth: 2, height: 3, position: [-6, 1.5, 3], color: "#86efac" },
];

const InteriorDesignerDesignPreview = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<RoomConfig[]>(defaultRooms);
  const [plotWidth, setPlotWidth] = useState(20);
  const [plotDepth, setPlotDepth] = useState(16);
  const [projectName, setProjectName] = useState("Design Preview");
  
  // Design configuration
  const [designConfig, setDesignConfig] = useState<DesignConfig>(defaultDesignConfig);
  
  // View controls
  const [renderMode, setRenderMode] = useState<"realistic" | "wireframe">("realistic");
  const [transparentWalls, setTransparentWalls] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [enableFirstPerson, setEnableFirstPerson] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Overlay toggles
  const [showFurniture, setShowFurniture] = useState(true);
  const [showMaterials, setShowMaterials] = useState(true);
  const [showWallDecor, setShowWallDecor] = useState(true);

  useEffect(() => {
    if (role && role !== "interior_designer") {
      toast.error("Access denied. Interior Designer role required.");
      navigate("/dashboard");
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    const navigationState = location.state as { 
      designConfig?: DesignConfig;
      rooms?: RoomConfig[]; 
      plotWidth?: number; 
      plotDepth?: number 
    } | null;

    if (navigationState?.designConfig) {
      setDesignConfig(navigationState.designConfig);
    }
    if (navigationState?.rooms) {
      setRooms(navigationState.rooms);
    }
    if (navigationState?.plotWidth) {
      setPlotWidth(navigationState.plotWidth);
    }
    if (navigationState?.plotDepth) {
      setPlotDepth(navigationState.plotDepth);
    }

    const projectId = searchParams.get("project");
    if (projectId) {
      loadProject(projectId);
    } else {
      setIsLoading(false);
    }
  }, [searchParams, location.state]);

  const loadProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("floor_plan_projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      setRooms(Array.isArray(data.rooms) ? (data.rooms as unknown as RoomConfig[]) : []);
      setPlotWidth(Number(data.plot_width));
      setPlotDepth(Number(data.plot_depth));
      setProjectName(data.name);
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = (style: string) => {
    const COLOR_PALETTES: Record<string, string[]> = {
      modern: ["#f5f5f5", "#333333", "#2563eb", "#f97316", "#10b981"],
      minimalist: ["#ffffff", "#f1f5f9", "#94a3b8", "#334155", "#0f172a"],
      luxury: ["#1a1a2e", "#16213e", "#d4af37", "#f5e6d3", "#8b5cf6"],
      rustic: ["#8b4513", "#deb887", "#f4a460", "#2e8b57", "#d2691e"],
      scandinavian: ["#ffffff", "#f8fafc", "#e2e8f0", "#64748b", "#1e293b"],
      industrial: ["#374151", "#6b7280", "#f97316", "#0d0d0d", "#a3a3a3"],
      bohemian: ["#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"],
      contemporary: ["#1e293b", "#f8fafc", "#3b82f6", "#f43f5e", "#22d3ee"],
    };
    
    setDesignConfig(prev => ({
      ...prev,
      style,
      colorPalette: COLOR_PALETTES[style] || COLOR_PALETTES.modern,
    }));
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `interior-design-${designConfig.style}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Screenshot saved!");
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("design-preview-container");
    if (!document.fullscreenElement && container) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleReset = () => {
    setDesignConfig(defaultDesignConfig);
    setShowFurniture(true);
    setShowMaterials(true);
    setShowWallDecor(true);
    setRenderMode("realistic");
    setTransparentWalls(false);
    setShowLabels(true);
    setEnableFirstPerson(false);
    toast.success("Preview reset to defaults");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <InteriorDesignerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-accent" />
              <div>
                <h1 className="text-xl font-display font-bold">Design Preview</h1>
                <p className="text-xs text-muted-foreground">{projectName} • {designConfig.style} style</p>
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
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Design Viewer with 2D/3D toggle */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <Tabs defaultValue="3d" className="w-full">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <TabsList className="h-8">
                          <TabsTrigger value="3d" className="text-xs gap-1.5 px-3">
                            <Box className="w-3.5 h-3.5" />
                            3D View
                          </TabsTrigger>
                          <TabsTrigger value="2d" className="text-xs gap-1.5 px-3">
                            <Grid3X3 className="w-3.5 h-3.5" />
                            2D Blueprint
                          </TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                          {designConfig.colorPalette.map((color, i) => (
                            <div 
                              key={i}
                              className="w-5 h-5 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {designConfig.style.charAt(0).toUpperCase() + designConfig.style.slice(1)} Style
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 relative">
                    <TabsContent value="3d" className="m-0">
                      <div 
                        id="design-preview-container" 
                        className="h-[500px] lg:h-[600px] w-full"
                      >
                        <DesignPreview3D 
                          rooms={rooms} 
                          plotWidth={plotWidth}
                          plotDepth={plotDepth}
                          designConfig={designConfig}
                          showFurniture={showFurniture}
                          showMaterials={showMaterials}
                          showWallDecor={showWallDecor}
                          viewMode={renderMode}
                          transparentWalls={transparentWalls}
                          showLabels={showLabels}
                          enableFirstPerson={enableFirstPerson}
                        />
                      </div>
                      
                      {/* View Mode Controls Overlay */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <ViewModeControls
                          viewMode={renderMode}
                          onViewModeChange={setRenderMode}
                          transparentWalls={transparentWalls}
                          onTransparentWallsChange={setTransparentWalls}
                          showLabels={showLabels}
                          onShowLabelsChange={setShowLabels}
                          enableFirstPerson={enableFirstPerson}
                          onEnableFirstPersonChange={setEnableFirstPerson}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="2d" className="m-0">
                      <div className="h-[500px] lg:h-[600px] w-full">
                        <InteriorDesign2D 
                          rooms={rooms}
                          plotWidth={plotWidth}
                          plotDepth={plotDepth}
                          designConfig={designConfig}
                          showFurniture={showFurniture}
                          showDecor={showWallDecor}
                        />
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>

            {/* Controls Panel */}
            <div className="space-y-4">
              {/* Style Switcher */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Change Style
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select value={designConfig.style} onValueChange={handleStyleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_STYLES.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Overlay Toggles */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Toggle Overlays</CardTitle>
                  <CardDescription className="text-xs">Show/hide design elements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="furniture-toggle" className="flex items-center gap-2 text-sm">
                      <Sofa className="w-4 h-4 text-muted-foreground" />
                      Furniture
                    </Label>
                    <Switch 
                      id="furniture-toggle"
                      checked={showFurniture}
                      onCheckedChange={setShowFurniture}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="materials-toggle" className="flex items-center gap-2 text-sm">
                      <PaintBucket className="w-4 h-4 text-muted-foreground" />
                      Materials
                    </Label>
                    <Switch 
                      id="materials-toggle"
                      checked={showMaterials}
                      onCheckedChange={setShowMaterials}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="decor-toggle" className="flex items-center gap-2 text-sm">
                      <Frame className="w-4 h-4 text-muted-foreground" />
                      Wall Decor
                    </Label>
                    <Switch 
                      id="decor-toggle"
                      checked={showWallDecor}
                      onCheckedChange={setShowWallDecor}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Color Palette */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Color Palette</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {designConfig.colorPalette.map((color, i) => (
                      <div 
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/interior-designer/style-generator")}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate New Design
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Preview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InteriorDesignerDesignPreview;
