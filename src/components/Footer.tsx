import React from "react";
import logo from "@/assets/cloutcash-logo.png";
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react";

// Wrap Footer in forwardRef so parent can scroll to it
export const Footer = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <footer
      ref={ref}
      className="bg-secondary text-secondary-foreground py-12"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <img
              src={logo}
              alt="CloutCash"
              className="h-10 mb-4 brightness-0 invert"
            />
            <p className="text-sm text-white/70 leading-relaxed">
              IP-driven matchmaking platform connecting micro-influencers with brands.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">For Influencers</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-primary transition-colors">Find Campaigns</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Resources</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">For Brands</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-primary transition-colors">Find Creators</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Access</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#blog" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#press" className="hover:text-primary transition-colors">Press Kit</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © 2025 CloutCash. All rights reserved.
          </p>
          
          <div className="flex gap-4">
            <a href="#" className="text-white/60 hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-primary transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer"; // required when using forwardRef
