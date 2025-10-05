import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Home, Search, BarChart3, Network } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Parallax effect for earth background
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const background = document.querySelector('.earth-background') as HTMLElement;
      if (background) {
        // Parallax: Move background slower than scroll (0.5x speed)
        background.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to check if route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen relative">
      {/* Earth Background with Parallax */}
      <div className="earth-background" />
      
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <img 
                  src="/images/logo_spaceappgs.png" 
                  alt="NISCS Logo" 
                  className="h-12 w-auto object-contain"
                />
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive("/")
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  {t("nav.home")}
                </Link>

                <Link
                  to="/explore"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive("/explore")
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  {t("nav.explore")}
                </Link>

                
               
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
};
