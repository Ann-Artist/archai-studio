import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Palette, 
  Wand2, 
  Eye, 
  FolderOpen, 
  ArrowRight,
  Loader2,
  Layers,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import InteriorDesignerSidebar from "@/components/layout/InteriorDesignerSidebar";

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

const InteriorDesignerDashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<FloorPlanProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentDesigns, setRecentDesigns] = useState<number>(0);

  useEffect(() => {
    if (role && role !== "interior_designer") {
      toast.error("Access denied. Interior Designer role required.");
      navigate("/dashboard");
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    if (user) {
      loadProjects();
      loadDesignCount();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("floor_plan_projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

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
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDesignCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from("interior_designs")
        .select("*", { count: "exact", head: true })
        .eq("designer_id", user.id);

      if (error) throw error;
      setRecentDesigns(count || 0);
    } catch (error) {
      console.error("Failed to load design count:", error);
    }
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
              <Palette className="w-6 h-6 text-accent" />
              <div>
                <h1 className="text-xl font-display font-bold">Interior Designer Dashboard</h1>
                <p className="text-xs text-muted-foreground">AI-powered interior design suggestions</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate("/interior-designer/style-generator")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/20 text-accent group-hover:scale-110 transition-transform">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">AI Style Generator</h3>
                  <p className="text-sm text-muted-foreground">Generate interior designs with AI</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blueprint/10 to-blueprint/5 border-blueprint/20 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate("/interior-designer/design-preview")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blueprint/20 text-blueprint group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Design Preview</h3>
                  <p className="text-sm text-muted-foreground">Preview designs on 3D models</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Designs Created</h3>
                  <p className="text-2xl font-bold text-emerald-600">{recentDesigns}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Floor Plans */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Available Floor Plans
                  </CardTitle>
                  <CardDescription>Select a floor plan to create interior designs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No floor plans available yet</p>
                  <p className="text-sm text-muted-foreground">Floor plans need to be created by architects first</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <Card 
                      key={project.id} 
                      className="cursor-pointer hover:border-accent transition-colors"
                      onClick={() => navigate(`/interior-designer/style-generator?project=${project.id}`)}
                    >
                      <CardContent className="p-4">
                        {project.image_url && (
                          <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                            <img 
                              src={project.image_url} 
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {project.rooms?.length || 0} rooms • {(project.plot_width * project.plot_depth).toFixed(0)}m²
                        </p>
                        <Button size="sm" className="w-full mt-3" variant="outline">
                          <Wand2 className="w-4 h-4 mr-2" />
                          Create Design
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default InteriorDesignerDashboard;
