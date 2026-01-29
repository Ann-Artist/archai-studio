import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wand2, 
  Upload, 
  Palette, 
  Loader2,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  Sofa,
  PaintBucket,
  Lamp,
  LampFloor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import InteriorDesignerSidebar from "@/components/layout/InteriorDesignerSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

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
}

interface DesignConfig {
  style: string;
  colorPalette: string[];
  furnitureEnabled: boolean;
  materialsEnabled: boolean;
  lightingStyle: string;
}

const DESIGN_STYLES = [
  { id: "modern", name: "Modern", description: "Clean lines, minimal clutter, neutral colors" },
  { id: "minimalist", name: "Minimalist", description: "Essential pieces only, maximum space" },
  { id: "luxury", name: "Luxury", description: "High-end materials, rich textures, elegant finishes" },
  { id: "rustic", name: "Rustic", description: "Natural materials, warm colors, cozy feel" },
  { id: "scandinavian", name: "Scandinavian", description: "Light colors, functional furniture, hygge vibes" },
  { id: "industrial", name: "Industrial", description: "Exposed materials, metal accents, urban feel" },
  { id: "bohemian", name: "Bohemian", description: "Eclectic patterns, vibrant colors, artistic flair" },
  { id: "contemporary", name: "Contemporary", description: "Current trends, bold statements, mixed materials" },
];

const LIGHTING_STYLES = [
  { id: "natural", name: "Natural Light", description: "Emphasis on windows and daylight" },
  { id: "warm", name: "Warm Ambient", description: "Cozy, warm-toned lighting" },
  { id: "cool", name: "Cool Modern", description: "Crisp, cool-toned lighting" },
  { id: "dramatic", name: "Dramatic", description: "High contrast, spotlights, accent lighting" },
];

const COLOR_PALETTES = {
  modern: ["#f5f5f5", "#333333", "#2563eb", "#f97316", "#10b981"],
  minimalist: ["#ffffff", "#f1f5f9", "#94a3b8", "#334155", "#0f172a"],
  luxury: ["#1a1a2e", "#16213e", "#d4af37", "#f5e6d3", "#8b5cf6"],
  rustic: ["#8b4513", "#deb887", "#f4a460", "#2e8b57", "#d2691e"],
  scandinavian: ["#ffffff", "#f8fafc", "#e2e8f0", "#64748b", "#1e293b"],
  industrial: ["#374151", "#6b7280", "#f97316", "#0d0d0d", "#a3a3a3"],
  bohemian: ["#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"],
  contemporary: ["#1e293b", "#f8fafc", "#3b82f6", "#f43f5e", "#22d3ee"],
};

const InteriorDesignerStyleGenerator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState<FloorPlanProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<FloorPlanProject | null>(null);
  
  // Reference image state
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [detectedStyle, setDetectedStyle] = useState<string>("");
  
  // Design configuration
  const [designConfig, setDesignConfig] = useState<DesignConfig>({
    style: "modern",
    colorPalette: COLOR_PALETTES.modern,
    furnitureEnabled: true,
    materialsEnabled: true,
    lightingStyle: "natural",
  });

  const [designGenerated, setDesignGenerated] = useState(false);

  useEffect(() => {
    if (role && role !== "interior_designer") {
      toast.error("Access denied. Interior Designer role required.");
      navigate("/dashboard");
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    loadProjects();
  }, [user]);

  useEffect(() => {
    const projectId = searchParams.get("project");
    if (projectId) {
      setSelectedProjectId(projectId);
      loadProject(projectId);
    }
  }, [searchParams]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("floor_plan_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedProjects: FloorPlanProject[] = (data || []).map((project) => ({
        id: project.id,
        name: project.name,
        plot_width: Number(project.plot_width),
        plot_depth: Number(project.plot_depth),
        rooms: Array.isArray(project.rooms) ? (project.rooms as unknown as RoomConfig[]) : [],
        image_url: project.image_url,
      }));

      setProjects(transformedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("floor_plan_projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      setSelectedProject({
        id: data.id,
        name: data.name,
        plot_width: Number(data.plot_width),
        plot_depth: Number(data.plot_depth),
        rooms: Array.isArray(data.rooms) ? (data.rooms as unknown as RoomConfig[]) : [],
        image_url: data.image_url,
      });
    } catch (error) {
      console.error("Failed to load project:", error);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    loadProject(projectId);
    setDesignGenerated(false);
  };

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setReferenceImage(dataUrl);
      
      // Simulate AI color extraction and style detection
      setTimeout(() => {
        // This would be replaced with actual AI processing
        const simulatedColors = ["#8b5a2b", "#deb887", "#f5f5dc", "#2e8b57", "#d4a574"];
        const simulatedStyle = "rustic";
        
        setExtractedColors(simulatedColors);
        setDetectedStyle(simulatedStyle);
        setDesignConfig(prev => ({
          ...prev,
          style: simulatedStyle,
          colorPalette: simulatedColors,
        }));
        
        toast.success("Reference image analyzed! Style and colors extracted.");
      }, 1500);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleStyleChange = (style: string) => {
    setDesignConfig(prev => ({
      ...prev,
      style,
      colorPalette: COLOR_PALETTES[style as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.modern,
    }));
  };

  const handleGenerateDesign = async () => {
    if (!selectedProject) {
      toast.error("Please select a floor plan first");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI design generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (user) {
        // Save the design to database
        const { error } = await supabase
          .from("interior_designs")
          .insert({
            project_id: selectedProject.id,
            designer_id: user.id,
            style: designConfig.style,
            color_palette: designConfig.colorPalette,
            furniture_config: { enabled: designConfig.furnitureEnabled },
            materials_config: { enabled: designConfig.materialsEnabled, lighting: designConfig.lightingStyle },
            reference_image_url: referenceImage,
          });

        if (error) throw error;
      }

      setDesignGenerated(true);
      toast.success("Interior design generated successfully!");
    } catch (error) {
      console.error("Failed to generate design:", error);
      toast.error("Failed to generate design");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewDesign = () => {
    navigate(`/interior-designer/design-preview?project=${selectedProjectId}`, {
      state: {
        designConfig,
        rooms: selectedProject?.rooms,
        plotWidth: selectedProject?.plot_width,
        plotDepth: selectedProject?.plot_depth,
      }
    });
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
              <Wand2 className="w-6 h-6 text-accent" />
              <div>
                <h1 className="text-xl font-display font-bold">AI Style Generator</h1>
                <p className="text-xs text-muted-foreground">Generate interior designs with AI assistance</p>
              </div>
            </div>
            {designGenerated && (
              <Button onClick={handlePreviewDesign}>
                <Sparkles className="w-4 h-4 mr-2" />
                Preview in 3D
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Project Selection & Reference Image */}
            <div className="space-y-6">
              {/* Project Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Floor Plan</CardTitle>
                  <CardDescription>Choose a floor plan to design</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a floor plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProject && (
                    <div className="mt-4 p-3 rounded-lg bg-muted">
                      <p className="font-medium text-sm">{selectedProject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedProject.rooms?.length || 0} rooms • {(selectedProject.plot_width * selectedProject.plot_depth).toFixed(0)}m²
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reference Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Reference Image (Optional)
                  </CardTitle>
                  <CardDescription>Upload an image to extract style and colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label 
                      htmlFor="reference-image" 
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-accent transition-colors"
                    >
                      {referenceImage ? (
                        <img 
                          src={referenceImage} 
                          alt="Reference" 
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload</span>
                        </>
                      )}
                    </Label>
                    <Input 
                      id="reference-image" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    {extractedColors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Extracted Colors
                        </p>
                        <div className="flex gap-2">
                          {extractedColors.map((color, i) => (
                            <div 
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        {detectedStyle && (
                          <p className="text-sm text-muted-foreground">
                            Detected style: <span className="font-medium capitalize">{detectedStyle}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Style Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Design Style
                  </CardTitle>
                  <CardDescription>Choose your interior design theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {DESIGN_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => handleStyleChange(style.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          designConfig.style === style.id
                            ? "border-accent bg-accent/10 ring-2 ring-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <p className="font-medium text-sm">{style.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{style.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* Color Palette Preview */}
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-2">Color Palette</p>
                    <div className="flex gap-2">
                      {designConfig.colorPalette.map((color, i) => (
                        <div 
                          key={i}
                          className="w-8 h-8 rounded-lg border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lighting Style */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LampFloor className="w-5 h-5" />
                    Lighting Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {LIGHTING_STYLES.map((light) => (
                      <button
                        key={light.id}
                        onClick={() => setDesignConfig(prev => ({ ...prev, lightingStyle: light.id }))}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          designConfig.lightingStyle === light.id
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <p className="font-medium text-sm">{light.name}</p>
                        <p className="text-xs text-muted-foreground">{light.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Toggles & Generate */}
            <div className="space-y-6">
              {/* Toggle Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Design Elements</CardTitle>
                  <CardDescription>Toggle design components on/off</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sofa className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Furniture</p>
                        <p className="text-xs text-muted-foreground">Add suggested furniture</p>
                      </div>
                    </div>
                    <Switch 
                      checked={designConfig.furnitureEnabled}
                      onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, furnitureEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PaintBucket className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Materials & Textures</p>
                        <p className="text-xs text-muted-foreground">Apply wall colors and flooring</p>
                      </div>
                    </div>
                    <Switch 
                      checked={designConfig.materialsEnabled}
                      onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, materialsEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lamp className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Lighting Effects</p>
                        <p className="text-xs text-muted-foreground">Enhanced lighting simulation</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <Button 
                    className="w-full h-12 text-lg" 
                    size="lg"
                    disabled={!selectedProject || isGenerating}
                    onClick={handleGenerateDesign}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Design
                      </>
                    )}
                  </Button>

                  {designGenerated && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Design Generated!</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={handlePreviewDesign}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Preview in 3D
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full mt-2"
                    onClick={() => {
                      setDesignGenerated(false);
                      setReferenceImage(null);
                      setExtractedColors([]);
                      setDetectedStyle("");
                      setDesignConfig({
                        style: "modern",
                        colorPalette: COLOR_PALETTES.modern,
                        furnitureEnabled: true,
                        materialsEnabled: true,
                        lightingStyle: "natural",
                      });
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
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

export default InteriorDesignerStyleGenerator;
