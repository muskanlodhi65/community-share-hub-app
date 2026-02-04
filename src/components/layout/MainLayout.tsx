import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Shield, Sparkles, Github, Twitter, Mail } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      
      {/* Rich Footer */}
      <footer className="border-t border-border/50 bg-card/60 backdrop-blur-xs mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand */}
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="eco-gradient-text font-extrabold text-xl">EcoHub</span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empowering communities to share tools, borrow equipment, and live sustainably. Reduce consumption, save money, and build local connections.
              </p>
              <div className="flex items-center gap-3 pt-2 text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors p-1.5 rounded-full bg-muted/60 hover:bg-muted" aria-label="Github">
                  <Github className="h-4 w-4" />
                </a>
                <a href="#" className="hover:text-primary transition-colors p-1.5 rounded-full bg-muted/60 hover:bg-muted" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="hover:text-primary transition-colors p-1.5 rounded-full bg-muted/60 hover:bg-muted" aria-label="Contact Email">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Quick Links</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">Home Page</Link>
                </li>
                <li>
                  <Link to="/browse" className="hover:text-primary transition-colors">Browse Marketplace</Link>
                </li>
                <li>
                  <Link to="/add-item" className="hover:text-primary transition-colors">List an Item</Link>
                </li>
                <li>
                  <Link to="/my-items" className="hover:text-primary transition-colors">My Listed Items</Link>
                </li>
                <li>
                  <Link to="/requests" className="hover:text-primary transition-colors">Borrow Requests</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Categories */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Explore Categories</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/browse?category=Tools" className="hover:text-primary transition-colors">Power & Hand Tools</Link>
                </li>
                <li>
                  <Link to="/browse?category=Gardening" className="hover:text-primary transition-colors">Lawn & Garden Care</Link>
                </li>
                <li>
                  <Link to="/browse?category=Electronics" className="hover:text-primary transition-colors">Electronics & Gadgets</Link>
                </li>
                <li>
                  <Link to="/browse?category=Outdoor" className="hover:text-primary transition-colors">Camping & Outdoor</Link>
                </li>
                <li>
                  <Link to="/browse?category=Kitchen" className="hover:text-primary transition-colors">Kitchen Appliances</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Eco Impact & Trust */}
            <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Sparkles className="h-4 w-4" /> Eco Impact Guarantee
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Over <strong className="text-foreground">500+ items</strong> shared by verified community members. Saving ~1.5 Tons of CO₂ waste together every month!
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <Shield className="h-3.5 w-3.5 text-primary" /> Verified Member Trust System
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              Made with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for Sustainable Communities
            </p>
            <p>© {new Date().getFullYear()} EcoHub – Smart Community Resource Sharing Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};