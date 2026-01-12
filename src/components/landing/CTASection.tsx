import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blueprint/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-white/90 text-sm font-medium">Start Free Today</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block text-gradient-hero">Architectural Workflow?</span>
          </h2>

          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of architects and designers who are already creating smarter designs with AI-in Architecture.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Designing Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/login">
                Already have an account?
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
