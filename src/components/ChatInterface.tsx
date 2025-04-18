
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your mental health assistant. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      const aiResponses = [
        "I understand how you feel. Would you like to talk more about what's causing these emotions?",
        "That sounds challenging. Have you tried any coping strategies?",
        "I'm here to support you. Would it help to explore some relaxation techniques?",
        "Thank you for sharing that with me. How long have you been feeling this way?",
        "I'm listening. Sometimes expressing our feelings is the first step toward feeling better.",
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] bg-white rounded-xl shadow-sm border">
      {/* Chat header */}
      <div className="p-4 border-b">
        <h2 className="font-medium text-lg">Mental Health Assistant</h2>
        <p className="text-sm text-gray-500">
          AI-powered support available 24/7
        </p>
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
                  : "bg-gray-100 text-gray-800 rounded-tl-none"
              )}
            >
              <p>{message.content}</p>
              <span
                className={cn(
                  "text-xs mt-1 block",
                  message.sender === "user" ? "text-support-100" : "text-gray-500"
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
            placeholder="Type a message..."
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
          Your conversations are private and secure. We use AI to provide support, not medical advice.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
