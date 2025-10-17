import { Facebook, X, Instagram, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">© 2025 Asmex AI. All rights reserved.</p>
          <a 
            href="https://www.google.com/maps?q=1775+Tysons+Blvd+Suite+500,+Tysons,+VA+22102" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-primary transition-colors inline-block"
          >
            📍 1775 Tysons Blvd Suite 500, Tysons, VA 22102
          </a>
          <p className="text-sm mb-4">202-556-1441</p>
          
          {/* Social Media Links */}
          <div className="flex justify-center gap-6 mt-6">
            <a 
              href="https://www.facebook.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a 
              href="https://x.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary transition-colors"
              aria-label="X"
            >
              <X size={24} />
            </a>
            <a 
              href="https://www.instagram.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a 
              href="https://web.whatsapp.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary transition-colors"
              aria-label="WhatsApp"
            >
              <Phone size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;