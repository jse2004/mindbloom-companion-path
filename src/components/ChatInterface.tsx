
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, UserRound, Trash2 } from "lucide-react"; // Added Trash2
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs components

// Base message type
type Message = {
  id: string;
  content: string;
  sender: "user" | "ai" | "doctor";
  timestamp: Date;
};

// Type for AI chat sessions (stored in 'chat_sessions' table)
type AiChatSession = {
  id: string;
  title: string;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

// Type for Expert chat sessions (stored in 'expert_chat_sessions' table)
type ExpertChatSession = {
  id: string;
  user_id: string;
  admin_id: string | null;
  status: 'pending' | 'active' | 'completed';
  messages: Message[];
  created_at: string;
  updated_at: string;
};


// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // Now solely relies on environment variable
const OPENAI_CHAT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const NLP_ADVICE_CLOUD_FUNCTION_URL = import.meta.env.VITE_NLP_ADVICE_CLOUD_FUNCTION_URL;

const ChatInterface = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const expertChatChannel = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();

  // State for AI chat
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Hello! I'm your mental health assistant. How are you feeling today?", sender: "ai", timestamp: new Date() },
  ]);
  const [aiChatHistory, setAiChatHistory] = useState<AiChatSession[]>([]);
  const [currentAiChatId, setCurrentAiChatId] = useState<string | null>(null);

  // State for Expert chat
  const [expertChatSession, setExpertChatSession] = useState<ExpertChatSession | null>(null);
  const [expertChatHistory, setExpertChatHistory] = useState<ExpertChatSession[]>([]); // New state for expert chat history

  // General state
  const [inputMessage, setInputMessage] = useState("");
  const [chatMode, setChatMode] = useState<"ai" | "expert">("ai");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); // Kept for future use, not directly related to this task

  const expertRequestForm = useForm({
    defaultValues: { reason: "", urgency: "low" }
  });

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, expertChatSession?.messages]);

  // Initial data loading and session check effect
  useEffect(() => {
    if (user) {
      loadAiChatHistory();
      loadExpertChatHistory(); // Load expert chat history as well
      // checkNotificationStatus(); // Not relevant for this task
      checkForActiveExpertSession();
    }
    // Cleanup subscription on component unmount
    return () => {
      if (expertChatChannel.current) {
        supabase.removeChannel(expertChatChannel.current);
      }
    };
  }, [user]);

  // Real-time subscription effect for expert chat
  useEffect(() => {
    if (expertChatSession?.id) {
      // Unsubscribe from previous channel if it exists
      if (expertChatChannel.current) {
        supabase.removeChannel(expertChatChannel.current);
      }

      const channel = supabase
        .channel(`expert_chat:${expertChatSession.id}`)
        .on<ExpertChatSession>(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'expert_chat_sessions', filter: `id=eq.${expertChatSession.id}` },
          (payload) => {
            const updatedSession = payload.new;
            // Ensure messages are converted correctly
            const rawMessages = Array.isArray(updatedSession.messages) ? updatedSession.messages : [];
            const convertedMessages = rawMessages.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp)
            }));
            setExpertChatSession({ ...updatedSession, messages: convertedMessages } as ExpertChatSession);
            
            if (updatedSession.status === 'active' && expertChatSession.status === 'pending') {
              toast({ title: "A medical professional has joined the chat." });
            } else if (updatedSession.status === 'completed') { // Handle completion
              toast({ title: "Chat ended", description: "This expert chat session has been completed." });
              setExpertChatSession(null); // Clear the active session
              setChatMode('ai'); // Switch back to AI mode
              loadExpertChatHistory(); // Reload history to include the just completed session
            }
          }
        )
        .subscribe();
      
      expertChatChannel.current = channel;
    }
    // Cleanup function for this specific effect
    return () => {
      if (expertChatChannel.current) {
        supabase.removeChannel(expertChatChannel.current);
        expertChatChannel.current = null; // Clear the ref
      }
    };
  }, [expertChatSession?.id, user]);

  const checkForActiveExpertSession = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('expert_chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const rawMessages = Array.isArray(data.messages) ? data.messages : [];
      const convertedMessages = rawMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp)
      }));
      setExpertChatSession({ ...data, messages: convertedMessages } as ExpertChatSession);
      setChatMode('expert');
    }
    if (error && error.code !== 'PGRST116') { // Ignore 'PGRST116' (No rows found)
      console.error("Error checking for active expert session:", error);
    }
  };

  const loadAiChatHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data, error } = await supabase.from('chat_sessions').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Failed to load AI chat history.", variant: "destructive" });
    } else {
      setAiChatHistory(data.map(s => {
        const rawMessages = Array.isArray(s.messages) ? s.messages : [];
        const convertedMessages = rawMessages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp)
        }));
        return { ...s, messages: convertedMessages };
      }));
    }
    // Only set loadingHistory to false once both AI and Expert histories are loaded
    // For now, it's fine as they are called in sequence, but could be improved with separate loading states.
    // setLoadingHistory(false);
  };
  
  const loadExpertChatHistory = async () => {
    if (!user) return;
    setLoadingHistory(true); // Re-using for simplicity, could be separate
    const { data, error } = await supabase
      .from('expert_chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed') // Only load completed sessions for history
      .order('updated_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load expert chat history.", variant: "destructive" });
    } else {
      setExpertChatHistory(data.map(s => {
        const rawMessages = Array.isArray(s.messages) ? s.messages : [];
        const convertedMessages = rawMessages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp)
        }));
        return { 
          ...s, 
          messages: convertedMessages,
          status: s.status as 'pending' | 'active' | 'completed'
        };
      }));
    }
    setLoadingHistory(false);
  };

  const saveAiChatSession = async (currentMessages: Message[]) => {
    if (!user || currentMessages.length <= 1) return;

    const lastUserMessage = currentMessages.filter(m => m.sender === 'user').pop();
    const title = lastUserMessage?.content.substring(0, 50) || 'New conversation';
    const dbMessages = currentMessages.map(msg => ({ ...msg, timestamp: msg.timestamp.toISOString() }));

    if (currentAiChatId) {
      await supabase.from('chat_sessions').update({ title, messages: dbMessages, last_message: lastUserMessage?.content || '', updated_at: new Date().toISOString() }).eq('id', currentAiChatId);
    } else {
      const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title, messages: dbMessages, last_message: lastUserMessage?.content || '' }).select().single();
      if (data) setCurrentAiChatId(data.id);
    }
    loadAiChatHistory();
  };

  const handleDeleteExpertSession = async (sessionId: string) => {
      if (!user) {
          toast({ title: "Error", description: "You must be logged in to delete chat sessions.", variant: "destructive" });
          return;
      }

      if (!window.confirm("Are you sure you want to delete this expert chat session? This action cannot be undone.")) {
          return;
      }

      try {
          const { error } = await supabase
              .from('expert_chat_sessions')
              .delete()
              .eq('id', sessionId)
              .eq('user_id', user.id); // Ensure only the user who owns the session can delete it

          if (error) throw error;

          toast({ title: "Success", description: "Chat session deleted successfully." });

          // If the deleted session was the active one, clear it
          if (expertChatSession?.id === sessionId) {
              setExpertChatSession(null);
              setChatMode('ai'); // Switch back to AI mode
          }

          // Reload the expert chat history to reflect the deletion
          loadExpertChatHistory();

      } catch (error) {
          console.error('Error deleting expert chat session:', error);
          toast({ title: "Error", description: "Failed to delete chat session.", variant: "destructive" });
      }
  };

  const handleDeleteAiSession = async (sessionId: string) => {
      if (!user) {
          toast({ title: "Error", description: "You must be logged in to delete chat sessions.", variant: "destructive" });
          return;
      }

      if (!window.confirm("Are you sure you want to delete this AI chat session? This action cannot be undone.")) {
          return;
      }

      try {
          const { error } = await supabase
              .from('chat_sessions')
              .delete()
              .eq('id', sessionId)
              .eq('user_id', user.id); // Ensure only the user who owns the session can delete it

          if (error) throw error;

          toast({ title: "Success", description: "AI chat session deleted successfully." });

          // If the deleted session was the active one, clear it
          if (currentAiChatId === sessionId) {
              startNewChat();
          }

          // Reload the AI chat history to reflect the deletion
          loadAiChatHistory();

      } catch (error) {
          console.error('Error deleting AI chat session:', error);
          toast({ title: "Error", description: "Failed to delete chat session.", variant: "destructive" });
      }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = { id: Date.now().toString(), content: inputMessage, sender: "user", timestamp: new Date() };
    setInputMessage("");

    if (chatMode === "expert" && expertChatSession) {
      const updatedMessages = [...expertChatSession.messages, newMessage];
      setExpertChatSession({ ...expertChatSession, messages: updatedMessages });
      
      const { error } = await supabase
        .from('expert_chat_sessions')
        .update({ messages: updatedMessages.map(msg => ({ ...msg, timestamp: msg.timestamp.toISOString() })) })
        .eq('id', expertChatSession.id);
      
      if (error) {
        toast({ title: "Error sending message", description: error.message, variant: "destructive" });
        // Revert optimistic update on error
        setExpertChatSession(expertChatSession);
      }
    } else {
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setIsTyping(true);

      try {
        if (!OPENAI_API_KEY) {
          throw new Error("OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY environment variable.");
        }
        if (!NLP_ADVICE_CLOUD_FUNCTION_URL) {
          throw new Error("NLP Advice Cloud Function URL is not configured. Please set VITE_NLP_ADVICE_CLOUD_FUNCTION_URL environment variable.");
        }

        // Step 1: Get conversational response from OpenAI
        const openAIMessages = [
          { role: "system", content: "You are a helpful mental health assistant. Provide supportive and empathetic responses." },
          ...messages.slice(1).map(msg => ({ role: msg.sender === "user" ? "user" : "assistant", content: msg.content })),
          { role: "user", content: newMessage.content }
        ];

        const openAIResponse = await fetch(OPENAI_CHAT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // or "gpt-4" if you have access
            messages: openAIMessages,
            max_tokens: 150,
          }),
        });

        if (!openAIResponse.ok) {
          const errorText = await openAIResponse.text();
          throw new Error(`OpenAI HTTP error! status: ${openAIResponse.status}, response: ${errorText}`);
        }
        
        const openAIData = await openAIResponse.json();
        let aiResponseContent = openAIData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        // Step 2: Get sentiment analysis and advice from the NLP function
        const nlpResponse = await fetch(NLP_ADVICE_CLOUD_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage.content }),
        });

        if (!nlpResponse.ok) {
          const errorText = await nlpResponse.text();
          throw new Error(`NLP HTTP error! status: ${nlpResponse.status}, response: ${errorText}`);
        }
        
        const nlpData = await nlpResponse.json();
        
        // Append advice if available and relevant (e.g., strong sentiment)
        if (nlpData.advice && (nlpData.sentiment < -0.3 || nlpData.sentiment > 0.3)) {
          aiResponseContent += `

<span style="font-size: 0.9em; color: gray;">AI Insight: ${nlpData.advice}</span>`;
        }
        
        const aiMessage: Message = { id: (Date.now() + 1).toString(), content: aiResponseContent, sender: "ai", timestamp: new Date() };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        saveAiChatSession(finalMessages);
      } catch (error) {
        console.error('Error with OpenAI or NLP Cloud Function:', error);
        // Display a more informative error to the user if possible
        if (error instanceof Error) {
          toast({ title: "AI Error", description: `Failed to get a response: ${error.message}. Please try again.`, variant: "destructive" });
        } else {
          toast({ title: "AI Error", description: "Failed to get a response from the AI. Please try again.", variant: "destructive" });
        }
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleRequestExpert = async (data: any) => {
    if (!user) return;

    const initialMessageContent = `Your request to speak with a medical professional has been submitted. Reason: ${data.reason}. Urgency: ${data.urgency}. A doctor will connect with you shortly.`;
    const initialMessage: Message = { id: Date.now().toString(), content: initialMessageContent, sender: "doctor", timestamp: new Date() };

    try {
      const { data: newExpertSession, error } = await supabase
        .from('expert_chat_sessions')
        .insert({
          user_id: user.id,
          user_request_reason: data.reason,
          urgency: data.urgency,
          status: 'pending',
          messages: [{ ...initialMessage, timestamp: initialMessage.timestamp.toISOString() }]
        })
        .select()
        .single();

      if (error) throw error;
      
      const rawMessages = Array.isArray(newExpertSession.messages) ? newExpertSession.messages : [];
      const convertedMessages = rawMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp)
      }));
      setExpertChatSession({ ...newExpertSession, messages: convertedMessages } as ExpertChatSession);
      setChatMode("expert");
      toast({ title: "Expert Request Submitted" });
    } catch (error) {
      console.error('Error creating expert chat session:', error);
      toast({ title: "Error", description: "Failed to submit expert request.", variant: "destructive" });
    }
  };

  const startNewChat = () => {
    setMessages([{ id: "new", content: "Hello! I'm your AI assistant. How can I help?", sender: "ai", timestamp: new Date() }]);
    setCurrentAiChatId(null);
    setExpertChatSession(null); // Clear expert session
    setChatMode("ai");
  };

  const loadAiChatSession = (session: AiChatSession) => {
    setMessages(session.messages);
    setCurrentAiChatId(session.id);
    setChatMode('ai');
    setExpertChatSession(null); // Ensure expert chat is cleared when loading AI chat
  };

  const loadExpertChatTranscript = (session: ExpertChatSession) => {
    setExpertChatSession(session);
    setChatMode('expert');
    setMessages([]); // Clear AI messages when loading expert chat
  };

  // const checkNotificationStatus = async () => { /* ... implementation from before ... */ };
  // const toggleNotifications = async () => { /* ... implementation from before ... */ };
  // const handleCrisisSupport = () => { /* ... implementation from before ... */ };

  const displayedMessages = chatMode === 'expert' ? expertChatSession?.messages || [] : messages;

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-xl shadow-lg border">
      <div className="p-6 border-b bg-gradient-to-r from-mind-50 to-support-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl text-gray-800">Mental Health Assistant</h2>
            <p className="text-sm text-gray-600 mt-1">
              {chatMode === "ai" ? "AI-powered support available 24/7" : "Medical Professional Support"}
              {chatMode === "expert" && expertChatSession?.status === "pending" && " (Waiting for an expert...)"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startNewChat}>New Chat</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {displayedMessages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                  message.sender === "user" ? "bg-support-500 text-white rounded-tr-none"
                    : message.sender === "doctor" ? "bg-mind-100 text-gray-800 rounded-tl-none border border-mind-200"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                )}>
                {message.sender === "doctor" && (
                  <div className="font-medium text-mind-700 text-xs mb-1 flex items-center gap-1">
                    <UserRound className="h-3 w-3" /> Medical Professional
                  </div>
                )}
                <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: message.content }}></p>
                <span className={cn("text-xs mt-2 block", message.sender === "user" ? "text-support-100" : "text-gray-500")}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && chatMode === "ai" && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">AI is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-white p-6 overflow-y-auto flex flex-col gap-4">
           {/* Dialog for handleRequestExpert */}
          <Dialog>
             <DialogTrigger asChild>
               <Button variant="outline" className="w-full justify-start"><UserRound className="mr-3 h-4 w-4" /> Speak with Expert</Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader><DialogTitle>Request Medical Professional</DialogTitle></DialogHeader>
               <Form {...expertRequestForm}>
                 <form onSubmit={expertRequestForm.handleSubmit(handleRequestExpert)} className="space-y-4">
                   <FormField control={expertRequestForm.control} name="reason" render={({ field }) => (
                     <FormItem>
                       <FormLabel>Reason for consultation</FormLabel>
                       <FormControl><Textarea placeholder="Briefly describe your concern" {...field} /></FormControl>
                     </FormItem>
                   )}/>
                   <FormField
                      control={expertRequestForm.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Urgency</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="low" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Low
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="medium" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Medium
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="high" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  High
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <DialogFooter><Button type="submit">Submit Request</Button></DialogFooter>
                 </form>
               </Form>
             </DialogContent>
           </Dialog>

           {/* Chat History Tabs */}
           <div className="mt-6 flex-1 flex flex-col">
             <h3 className="text-lg font-semibold mb-3">Chat History</h3>
             <Tabs defaultValue="ai-history" className="flex flex-col flex-1">
               <TabsList className="grid w-full grid-cols-2">
                 <TabsTrigger value="ai-history">AI Chat</TabsTrigger>
                 <TabsTrigger value="expert-history">Expert Chat</TabsTrigger>
               </TabsList>
               <TabsContent value="ai-history" className="mt-4 flex-1 overflow-y-auto pr-2">
                 {loadingHistory ? (
                   <p className="text-gray-500 text-sm">Loading AI chat history...</p>
                 ) : aiChatHistory.length === 0 ? (
                   <p className="text-gray-500 text-sm">No AI chat history found.</p>
                 ) : (
                    <div className="space-y-2">
                      {aiChatHistory.map((session) => (
                        <div key={session.id} className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="flex-1 justify-start h-auto p-2 text-wrap break-words whitespace-normal"
                            onClick={() => loadAiChatSession(session)}
                          >
                            <div className="flex flex-col items-start w-full">
                              <span className="truncate">{session.title}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(session.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAiSession(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                 )}
               </TabsContent>
               <TabsContent value="expert-history" className="mt-4 flex-1 overflow-y-auto pr-2">
                 {loadingHistory ? (
                   <p className="text-gray-500 text-sm">Loading expert chat history...</p>
                 ) : expertChatHistory.length === 0 ? (
                   <p className="text-gray-500 text-sm">No expert chat history found.</p>
                 ) : (
                    <div className="space-y-2">
                      {expertChatHistory.map((session) => (
                        <div key={session.id} className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="flex-1 justify-start h-auto p-2 text-wrap break-words whitespace-normal"
                            onClick={() => loadExpertChatTranscript(session)}
                          >
                            <div className="flex flex-col items-start w-full">
                              <span className="truncate">
                                Expert Chat - {session.status}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExpertSession(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                   </div>
                 )}
               </TabsContent>
             </Tabs>
           </div>
        </div>
      </div>

      <div className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex items-center space-x-3">
          <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type your message..." />
          <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}><SendHorizonal className="h-4 w-4" /></Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {chatMode === "ai" ? "Conversations are private and secure. This is not medical advice." : "Your conversation is confidential and HIPAA compliant."}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
