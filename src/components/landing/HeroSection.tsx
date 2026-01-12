import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-architecture.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,60%,15%,0.85)] via-[hsl(210,70%,20%,0.8)] to-[hsl(200,60%,25%,0.75)]" />
      
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blueprint/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      {/* Architectural Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-blueprint/20 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blueprint/20 to-transparent" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blueprint/20 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-white/90 text-sm font-medium">AI-Powered Architecture Design</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
            Design the Future of
            <span className="block text-gradient-hero">Architecture</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Generate intelligent floor plans, stunning 3D visualizations, and precise cost estimates with our AI-powered platform. From concept to construction, simplified.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Designing Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#demo">
                <Play className="w-5 h-5" />
                Watch Demo
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: "10K+", label: "Designs Generated" },
              { value: "98%", label: "Accuracy Rate" },
              { value: "50+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
