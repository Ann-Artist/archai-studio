import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  RotateCcw, 
  Maximize2, 
  Camera,
  Box,
  Eye,
  Grid3X3,
  Settings2,
  Loader2,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FloorPlan3D from "@/components/3d/FloorPlan3D";
import RoomConfigurator from "@/components/3d/RoomConfigurator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/layout/Sidebar";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface FloorPlanProject {
  id: string;
  name: string;
  plot_width: number;
  plot_depth: number;
  rooms: RoomConfig[];
  image_url: string | null;
  created_at: string;
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<RoomConfig[]>(defaultRooms);
  const [plotWidth, setPlotWidth] = useState(20);
  const [plotDepth, setPlotDepth] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<FloorPlanProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [currentProjectName, setCurrentProjectName] = useState<string>("");

  // Load project from URL param or navigation state
  useEffect(() => {
    const projectId = searchParams.get("project");
    const navigationState = location.state as { 
      rooms?: RoomConfig[]; 
      plotWidth?: number; 
      plotDepth?: number 
    } | null;

    if (navigationState?.rooms) {
      // Load from navigation state (direct from generator)
      setRooms(navigationState.rooms);
      if (navigationState.plotWidth) setPlotWidth(navigationState.plotWidth);
      if (navigationState.plotDepth) setPlotDepth(navigationState.plotDepth);
      setCurrentProjectName("Generated Floor Plan");
    } else if (projectId) {
      loadProject(projectId);
    }
  }, [searchParams, location.state]);

  // Load user's projects
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("floor_plan_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load projects:", error);
      return;
    }

    // Transform the data to ensure rooms is properly typed
    const transformedProjects: FloorPlanProject[] = (data || []).map((project) => ({
      id: project.id,
      name: project.name,
      plot_width: Number(project.plot_width),
      plot_depth: Number(project.plot_depth),
      rooms: Array.isArray(project.rooms) ? (project.rooms as unknown as RoomConfig[]) : [],
      image_url: project.image_url,
      created_at: project.created_at
    }));

    setProjects(transformedProjects);
  };

  const loadProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("floor_plan_projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Project not found");
        return;
      }

      // Transform rooms data
      const roomsData = Array.isArray(data.rooms) ? (data.rooms as unknown as RoomConfig[]) : [];
      
      setRooms(roomsData);
      setPlotWidth(Number(data.plot_width));
      setPlotDepth(Number(data.plot_depth));
      setSelectedProjectId(projectId);
      setCurrentProjectName(data.name);
      
      toast.success(`Loaded: ${data.name}`);
    } catch (error) {
      console.error("Failed to load project:", error);
      toast.error("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    if (projectId === "default") {
      setRooms(defaultRooms);
      setPlotWidth(20);
      setPlotDepth(16);
      setSelectedProjectId("");
      setCurrentProjectName("");
      toast.success("Loaded default layout");
    } else {
      loadProject(projectId);
    }
  };

  const handleReset = () => {
    setRooms(defaultRooms);
    setPlotWidth(20);
    setPlotDepth(16);
    setSelectedProjectId("");
    setCurrentProjectName("");
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-6 h-6 text-blueprint" />
              <div>
                <h1 className="text-xl font-display font-bold">3D Model Preview</h1>
                {currentProjectName && (
                  <p className="text-xs text-muted-foreground">{currentProjectName}</p>
                )}
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
                  <p className="text-2xl font-bold text-amber-600">{(plotWidth * plotDepth).toFixed(0)}m²</p>
                  <p className="text-sm text-muted-foreground">Plot Size</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="projects" className="gap-1 text-xs">
                  <FolderOpen className="w-3 h-3" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="rooms" className="gap-1 text-xs">
                  <Grid3X3 className="w-3 h-3" />
                  Rooms
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1 text-xs">
                  <Settings2 className="w-3 h-3" />
                  Plot
                </TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Saved Floor Plans</CardTitle>
                    <CardDescription>Load a previously generated floor plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user ? (
                      <>
                        <Select value={selectedProjectId || "default"} onValueChange={handleProjectSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a floor plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default Layout</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {projects.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No saved floor plans yet. Generate one from the Floor Plan Generator!
                          </p>
                        )}

                        {projects.length > 0 && (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {projects.map((project) => (
                              <div 
                                key={project.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedProjectId === project.id 
                                    ? "border-blueprint bg-blueprint/10" 
                                    : "border-border hover:bg-muted/50"
                                }`}
                                onClick={() => handleProjectSelect(project.id)}
                              >
                                <p className="font-medium text-sm">{project.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {project.rooms?.length || 0} rooms • {new Date(project.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button asChild className="w-full" variant="outline">
                          <Link to="/floor-plan-generator">
                            Generate New Floor Plan
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Log in to view and load your saved floor plans
                        </p>
                        <Button asChild variant="outline">
                          <Link to="/login">Log In</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
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
    </div>
  );
};

export default Model3DPreview;
