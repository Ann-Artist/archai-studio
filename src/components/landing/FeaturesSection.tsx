import { 
  LayoutGrid, 
  Box, 
  Palette, 
  Home, 
  Calculator, 
  FileText, 
  Camera, 
  Users, 
  GitCompare, 
  MessageSquare 
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "AI Floor Plan Generator",
    description: "Generate intelligent floor plans based on your requirements. Simply input room specifications and let AI create optimized layouts.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Box,
    title: "3D Model Preview",
    description: "Visualize your designs in stunning 3D. Rotate, zoom, and explore every angle of your architectural masterpiece.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Palette,
    title: "Smart Material Suggestions",
    description: "Get intelligent recommendations for materials, colors, and finishes based on your style preferences and budget.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Home,
    title: "Interior Layout Generator",
    description: "AI-powered interior design that optimizes furniture placement, lighting, and spatial flow.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Calculator,
    title: "Real-time Cost Estimator",
    description: "Get accurate cost breakdowns instantly. Track construction, material, and labor expenses in real-time.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: FileText,
    title: "Auto Documentation",
    description: "Generate comprehensive project reports, blueprints, and construction guidelines automatically.",
    gradient: "from-slate-500 to-zinc-500",
  },
  {
    icon: Camera,
    title: "Image Recognition",
    description: "Upload reference images and let AI analyze architectural styles, materials, and design elements.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Secure authentication with role-based access. Track login history and manage team permissions.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: GitCompare,
    title: "Design Comparison",
    description: "Compare multiple design iterations side by side. Analyze costs, space efficiency, and aesthetics.",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: MessageSquare,
    title: "Client Feedback System",
    description: "Streamlined approval workflow with comments, revision requests, and real-time collaboration.",
    gradient: "from-orange-500 to-red-500",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 blueprint-grid opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blueprint/10 text-blueprint text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Design
            <span className="text-gradient-hero"> Smarter</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From AI-powered floor plans to real-time cost estimates, our comprehensive toolkit transforms your architectural workflow.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-blueprint/50 transition-all duration-300 hover:shadow-lg hover:shadow-blueprint/5 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blueprint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
