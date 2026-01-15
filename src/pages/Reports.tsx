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
  Bell,
  ChevronDown,
  Home,
  Calculator,
  FileText,
  Users,
  Download,
  FileSpreadsheet,
  FileImage,
  Clock,
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
import { formatDistanceToNow } from "date-fns";

interface FloorPlanProject {
  id: string;
  name: string;
  plot_width: number;
  plot_depth: number;
  style: string | null;
  created_at: string;
  updated_at: string;
}

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<FloorPlanProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, role, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

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
      const { data } = await supabase
        .from("floor_plan_projects")
        .select("id, name, plot_width, plot_depth, style, created_at, updated_at")
        .order("updated_at", { ascending: false });
      setProjects(data || []);
    } finally {
      setLoading(false);
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
    { icon: FolderOpen, label: "Projects", href: "/projects" },
    { icon: LayoutGrid, label: "Floor Plan Generator", href: "/floor-plan-generator" },
    { icon: Box, label: "3D Model Preview", href: "/3d-preview" },
    { icon: Calculator, label: "Cost Estimator", href: "/cost-estimator" },
    { icon: FileText, label: "Reports", href: "/reports", active: true },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const reportTypes = [
    {
      title: "Project Summary",
      description: "Overview of all project details and specifications",
      icon: FileText,
      format: "PDF",
    },
    {
      title: "Cost Analysis",
      description: "Detailed breakdown of estimated costs",
      icon: FileSpreadsheet,
      format: "Excel",
    },
    {
      title: "Floor Plan Export",
      description: "High-resolution floor plan images",
      icon: FileImage,
      format: "PNG/PDF",
    },
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
              <Input placeholder="Search reports..." className="pl-9 w-64 bg-background" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Reports
            </h1>
            <p className="text-muted-foreground">
              Generate and download project reports
            </p>
          </div>

          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {reportTypes.map((report) => (
              <div
                key={report.title}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blueprint/10 flex items-center justify-center">
                    <report.icon className="w-5 h-5 text-blueprint" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.description}
                    </p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      {report.format}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Project Reports */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Available Reports
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-blueprint/30 border-t-blueprint rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No projects available for reports</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/floor-plan-generator">Create a Project</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-blueprint/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blueprint/10 flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-blueprint" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{project.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{project.plot_width}m × {project.plot_depth}m</span>
                          {project.style && (
                            <>
                              <span>•</span>
                              <span>{project.style}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Export as Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileImage className="w-4 h-4 mr-2" />
                            Export Floor Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
