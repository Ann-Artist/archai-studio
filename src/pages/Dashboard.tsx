import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  LayoutGrid, 
  FolderOpen, 
  Search, 
  Plus, 
  Bell, 
  Calculator,
  FileText,
  TrendingUp,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "@/components/layout/Sidebar";

interface FloorPlanProject {
  id: string;
  name: string;
  plot_width: number;
  plot_depth: number;
  style: string | null;
  updated_at: string;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<FloorPlanProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Fetch projects from database
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("floor_plan_projects")
        .select("id, name, plot_width, plot_depth, style, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const stats = [
    { label: "Total Projects", value: String(projects.length), icon: FolderOpen, change: "Your floor plans", color: "blueprint" },
    { label: "Floor Plans", value: String(projects.length), icon: LayoutGrid, change: "Generated", color: "accent" },
    { label: "Cost Estimates", value: "—", icon: Calculator, change: "Coming soon", color: "success" },
    { label: "Reports Generated", value: "—", icon: FileText, change: "Coming soon", color: "blueprint" },
  ];

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
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9 w-64 bg-background"
              />
            </div>
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

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Welcome back, {displayName.split(" ")[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your projects today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground/70 mt-1">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Recent Projects */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Recent Projects
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/projects">View all</Link>
              </Button>
            </div>

            {projectsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-blueprint/30 border-t-blueprint rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button variant="accent" asChild>
                  <Link to="/floor-plan-generator">
                    <Plus className="w-4 h-4" />
                    Create Your First Floor Plan
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/3d-preview?projectId=${project.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-blueprint/50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blueprint/10 flex items-center justify-center">
                        <LayoutGrid className="w-6 h-6 text-blueprint" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.plot_width}m × {project.plot_depth}m
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {project.style && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blueprint/10 text-blueprint">
                          {project.style}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
