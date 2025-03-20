
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bot, Send, BotMessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { processAIQuery, ChatMessage } from "@/utils/aiService";

const sampleQuestions = [
  "What can you help me with?",
  "Recommend some action movies for me",
  "What are good comedy TV shows to watch?",
  "Tell me about Christopher Nolan",
  "Explain the sci-fi genre"
];

const AIBuddy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        content: "Hi there! I'm your MovieStreamHub AI assistant. I can recommend movies and TV shows, tell you about actors, directors, and genres. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!currentMessage.trim() || isProcessing) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsProcessing(true);
    
    try {
      // Process with AI
      const aiResponse = await processAIQuery(userMessage.content, messages);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in AI processing:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setCurrentMessage(question);
    // Use setTimeout to ensure the state is updated before sending
    setTimeout(() => {
      handleSendMessage();
    }, 50);
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
                disabled={isProcessing}
              />
              <Button type="submit" size="icon" disabled={isProcessing || !currentMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isProcessing && (
              <p className="text-xs text-muted-foreground mt-2">Processing your request...</p>
            )}
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AIBuddy;
