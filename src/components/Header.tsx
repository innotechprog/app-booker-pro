import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-foreground">
          IBIS<span className="text-primary">.</span>
        </h1>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
          Home
        </a>
        <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
          About
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-foreground hover:text-primary p-0 h-auto font-normal">
              Solutions
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/book-service" className="w-full cursor-pointer">Send Me</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Errand Running</DropdownMenuItem>
            <DropdownMenuItem>Delivery Services</DropdownMenuItem>
            <DropdownMenuItem>Personal Assistance</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
          Contact
        </a>
      </nav>
    </header>
  );
};

export default Header;