import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SendHorizonal, UserRound, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Message = {
  id: string;
  content: string;
  sender: "user" | "admin";
  timestamp: Date;
};

type ExpertChatSession = {
  id: string;
  user_id: string;
  admin_id: string | null;
  status: "pending" | "active" | "completed";
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_request_reason: string | null;
  urgency: "low" | "normal" | "high" | "urgent";
  user_profile?: {
    first_name: string;
    last_name: string;
  };
};

const AdminChatInterface = () => {
  const { user, isAdmin } = useAuthContext();
  const [chatSessions, setChatSessions] = useState<ExpertChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ExpertChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isAdmin) {
      loadChatSessions();
      setupRealtimeSubscription();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatSessions = async () => {
    if (!user || !isAdmin) return;

    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('expert_chat_sessions')
        .select(`
          id,
          user_id,
          admin_id,
          status,
          messages,
          created_at,
          updated_at,
          user_request_reason,
          urgency
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles separately
      const userIds = (data || []).map(session => session.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      const profileMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      const formattedSessions: ExpertChatSession[] = (data || []).map(session => ({
        ...session,
        status: session.status as "pending" | "active" | "completed",
        urgency: session.urgency as "low" | "normal" | "high" | "urgent",
        messages: Array.isArray(session.messages) 
          ? session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          : [],
        user_profile: profileMap[session.user_id]
      }));

      setChatSessions(formattedSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast.error("Failed to load chat sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('expert_chat_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expert_chat_sessions'
        },
        () => {
          loadChatSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSession || !user || sendingMessage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "admin",
      timestamp: new Date(),
    };

    setSendingMessage(true);
    try {
      const updatedMessages = [...selectedSession.messages, newMessage];
      
      const { error } = await supabase
        .from('expert_chat_sessions')
        .update({
          messages: updatedMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          status: 'active',
          admin_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSession.id);

      if (error) throw error;

      setInputMessage("");
      
      // Update local state
      setSelectedSession(prev => prev ? {
        ...prev,
        messages: updatedMessages,
        status: 'active',
        admin_id: user.id
      } : null);

      setChatSessions(prev => prev.map(session => 
        session.id === selectedSession.id 
          ? { ...session, messages: updatedMessages, status: 'active' as const, admin_id: user.id }
          : session
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const acceptChatSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expert_chat_sessions')
        .update({
          status: 'active',
          admin_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success("Chat session accepted");
      loadChatSessions();
    } catch (error) {
      console.error('Error accepting chat session:', error);
      toast.error("Failed to accept chat session");
    }
  };

  const completeChatSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('expert_chat_sessions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success("Chat session completed");
      setSelectedSession(null);
      loadChatSessions();
    } catch (error) {
      console.error('Error completing chat session:', error);
      toast.error("Failed to complete chat session");
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="p-8 text-center">
        <p>Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
      {/* Sessions List */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Expert Chat Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loadingSessions ? (
              <div className="p-4 text-center text-gray-500">Loading sessions...</div>
            ) : chatSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No chat sessions yet</div>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedSession?.id === session.id && "bg-blue-50 border-l-4 border-l-blue-500"
                  )}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {session.user_profile?.first_name} {session.user_profile?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getUrgencyColor(session.urgency)}`}></div>
                      <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {session.user_request_reason && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {session.user_request_reason}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(session.created_at).toLocaleDateString()} at{' '}
                    {new Date(session.created_at).toLocaleTimeString()}
                  </div>

                  {session.status === 'pending' && (
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptChatSession(session.id);
                      }}
                    >
                      Accept Chat
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="col-span-2">
        {selectedSession ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5" />
                    Chat with {selectedSession.user_profile?.first_name} {selectedSession.user_profile?.last_name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Urgency: <Badge className={`text-xs ${getUrgencyColor(selectedSession.urgency)} text-white`}>
                      {selectedSession.urgency}
                    </Badge>
                  </p>
                </div>
                {selectedSession.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => completeChatSession(selectedSession.id)}
                  >
                    Complete Session
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex flex-col h-[500px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedSession.user_request_reason && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">Initial Request:</p>
                    <p className="text-sm text-blue-700">{selectedSession.user_request_reason}</p>
                  </div>
                )}
                
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === "admin" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                        message.sender === "admin"
                          ? "bg-blue-500 text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                      )}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                      <span className={cn(
                        "text-xs mt-1 block",
                        message.sender === "admin" ? "text-blue-100" : "text-gray-500"
                      )}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedSession.status !== 'completed' && (
                <div className="border-t p-4 bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response..."
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || sendingMessage}
                      size="icon"
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Chat Session</h3>
              <p className="text-gray-500">Choose a session from the list to start chatting with users</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminChatInterface;