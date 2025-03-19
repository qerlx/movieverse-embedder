
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bot, Send, BotMessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Sample responses for the AI buddy
const aiResponses = {
  "help": "I can help you discover movies and TV shows! Ask me for recommendations, information about actors, or details about specific titles.",
  "movie recommendations": "Based on popular trends, I recommend checking out these movies: \n\n1. Dune: Part Two\n2. Poor Things\n3. Oppenheimer\n4. The Holdovers\n5. Anyone But You",
  "tv recommendations": "Here are some TV shows you might enjoy: \n\n1. The Last of Us\n2. Shogun\n3. The Bear\n4. Slow Horses\n5. Mr. & Mrs. Smith",
  "action movies": "Here are some great action movies to check out: \n\n1. John Wick series\n2. Mad Max: Fury Road\n3. Mission: Impossible series\n4. The Raid\n5. Top Gun: Maverick",
  "comedy shows": "Looking for a good laugh? Try these comedy shows: \n\n1. Ted Lasso\n2. What We Do in the Shadows\n3. The Good Place\n4. Schitt's Creek\n5. Abbott Elementary",
  "default": "I'm your MovieStreamHub AI assistant! I can help you discover new content, learn about movies and TV shows, or find something based on your preferences. What would you like to know?"
};

const sampleQuestions = [
  "What can you help me with?",
  "Recommend some movies for me",
  "What are good TV shows to watch?",
  "Suggest some action movies",
  "Recommend comedy shows"
];

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIBuddy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const { currentUser } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Initialize chat with a welcome message
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        content: "Hi there! I'm your MovieStreamHub assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!currentMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    
    // Generate AI response with a small delay to simulate thinking
    setTimeout(() => {
      let responseContent = aiResponses.default;
      
      // Check for keywords in the message
      const lowerCaseMessage = currentMessage.toLowerCase();
      if (lowerCaseMessage.includes("help")) {
        responseContent = aiResponses.help;
      } else if (lowerCaseMessage.includes("movie") && lowerCaseMessage.includes("recommend")) {
        responseContent = aiResponses.movie;
      } else if (lowerCaseMessage.includes("tv") && lowerCaseMessage.includes("recommend")) {
        responseContent = aiResponses.tv;
      } else if (lowerCaseMessage.includes("action")) {
        responseContent = aiResponses.action;
      } else if (lowerCaseMessage.includes("comedy")) {
        responseContent = aiResponses.comedy;
      }
      
      const aiMessage = {
        id: Date.now().toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleQuestionClick = (question: string) => {
    setCurrentMessage(question);
    handleSendMessage();
  };

  return (
    <div>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="mb-6 gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
      >
        <BotMessageSquare className="h-5 w-5" />
        <span>Chat with Movie AI Buddy</span>
      </Button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>Movie AI Buddy</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {!message.isUser && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`p-3 rounded-lg ${
                      message.isUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.isUser && currentUser && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.displayName || "User"} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {messages.length === 1 && (
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((question, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuestionClick(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask about movies or shows..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AIBuddy;
