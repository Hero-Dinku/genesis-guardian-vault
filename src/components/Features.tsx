import { Calendar, Mail, Users } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Calendar & Schedule Management",
      description: "Our agents can automatically schedule meetings, send invites, and manage your calendar, ensuring you never miss an appointment."
    },
    {
      icon: Mail,
      title: "AI-Powered Email & Call Handling",
      description: "Automate responses, summarize long threads, and route incoming emails and calls to the right team members for efficient communication."
    },
    {
      icon: Users,
      title: "Automated Lead Nurturing",
      description: "Engage with potential clients, send follow-up information, and schedule consultations, all without manual intervention."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How Our AI Agents Can Help You
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-ai-surface rounded-xl p-8 border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;