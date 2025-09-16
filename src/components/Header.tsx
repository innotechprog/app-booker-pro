import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            IBIS<span className="text-primary">.</span>
          </h1>
        </div>
        
        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
            Home
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
            About
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-foreground hover:text-primary transition-colors font-medium flex items-center">
                Solutions
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/education" className="w-full cursor-pointer">Education</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/book-service" className="w-full cursor-pointer">Send Me</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/book-service" className="w-full cursor-pointer">IT Solutions</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
            Contact
          </a>
        </nav>

        {/* Send Me Button */}
        <div className="hidden md:flex items-center">
          <Button asChild className="bg-transparent hover:bg-white/20 text-white hover:text-white border border-white hover:border-white rounded-full px-6 py-2">
            <Link to="/book-service">Send Me</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 border-t border-white/10 md:hidden z-50">
          <nav className="flex flex-col space-y-4 p-4">
            <a 
              href="#home" 
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="#about" 
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <div className="space-y-2">
              <div className="text-foreground font-medium py-2">Solutions</div>
              <div className="pl-4 space-y-2">
                <Link 
                  to="/book-service" 
                  className="block text-foreground hover:text-primary transition-colors py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Send Me
                </Link>
                <a href="#" className="block text-foreground hover:text-primary transition-colors py-1">
                  Errand Running
                </a>
                <a href="#" className="block text-foreground hover:text-primary transition-colors py-1">
                  Delivery Services
                </a>
                <a href="#" className="block text-foreground hover:text-primary transition-colors py-1">
                  Personal Assistance
                </a>
              </div>
            </div>
            <a 
              href="#contact" 
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            <div className="pt-4 border-t border-border">
              <Button asChild className="w-full bg-transparent hover:bg-white/20 text-white hover:text-white border border-white hover:border-white rounded-full">
                <Link to="/book-service" onClick={() => setIsMobileMenuOpen(false)}>
                  Send Me
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;