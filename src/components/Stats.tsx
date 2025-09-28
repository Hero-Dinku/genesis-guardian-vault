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
    <section className="py-16 bg-ai-surface">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center bg-ai-surface-elevated rounded-xl p-8 border border-border"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground text-lg">
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