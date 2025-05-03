
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { simulateAutomationTask } from "@/lib/ai";
import { motion } from "framer-motion";
import { Loader2, Terminal, Monitor, Play, Camera, User } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren", 
      staggerChildren: 0.1 
    } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const AIAutomation = () => {
  const [url, setUrl] = useState("https://moviestreamhub.com");
  const [taskType, setTaskType] = useState("screenshot");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<null | {
    success: boolean;
    message: string;
    data?: any;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    
    try {
      // Simulate an automation task using our API
      const response = await simulateAutomationTask(url, taskType);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while processing your request."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskIcon = () => {
    switch(taskType) {
      case "login": return <User className="mr-2 h-4 w-4" />;
      case "playback": return <Play className="mr-2 h-4 w-4" />;
      case "screenshot": return <Camera className="mr-2 h-4 w-4" />;
      default: return <Terminal className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle className="text-gradient">AI Automation Testing</CardTitle>
            <CardDescription>
              Test browser automation for the streaming platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="bg-black/20 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <div className="flex flex-wrap gap-2">
                  {["login", "screenshot", "playback"].map((task) => (
                    <Button
                      key={task}
                      type="button"
                      variant={taskType === task ? "default" : "outline"}
                      className="capitalize"
                      onClick={() => setTaskType(task)}
                    >
                      {task === "login" && <User className="mr-2 h-4 w-4" />}
                      {task === "screenshot" && <Camera className="mr-2 h-4 w-4" />}
                      {task === "playback" && <Play className="mr-2 h-4 w-4" />}
                      {task}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {getTaskIcon()}
                    Run {taskType} Task
                  </>
                )}
              </Button>
            </form>

            {result && (
              <motion.div 
                className="mt-6 p-4 rounded-lg bg-black/30 border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                  <span className="text-sm">{result.message}</span>
                </div>
                
                {result.data && (
                  <div className="mt-4">
                    <pre className="p-3 bg-black/50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            <Monitor className="mr-2 h-4 w-4" /> 
            This is a simulated environment. No actual browser automation is performed.
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AIAutomation;
