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
  IndianRupee,
  Building2,
  Paintbrush,
  Zap,
  Droplets,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FloorPlanProject {
  id: string;
  name: string;
  plot_width: number;
  plot_depth: number;
}

const CostEstimator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<FloorPlanProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [area, setArea] = useState(1000);
  const [constructionType, setConstructionType] = useState("standard");
  const [floors, setFloors] = useState(1);
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
    const { data } = await supabase
      .from("floor_plan_projects")
      .select("id, name, plot_width, plot_depth")
      .order("updated_at", { ascending: false });
    setProjects(data || []);
  };

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find((p) => p.id === selectedProject);
      if (project) {
        setArea(project.plot_width * project.plot_depth);
      }
    }
  }, [selectedProject, projects]);

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
    { icon: Calculator, label: "Cost Estimator", href: "/cost-estimator", active: true },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  // Cost calculation logic
  const baseCostPerSqFt = {
    basic: 1200,
    standard: 1800,
    premium: 2500,
    luxury: 3500,
  };

  const totalArea = area * floors;
  const baseCost = totalArea * baseCostPerSqFt[constructionType as keyof typeof baseCostPerSqFt];
  const interiorCost = baseCost * 0.25;
  const electricalCost = baseCost * 0.08;
  const plumbingCost = baseCost * 0.06;
  const totalCost = baseCost + interiorCost + electricalCost + plumbingCost;

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  const costBreakdown = [
    { label: "Construction", value: baseCost, icon: Building2, color: "blueprint" },
    { label: "Interior & Finishing", value: interiorCost, icon: Paintbrush, color: "accent" },
    { label: "Electrical", value: electricalCost, icon: Zap, color: "success" },
    { label: "Plumbing", value: plumbingCost, icon: Droplets, color: "blueprint" },
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
              <Input placeholder="Search..." className="pl-9 w-64 bg-background" />
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
              Cost Estimator
            </h1>
            <p className="text-muted-foreground">
              Get accurate construction cost estimates for your projects
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  Project Configuration
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label>Select Project (Optional)</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Plot Area (sq. meters)</Label>
                    <Input
                      type="number"
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Number of Floors: {floors}</Label>
                    <Slider
                      value={[floors]}
                      onValueChange={(v) => setFloors(v[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Construction Type</Label>
                    <Select value={constructionType} onValueChange={setConstructionType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (₹1,200/sq.ft)</SelectItem>
                        <SelectItem value="standard">Standard (₹1,800/sq.ft)</SelectItem>
                        <SelectItem value="premium">Premium (₹2,500/sq.ft)</SelectItem>
                        <SelectItem value="luxury">Luxury (₹3,500/sq.ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* Total Cost Card */}
              <div className="bg-blueprint-gradient rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Estimated Total Cost</p>
                    <p className="font-display text-3xl font-bold">{formatCurrency(totalCost)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Total Area:</span>
                    <span className="ml-2 font-medium">{totalArea.toLocaleString()} sq.m</span>
                  </div>
                  <div>
                    <span className="text-white/70">Cost per sq.ft:</span>
                    <span className="ml-2 font-medium">
                      ₹{baseCostPerSqFt[constructionType as keyof typeof baseCostPerSqFt].toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {costBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${item.color}/10 flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 text-${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-display text-xl font-bold text-foreground">
                          {formatCurrency(item.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Estimates are based on current market rates in major cities</li>
                  <li>Actual costs may vary based on location and material choices</li>
                  <li>Land cost is not included in this estimate</li>
                  <li>Government fees and approvals are additional</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CostEstimator;
