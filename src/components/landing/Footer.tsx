import { Link } from "react-router-dom";
import { Box, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-16 border-t border-border/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blueprint-gradient flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Archi<span className="text-blueprint">Ai</span>
              </span>
            </Link>
            <p className="text-primary-foreground/60 text-sm mb-4">
              AI-powered architecture design platform for the modern architect.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-primary-foreground/60 hover:text-blueprint transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-blueprint transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-blueprint transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {["Features", "Floor Plan AI", "3D Viewer", "Cost Estimator", "Documentation"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {["About Us", "Careers", "Blog", "Press Kit", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © 2026 ArchiAi. All rights reserved.
            </p>
            <p className="text-primary-foreground/50 text-sm">
              Designed with ❤️ for architects worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
