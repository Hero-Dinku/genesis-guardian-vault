import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sparkles, Rocket, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

const contactFormSchema = z.object({
  businessName: z.string()
    .trim()
    .min(1, "Business name is required")
    .max(100, "Business name must be less than 100 characters"),
  address: z.string()
    .trim()
    .max(200, "Address must be less than 200 characters")
    .optional(),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
});

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = contactFormSchema.parse(formData);
      
      // TODO: Implement server-side submission when backend is ready
      toast({
        title: "Form submitted successfully",
        description: "We'll get back to you soon!",
      });
      
      // Reset form
      setFormData({
        businessName: "",
        address: "",
        email: "",
        phone: ""
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive",
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-primary via-ai-purple to-ai-teal relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ai-blue rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Limited Time Offer</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your Business with AI
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Get a <span className="font-bold text-white">free personalized demo</span> and discover how AI automation can 10x your productivity
          </p>

          {/* Benefits list */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {[
              "Free Consultation",
              "Custom AI Solutions",
              "24/7 Support"
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-ai-green" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="max-w-xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  type="text"
                  name="businessName"
                  placeholder="Business or Client Name *"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 text-lg focus:bg-white/30 transition-all ${errors.businessName ? 'border-red-500' : ''}`}
                  maxLength={100}
                  required
                />
                {errors.businessName && (
                  <p className="text-red-300 text-sm mt-1">{errors.businessName}</p>
                )}
              </div>
              <div>
                <Input
                  type="text"
                  name="address"
                  placeholder="Business Address (Optional)"
                  value={formData.address}
                  onChange={handleChange}
                  className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 text-lg focus:bg-white/30 transition-all ${errors.address ? 'border-red-500' : ''}`}
                  maxLength={200}
                />
                {errors.address && (
                  <p className="text-red-300 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 text-lg focus:bg-white/30 transition-all ${errors.email ? 'border-red-500' : ''}`}
                  maxLength={255}
                  required
                />
                {errors.email && (
                  <p className="text-red-300 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 text-lg focus:bg-white/30 transition-all ${errors.phone ? 'border-red-500' : ''}`}
                  maxLength={20}
                />
                {errors.phone && (
                  <p className="text-red-300 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <Button 
                type="submit"
                className="w-full bg-white text-primary hover:bg-white/90 hover:scale-105 py-6 text-xl font-bold shadow-xl transition-all duration-300 group"
              >
                <Rocket className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                Claim Your Free Demo Now
              </Button>
              <p className="text-center text-white/70 text-sm mt-4">
                No credit card required • Free consultation • Instant access
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;