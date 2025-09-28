const Testimonials = () => {
  const testimonials = [
    {
      quote: "Asmex AI has completely transformed our workflow. We've cut down our content creation time by 80% and can now focus on strategy and growth.",
      author: "Jane Doe",
      position: "Founder, Innovate Co."
    },
    {
      quote: "The code generation feature is a lifesaver. It handles all the mundane tasks, allowing our developers to work on more complex and creative projects. Highly recommended.",
      author: "John Smith", 
      position: "Lead Engineer, DevCorp"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Our Clients Say
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-ai-surface rounded-xl p-8 border border-border"
            >
              <p className="text-muted-foreground italic text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-foreground font-semibold">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {testimonial.position}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;