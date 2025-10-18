import { Link, Settings, Rocket } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      icon: Link,
      title: "Integrate Your Accounts",
      description: "Connect your calendar, email, and CRM to our secure AI agent platform in minutes."
    },
    {
      number: "2",
      icon: Settings,
      title: "Define Your Workflow",
      description: "Set up custom rules and automations for how the AI should handle your client interactions."
    },
    {
      number: "3",
      icon: Rocket,
      title: "Let the AI Take Over",
      description: "The agent autonomously manages your client communication, allowing you to focus on high-value tasks."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-ai-surface relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(195_100%_50%/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(270_80%_60%/0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It <span className="gradient-text">Works</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="text-center group animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Icon Badge with Glow */}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-ai-blue to-ai-purple rounded-full flex items-center justify-center glow-effect group-hover:glow-effect-lg transition-all duration-300 group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                {/* Connecting Line (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-20 w-32 lg:w-48 h-0.5 bg-gradient-to-r from-ai-blue/50 to-transparent" />
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;