import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Box, LogIn, UserPlus, LayoutGrid, Cuboid } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const landingLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  const appLinks = [
    { name: "Floor Plan Generator", href: "/floor-plan-generator", icon: LayoutGrid },
    { name: "3D Model Preview", href: "/3d-preview", icon: Cuboid },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isLandingPage
          ? "bg-transparent"
          : "bg-background/80 backdrop-blur-xl border-b border-border"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blueprint-gradient flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
                <Box className="w-5 h-5 text-blueprint-foreground" />
              </div>
            </div>
            <span className={cn(
              "font-display font-bold text-xl",
              isLandingPage ? "text-white" : "text-foreground"
            )}>
              AI-in<span className="text-blueprint">Architecture</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isLandingPage ? (
              landingLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white/80 hover:text-white font-medium transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))
            ) : (
              appLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 font-medium transition-colors duration-200",
                    location.pathname === link.href
                      ? "text-blueprint"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant={isLandingPage ? "heroOutline" : "ghost"} asChild>
              <Link to="/login">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </Button>
            <Button variant={isLandingPage ? "hero" : "default"} asChild>
              <Link to="/signup">
                <UserPlus className="w-4 h-4" />
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={cn("w-6 h-6", isLandingPage ? "text-white" : "text-foreground")} />
            ) : (
              <Menu className={cn("w-6 h-6", isLandingPage ? "text-white" : "text-foreground")} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border p-4 space-y-4 animate-slide-up">
            {isLandingPage ? (
              landingLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-foreground hover:text-blueprint font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))
            ) : (
              appLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 py-2 font-medium",
                    location.pathname === link.href
                      ? "text-blueprint"
                      : "text-foreground hover:text-blueprint"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))
            )}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button variant="outline" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
