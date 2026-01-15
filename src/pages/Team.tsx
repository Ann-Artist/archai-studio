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
  Plus,
  Mail,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const Team = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, profile, role, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

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
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Users, label: "Team", href: "/team", active: true },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  // Mock team members - in a real app, this would come from the database
  const teamMembers = [
    {
      id: "1",
      name: profile?.full_name || user?.email?.split("@")[0] || "You",
      email: user?.email || "",
      role: getRoleLabel(role),
      isCurrentUser: true,
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
              <Input placeholder="Search team members..." className="pl-9 w-64 bg-background" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <Button variant="accent">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Team
            </h1>
            <p className="text-muted-foreground">
              Manage your team members and collaborators
            </p>
          </div>

          {/* Team Members */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Team Members
              </h2>
              <span className="text-sm text-muted-foreground">
                {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-background border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blueprint-gradient flex items-center justify-center text-white font-medium">
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{member.name}</h3>
                        {member.isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blueprint/10 text-blueprint">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Invite Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium text-foreground mb-4">Invite Team Members</h3>
              <div className="flex gap-3">
                <Input placeholder="Enter email address" className="flex-1" />
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Send Invite
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Invited members will receive an email to join your workspace
              </p>
            </div>
          </div>

          {/* Pending Invites */}
          <div className="bg-card rounded-2xl border border-border p-6 mt-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Pending Invites
            </h2>
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending invites</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Team;
