import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import aiBrain from "@/assets/ai-brain.png";
import { VoiceChat } from "./VoiceChat";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-ai-surface to-ai-surface-elevated">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-ai-surface to-ai-surface-elevated">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(0, 200, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(0, 150, 255, 0.05) 0%, transparent 50%)`
        }} />
      </div>
      
      <div className="container mx-auto px-6 pt-24 md:pt-32 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-snug text-white">
              AI Solutions for Smarter Growth
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              From code generation to content creation, our intelligent agents
              handle the heavy lifting so you can focus on innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="default" 
                size="lg" 
                className="bg-primary hover:bg-ai-blue-dark text-primary-foreground px-8 py-4 text-lg"
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Sign in required",
                      description: "Please create an account or sign in to use voice chat",
                      variant: "destructive",
                    });
                    navigate('/auth');
                  } else {
                    setVoiceChatOpen(true);
                  }
                }}
              >
                Start Voice Chat
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* AI Brain Visual */}
          <div className="relative">
            <img 
              src={aiBrain} 
              alt="AI Brain Visualization" 
              className="mx-auto max-w-lg w-full h-auto opacity-90"
            />
          </div>
        </div>
      </div>

      <VoiceChat open={voiceChatOpen} onOpenChange={setVoiceChatOpen} />
    </section>
  );
};

export default Hero;