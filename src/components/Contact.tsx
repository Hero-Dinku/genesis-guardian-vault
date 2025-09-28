import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-r from-primary via-ai-teal to-primary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Automate Your Business?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join the future of web development. Enter your email below to get started with 
            a free demo and consultation.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="businessName"
              placeholder="Business or Client Name *"
              value={formData.businessName}
              onChange={handleChange}
              className="bg-white/10 border-white/30 text-primary-foreground placeholder:text-primary-foreground/70"
              required
            />
            <Input
              type="text"
              name="address"
              placeholder="Business Address"
              value={formData.address}
              onChange={handleChange}
              className="bg-white/10 border-white/30 text-primary-foreground placeholder:text-primary-foreground/70"
            />
            <Input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              className="bg-white/10 border-white/30 text-primary-foreground placeholder:text-primary-foreground/70"
              required
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone or Business Contact"
              value={formData.phone}
              onChange={handleChange}
              className="bg-white/10 border-white/30 text-primary-foreground placeholder:text-primary-foreground/70"
            />
            <Button 
              type="submit"
              className="w-full bg-white text-primary hover:bg-white/90 py-3 text-lg font-semibold"
            >
              Request Demo
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;