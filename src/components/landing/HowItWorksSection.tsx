import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Define Your Project",
    description: "Enter your project details including plot size, number of rooms, budget, and design preferences.",
    color: "blueprint",
  },
  {
    number: "02",
    title: "AI Generates Designs",
    description: "Our AI analyzes your requirements and generates multiple floor plan options with smart space optimization.",
    color: "accent",
  },
  {
    number: "03",
    title: "Customize & Visualize",
    description: "Fine-tune your chosen design, explore in 3D, and get AI-powered material and interior suggestions.",
    color: "blueprint",
  },
  {
    number: "04",
    title: "Estimate & Document",
    description: "Get detailed cost breakdowns, generate professional reports, and share with clients for approval.",
    color: "accent",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-gradient-hero">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From concept to construction documents in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="absolute top-24 left-8 right-8 h-0.5 bg-gradient-to-r from-blueprint via-accent to-blueprint opacity-20 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Step Card */}
                <div className="text-center">
                  {/* Number Circle */}
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border-2 border-border group-hover:border-blueprint transition-colors duration-300 mb-6 shadow-lg">
                    <span className={`font-display text-2xl font-bold text-${step.color}`}>
                      {step.number}
                    </span>
                    {/* Connector Arrow */}
                    {index < steps.length - 1 && (
                      <ArrowRight className="absolute -right-10 w-5 h-5 text-muted-foreground hidden lg:block" />
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
