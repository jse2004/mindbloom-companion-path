
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Mic, Paperclip, UserRound, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai" | "doctor";
  timestamp: Date;
};

// Type for database storage (with string timestamps)
type DatabaseMessage = {
  id: string;
  content: string;
  sender: "user" | "ai" | "doctor";
  timestamp: string;
};

type ChatSession = {
  id: string;
  title: string;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

const ChatInterface = () => {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your mental health assistant. How are you feeling today? I can help assess your emotions, or you can request to speak with a medical professional.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatMode, setChatMode] = useState<"ai" | "expert">("ai");
  const [isAwaitingExpert, setIsAwaitingExpert] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const expertRequestForm = useForm({
    defaultValues: {
      reason: "",
      urgency: "normal",
      contactPreference: "chat",
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper function to convert database messages to app messages
  const convertDatabaseMessagesToMessages = (dbMessages: any[]): Message[] => {
    return dbMessages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  };

  // Helper function to convert app messages to database messages
  const convertMessagesToDatabaseMessages = (messages: Message[]): DatabaseMessage[] => {
    return messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));
  };
  
  const loadChatHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading chat history:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive"
        });
        return;
      }

      const formattedHistory: ChatSession[] = (data || []).map(session => ({
        ...session,
        messages: Array.isArray(session.messages) 
          ? convertDatabaseMessagesToMessages(session.messages as any[])
          : []
      }));

      setChatHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error", 
        description: "Failed to load chat history",
        variant: "destructive"
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveChatSession = async (messages: Message[]) => {
    if (!user || messages.length <= 1) return;

    try {
      const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
      const title = lastUserMessage?.content.substring(0, 50) + (lastUserMessage?.content.length > 50 ? '...' : '') || 'New conversation';
      
      // Convert messages to database format
      const dbMessages = convertMessagesToDatabaseMessages(messages);
      
      if (currentChatId) {
        // Update existing session
        const { error } = await supabase
          .from('chat_sessions')
          .update({
            title,
            messages: dbMessages,
            last_message: lastUserMessage?.content || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentChatId);

        if (error) {
          console.error('Error updating chat session:', error);
        }
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            title,
            messages: dbMessages,
            last_message: lastUserMessage?.content || '',
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating chat session:', error);
        } else {
          setCurrentChatId(data.id);
        }
      }
      
      loadChatHistory();
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error loading chat session:', error);
        return;
      }

      const sessionMessages = Array.isArray(data.messages) 
        ? convertDatabaseMessagesToMessages(data.messages as any[])
        : [];
      setMessages(sessionMessages);
      setCurrentChatId(sessionId);
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage("");

    // Save to database
    await saveChatSession(updatedMessages);

    // Check for meditation keywords
    const meditationKeywords = ["meditate", "meditation", "calm", "relax", "breathing", "mindfulness"];
    const containsMeditation = meditationKeywords.some(keyword => 
      inputMessage.toLowerCase().includes(keyword)
    );

    if (containsMeditation) {
      setTimeout(() => {
        const meditationMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I notice you're interested in meditation. That's wonderful! Meditation can be very helpful for managing stress and anxiety. Would you like me to guide you to our meditation page where you can start a session?",
          sender: "ai",
          timestamp: new Date(),
        };
        const messagesWithMeditation = [...updatedMessages, meditationMessage];
        setMessages(messagesWithMeditation);
        saveChatSession(messagesWithMeditation);
      }, 1000);
      return;
    }

    // Check for expert request keywords
    const expertKeywords = ["speak to doctor", "talk to expert", "need professional", "speak with doctor", "human expert", "medical professional"];
    const containsExpertRequest = expertKeywords.some(keyword => 
      inputMessage.toLowerCase().includes(keyword)
    );

    if (chatMode === "expert" || containsExpertRequest) {
      if (!isAwaitingExpert) {
        setChatMode("expert");
        setIsAwaitingExpert(true);
        
        setTimeout(() => {
          const doctorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "Thank you for reaching out. A medical professional has been notified and will join this conversation shortly. While you wait, can you please provide more details about your concern?",
            sender: "doctor",
            timestamp: new Date(),
          };
          const messagesWithDoctor = [...updatedMessages, doctorMessage];
          setMessages(messagesWithDoctor);
          saveChatSession(messagesWithDoctor);
        }, 1500);
      }
    } else {
      // Generate AI response
      setTimeout(() => {
        const processedMessage = inputMessage.toLowerCase();
        
        let responseType = "general";
        
        if (processedMessage.includes("anxious") || processedMessage.includes("worry") || 
            processedMessage.includes("nervous") || processedMessage.includes("panic")) {
          responseType = "anxiety";
        } else if (processedMessage.includes("sad") || processedMessage.includes("depress") || 
                  processedMessage.includes("hopeless") || processedMessage.includes("empty")) {
          responseType = "depression";
        } else if (processedMessage.includes("stress") || processedMessage.includes("overwhelm") || 
                  processedMessage.includes("pressure")) {
          responseType = "stress";
        }
        
        const aiResponses = {
          anxiety: [
            "I notice you mentioned feeling anxious. Anxiety often manifests as persistent worry or fear. Would you like to explore some grounding techniques that might help?",
            "When you experience anxiety, how does it typically affect your daily activities? Understanding this can help us find better coping strategies.",
            "Anxiety can often cause physical symptoms like rapid heartbeat or shallow breathing. Have you noticed any physical sensations along with your worry?",
          ],
          depression: [
            "I can hear that you're experiencing some low mood. Depression can make everything feel more difficult. How long have you been feeling this way?",
            "When you're feeling down, are there any activities that still bring you some sense of enjoyment or accomplishment?",
            "Depression often affects our energy levels and motivation. Have you noticed changes in your sleep or appetite lately?",
          ],
          stress: [
            "It sounds like you're under significant stress. What specific situations trigger your stress response the most?",
            "Chronic stress can affect both mind and body. Have you been able to incorporate any relaxation techniques into your routine?",
            "Managing stress often requires addressing both immediate symptoms and underlying causes. Would you like to explore some stress management strategies?",
          ],
          general: [
            "I understand how you feel. Would you like to talk more about what's causing these emotions?",
            "That sounds challenging. Have you tried any coping strategies that have helped in the past?",
            "I'm here to support you. Would it help to explore some relaxation techniques?",
            "Thank you for sharing that with me. How long have you been feeling this way?",
            "I'm listening. Sometimes expressing our feelings is the first step toward feeling better.",
          ],
        };

        const responsesForType = aiResponses[responseType];
        const randomResponse = responsesForType[Math.floor(Math.random() * responsesForType.length)];

        if (processedMessage.includes("assess") || processedMessage.includes("evaluate") || 
            processedMessage.includes("test") || processedMessage.includes("questionnaire")) {
          const assessmentMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "If you'd like a more thorough assessment of your mental health, I'd recommend taking our comprehensive assessment. Would you like me to guide you to our assessment page?",
            sender: "ai",
            timestamp: new Date(),
          };
          const messagesWithAI = [...updatedMessages, assessmentMessage];
          setMessages(messagesWithAI);
          saveChatSession(messagesWithAI);
        } else {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: randomResponse,
            sender: "ai",
            timestamp: new Date(),
          };
          const messagesWithAI = [...updatedMessages, aiMessage];
          setMessages(messagesWithAI);
          saveChatSession(messagesWithAI);
        }
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleRequestExpert = (data: any) => {
    setIsAwaitingExpert(true);
    setChatMode("expert");
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      content: `Your request to speak with a medical professional has been submitted. Reason: ${data.reason}. Urgency: ${data.urgency}. A doctor will connect with you shortly.`,
      sender: "doctor",
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, systemMessage];
    setMessages(updatedMessages);
    saveChatSession(updatedMessages);
    
    toast({
      title: "Expert Request Submitted",
      description: "A medical professional will connect with you shortly.",
    });
  };

  const switchToAssessment = () => {
    navigate("/assessment");
  };

  const startNewChat = () => {
    setMessages([{
      id: "new",
      content: "Hello! I'm your mental health assistant. How are you feeling today? I can help assess your emotions, or you can request to speak with a medical professional.",
      sender: "ai",
      timestamp: new Date()
    }]);
    setCurrentChatId(null);
    setChatMode("ai");
    setIsAwaitingExpert(false);
  };

  const navigateToMeditation = () => {
    navigate("/meditation");
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] bg-white rounded-xl shadow-sm border">
      {/* Chat header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-lg">Mental Health Assistant</h2>
            <p className="text-sm text-gray-500">
              {chatMode === "ai" ? "AI-powered support available 24/7" : "Medical Professional Support"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startNewChat}>
              New Chat
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToMeditation}>
              Start Meditation
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserRound className="h-4 w-4 mr-1" />
                  Speak with Expert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request to speak with a medical professional</DialogTitle>
                  <DialogDescription>
                    Please provide some information about your request.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...expertRequestForm}>
                  <form onSubmit={expertRequestForm.handleSubmit(handleRequestExpert)} className="space-y-4">
                    <FormField
                      control={expertRequestForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for consultation</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Briefly describe why you'd like to speak with a medical professional" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={expertRequestForm.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency</FormLabel>
                          <FormControl>
                            <Tabs defaultValue="normal" className="w-full" onValueChange={field.onChange}>
                              <TabsList className="grid grid-cols-3 w-full">
                                <TabsTrigger value="low">Low</TabsTrigger>
                                <TabsTrigger value="normal">Normal</TabsTrigger>
                                <TabsTrigger value="high">High</TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-start gap-2 text-sm">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium">Important notice</p>
                        <p className="text-yellow-700">If you're experiencing a mental health emergency, please call emergency services immediately or go to your nearest emergency room.</p>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit">Submit Request</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={switchToAssessment}>
              Take Assessment
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.sender === "user"
                    ? "bg-support-500 text-white rounded-tr-none"
                    : message.sender === "doctor"
                    ? "bg-mind-100 text-gray-800 rounded-tl-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                )}
              >
                {message.sender === "doctor" && (
                  <div className="font-medium text-mind-700 text-xs mb-1">Medical Professional</div>
                )}
                <p>{message.content}</p>
                <span
                  className={cn(
                    "text-xs mt-1 block",
                    message.sender === "user" 
                      ? "text-support-100" 
                      : message.sender === "doctor"
                      ? "text-mind-500"
                      : "text-gray-500"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat History Sidebar */}
        <div className="w-64 border-l bg-gray-50 p-4 overflow-y-auto">
          <h3 className="font-medium text-sm mb-3">Chat History</h3>
          {loadingHistory ? (
            <div className="text-center py-3 text-gray-500 text-sm">
              <p>Loading...</p>
            </div>
          ) : chatHistory.length > 0 ? (
            <div className="space-y-2">
              {chatHistory.map(chat => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className="w-full justify-start text-left p-2 h-auto"
                  onClick={() => loadChatSession(chat.id)}
                >
                  <div className="text-left">
                    <p className="font-medium text-xs truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 truncate">{chat.last_message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500 text-sm">
              <p>No chat history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <Mic className="h-5 w-5 text-gray-500" />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={chatMode === "ai" ? "Type a message..." : "Type your message to the medical professional..."}
            className="rounded-full"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            size="icon"
            className="rounded-full bg-support-500 hover:bg-support-600"
          >
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {chatMode === "ai" 
            ? "Your conversations are private and secure. We use AI to provide support, not medical advice." 
            : "Your conversation with medical professionals is confidential and subject to applicable healthcare privacy laws."}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
