import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Box,
  LayoutGrid,
  FolderOpen,
  Settings,
  LogOut,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Home,
  Calculator,
  FileText,
  Users,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  Edit,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface FloorPlanProject {
  id: string;
  name: string;
  plot_width: number;
  plot_depth: number;
  rooms: unknown;
  image_url: string | null;
  style: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const Projects = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<FloorPlanProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile, role, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("floor_plan_projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("floor_plan_projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case "architect":
        return "Architect";
      case "designer":
        return "Designer";
      case "client":
        return "Client";
      default:
        return "User";
    }
  };

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FolderOpen, label: "Projects", href: "/projects", active: true },
    { icon: LayoutGrid, label: "Floor Plan Generator", href: "/floor-plan-generator" },
    { icon: Box, label: "3D Model Preview", href: "/3d-preview" },
    { icon: Calculator, label: "Cost Estimator", href: "/cost-estimator" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blueprint/30 border-t-blueprint rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blueprint-gradient flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-display font-bold text-lg text-sidebar-foreground">
                AI-in<span className="text-sidebar-primary">Arch</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blueprint-gradient flex items-center justify-center text-white font-medium text-sm">
                  {getInitials(displayName)}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                        {displayName}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60">{getRoleLabel(role)}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9 w-64 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <Button variant="accent" asChild>
              <Link to="/floor-plan-generator">
                <Plus className="w-4 h-4" />
                New Project
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Projects
            </h1>
            <p className="text-muted-foreground">
              Manage all your floor plan projects
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-blueprint/30 border-t-blueprint rounded-full animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FolderOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first floor plan to get started"}
              </p>
              {!searchQuery && (
                <Button variant="accent" asChild>
                  <Link to="/floor-plan-generator">
                    <Plus className="w-4 h-4" />
                    Create Floor Plan
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LayoutGrid className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          navigate(`/3d-preview?projectId=${project.id}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View 3D
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {project.plot_width}m × {project.plot_depth}m
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/3d-preview?projectId=${project.id}`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View 3D
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {project.style && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blueprint/10 text-blueprint mb-2">
                        {project.style}
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(project.updated_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
