const Stats = () => {
  const stats = [
    {
      number: "500+",
      label: "Projects Automated"
    },
    {
      number: "80%",
      label: "Time Saved"
    },
    {
      number: "1000+",
      label: "Happy Clients"
    }
  ];

  return (
    <section className="py-16 bg-ai-surface relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-ai-blue/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center glass-effect rounded-2xl p-8 hover-glow group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-5xl md:text-6xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-muted-foreground text-lg font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;