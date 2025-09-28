const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Integrate Your Accounts",
      description: "Connect your calendar, email, and CRM to our secure AI agent platform in minutes."
    },
    {
      number: "2", 
      title: "Define Your Workflow",
      description: "Set up custom rules and automations for how the AI should handle your client interactions."
    },
    {
      number: "3",
      title: "Let the AI Take Over",
      description: "The agent autonomously manages your client communication, allowing you to focus on high-value tasks."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-ai-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
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