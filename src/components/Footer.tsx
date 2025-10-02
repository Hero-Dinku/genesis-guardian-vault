import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">© 2025 Asmex AI. All rights reserved.</p>
          <p className="text-sm">1775 Tysons Blvd Suite 500, Tysons, VA 22102</p>
          <p className="text-sm mb-4">202-555-3441</p>
          
          {/* Social Media Links */}
          <div className="flex justify-center gap-6 mt-6">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;