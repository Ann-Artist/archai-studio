import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Box, 
  LayoutGrid, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Home,
  Calculator,
  FileText,
  Users,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FolderOpen, label: "Projects", href: "/projects" },
    { icon: LayoutGrid, label: "Floor Plan Generator", href: "/floor-plan-generator" },
    { icon: Box, label: "3D Model Preview", href: "/3d-preview" },
    { icon: Calculator, label: "Cost Estimator", href: "/cost-estimator" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

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

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col flex-shrink-0`}>
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
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
  );
};

export default Sidebar;
