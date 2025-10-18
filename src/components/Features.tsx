import { Calendar, Mail, Users, Settings } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Calendar & Schedule Management",
      description: "Automatically schedule meetings, send invites, and avoid double-booking—ensuring you never miss an appointment."
    },
    {
      icon: Mail,
      title: "AI-Powered Email & Call Handling",
      description: "Automate responses, summarize long email threads, and intelligently route calls to the right team members."
    },
    {
      icon: Users,
      title: "Automated Lead Nurturing",
      description: "Engage potential clients, send personalized follow-ups, and schedule consultations—all without manual intervention."
    },
    {
      icon: Settings,
      title: "Custom Workflows & Integration",
      description: "Flexible automation tailored to your business needs. Seamlessly integrate with your existing tools and processes for maximum efficiency."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ai-blue/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-blue/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ai-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How Our <span className="gradient-text">AI Agents</span> Can Help You
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-ai-surface rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-500 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-ai-blue/0 via-ai-purple/0 to-ai-teal/0 group-hover:from-ai-blue/10 group-hover:via-ai-purple/10 group-hover:to-ai-teal/10 rounded-2xl transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-ai-blue to-ai-purple rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 glow-effect">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;