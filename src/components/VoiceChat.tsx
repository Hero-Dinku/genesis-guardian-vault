import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone } from 'lucide-react';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoiceChat = ({ open, onOpenChange }: VoiceChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionStartedRef = useRef(false);
  const { toast } = useToast();

  const startConversation = async () => {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use voice chat",
          variant: "destructive",
        });
        return;
      }

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Connect to WebSocket with authentication
      const wsUrl = `wss://ooqshqbvcujsysevvklx.supabase.co/functions/v1/realtime-chat`;
      const ws = new WebSocket(wsUrl, ['websocket', session.access_token]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Voice chat is ready",
        });
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);

        if (data.type === 'session.created') {
          console.log('Session created, sending configuration...');
          sessionStartedRef.current = true;
          
          // Send session update with configuration
          ws.send(JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: 'You are a helpful AI assistant. Keep your responses conversational and natural.',
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          }));

          // Start recording after session is configured
          recorderRef.current = new AudioRecorder((audioData) => {
            if (ws.readyState === WebSocket.OPEN && sessionStartedRef.current) {
              const encoded = encodeAudioForAPI(audioData);
              ws.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: encoded
              }));
            }
          });
          await recorderRef.current.start();
        }

        if (data.type === 'session.updated') {
          console.log('Session configured successfully');
        }

        if (data.type === 'response.audio.delta' && audioContextRef.current) {
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await playAudioData(audioContextRef.current, bytes);
          setIsSpeaking(true);
        }

        if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        }

        if (data.type === 'response.audio_transcript.delta') {
          setTranscript(prev => {
            const newTranscript = [...prev];
            if (newTranscript.length > 0 && data.item_id === newTranscript[newTranscript.length - 1]) {
              return newTranscript;
            }
            return [...newTranscript, data.delta];
          });
        }

        if (data.type === 'conversation.item.input_audio_transcription.completed') {
          setTranscript(prev => [...prev, `You: ${data.transcript}`]);
        }

        if (data.type === 'error') {
          console.error('OpenAI error:', data);
          toast({
            title: "Error",
            description: data.error?.message || "An error occurred",
            variant: "destructive",
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice chat",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        sessionStartedRef.current = false;
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    clearAudioQueue();
    setIsConnected(false);
    setIsSpeaking(false);
    setTranscript([]);
    sessionStartedRef.current = false;
  };

  useEffect(() => {
    if (!open) {
      endConversation();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      endConversation();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Voice Chat</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isSpeaking 
                ? 'bg-ai-blue animate-pulse' 
                : isConnected 
                  ? 'bg-primary' 
                  : 'bg-muted'
            }`}>
              {isConnected ? (
                <Mic className="w-16 h-16 text-white" />
              ) : (
                <MicOff className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">
              {isConnected 
                ? isSpeaking 
                  ? 'AI is speaking...' 
                  : 'Listening...'
                : 'Not connected'}
            </p>
          </div>

          <div className="w-full max-h-48 overflow-y-auto space-y-2 px-4">
            {transcript.map((text, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {text}
              </p>
            ))}
          </div>

          <div className="flex gap-4">
            {!isConnected ? (
              <Button 
                onClick={startConversation}
                className="bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Voice Chat
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                variant="destructive"
                size="lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                End Call
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
