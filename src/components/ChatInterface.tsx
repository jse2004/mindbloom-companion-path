
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

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai" | "doctor";
  timestamp: Date;
};

const ChatInterface = () => {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Check for specific keywords to switch to expert
    const expertKeywords = ["speak to doctor", "talk to expert", "need professional", "speak with doctor", "human expert", "medical professional"];
    const containsExpertRequest = expertKeywords.some(keyword => 
      inputMessage.toLowerCase().includes(keyword)
    );

    if (chatMode === "expert" || containsExpertRequest) {
      if (!isAwaitingExpert) {
        setChatMode("expert");
        setIsAwaitingExpert(true);
        
        // Simulate doctor response after a slight delay
        setTimeout(() => {
          const doctorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "Thank you for reaching out. A medical professional has been notified and will join this conversation shortly. While you wait, can you please provide more details about your concern?",
            sender: "doctor",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, doctorMessage]);
        }, 1500);
      }
    } else {
      // Generate AI response based on message analysis
      setTimeout(() => {
        const processedMessage = inputMessage.toLowerCase();
        
        // Detect emotion/condition patterns
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
        
        // Generate appropriate response based on detected conditions
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

        // Select response based on detected type
        const responsesForType = aiResponses[responseType];
        const randomResponse = responsesForType[Math.floor(Math.random() * responsesForType.length)];

        // If user asks for assessment, suggest taking one
        if (processedMessage.includes("assess") || processedMessage.includes("evaluate") || 
            processedMessage.includes("test") || processedMessage.includes("questionnaire")) {
          const assessmentMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "If you'd like a more thorough assessment of your mental health, I'd recommend taking our comprehensive assessment. Would you like me to guide you to our assessment page?",
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assessmentMessage]);
        } else {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: randomResponse,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
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
    
    // Add system message about the expert request
    const systemMessage: Message = {
      id: Date.now().toString(),
      content: `Your request to speak with a medical professional has been submitted. Reason: ${data.reason}. Urgency: ${data.urgency}. A doctor will connect with you shortly.`,
      sender: "doctor",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, systemMessage]);
    toast({
      title: "Expert Request Submitted",
      description: "A medical professional will connect with you shortly.",
    });
  };

  const switchToAssessment = () => {
    navigate("/assessment");
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

      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
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
