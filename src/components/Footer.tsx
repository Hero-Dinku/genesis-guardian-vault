import { Facebook, X, Instagram, Phone, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Contact Info */}
          <div className="text-center md:text-left text-muted-foreground">
            <p className="mb-2">© 2025 Asmex AI. All rights reserved.</p>
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-sm hover:text-primary transition-colors inline-flex items-center gap-2 cursor-pointer mb-2">
                  <MapPin size={16} />
                  1775 Tysons Blvd Suite 500, Tysons, VA 22102
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Our Location</DialogTitle>
                </DialogHeader>
                <div className="w-full h-[500px] rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.0847267729633!2d-77.22464092404195!3d38.91867997171474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b64b0b456f0001%3A0x7b4b7b7b7b7b7b7b!2s1775%20Tysons%20Blvd%20%23500%2C%20McLean%2C%20VA%2022102!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Asmex AI Location"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  1775 Tysons Blvd Suite 500, Tysons, VA 22102
                </p>
              </DialogContent>
            </Dialog>
            <p className="text-sm mb-4">+(1) 202-556-1441</p>
            
            {/* Social Media Links */}
            <div className="flex justify-center md:justify-start gap-6 mt-6">
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

          {/* Map Display */}
          <div className="relative group animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
            <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl h-[250px] hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 shadow-lg">
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span>Visit Our Office</span>
                </p>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.0847267729633!2d-77.22464092404195!3d38.91867997171474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b64b0b456f0001%3A0x7b4b7b7b7b7b7b7b!2s1775%20Tysons%20Blvd%20%23500%2C%20McLean%2C%20VA%2022102!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Asmex AI Location - Footer Map"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;