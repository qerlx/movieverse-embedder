
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { simulateAutomationTask } from "@/lib/ai";
import { motion } from "framer-motion";
import { Loader2, Terminal, BrowserIcon, PlayIcon, CameraIcon, UserIcon } from "lucide-react";

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

interface TaskFormData {
  url: string;
  credentials: {
    username: string;
    password: string;
  };
  videoTitle?: string;
  element?: string;
}

const AIAutomation = () => {
  const [selectedTask, setSelectedTask] = useState<string>("login");
  const [responseOutput, setResponseOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<TaskFormData>({
    url: "https://moviemind-streaming.example.com",
    credentials: {
      username: "demo@example.com",
      password: "password123"
    },
    videoTitle: "Inception",
    element: "#main-player"
  });

  const updateFormData = (field: string, value: string) => {
    if (field === "username" || field === "password") {
      setFormData({
        ...formData,
        credentials: {
          ...formData.credentials,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const executeTask = async () => {
    setIsLoading(true);
    setResponseOutput("");
    
    let parameters: Record<string, string> = {
      url: formData.url
    };
    
    if (selectedTask === "login") {
      parameters = {
        ...parameters,
        username: formData.credentials.username,
        password: formData.credentials.password
      };
    } else if (selectedTask === "check_playback") {
      parameters = {
        ...parameters,
        videoTitle: formData.videoTitle || "",
        selector: formData.element || ""
      };
    } else if (selectedTask === "screenshot") {
      parameters = {
        ...parameters,
        element: formData.element || "",
        fullPage: "true"
      };
    }
    
    try {
      const result = await simulateAutomationTask(selectedTask, parameters);
      setResponseOutput(result);
    } catch (error) {
      setResponseOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getTaskIcon = () => {
    switch (selectedTask) {
      case "login": return <UserIcon className="mr-2 h-4 w-4" />;
      case "screenshot": return <CameraIcon className="mr-2 h-4 w-4" />;
      case "check_playback": return <PlayIcon className="mr-2 h-4 w-4" />;
      default: return <BrowserIcon className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      className="container max-w-6xl mx-auto py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">AI Automation Simulator</h1>
        <p className="text-muted-foreground mb-8">
          This feature demonstrates how AI could interact with browser automation in a real backend environment. 
          Note: This is a simulation - no actual browser automation is taking place.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Automation Task Configuration</CardTitle>
              <CardDescription>
                Select a task type and configure its parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="task-type">Task Type</Label>
                  <Select
                    value={selectedTask}
                    onValueChange={(value) => setSelectedTask(value)}
                  >
                    <SelectTrigger id="task-type">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="login">Login Automation</SelectItem>
                      <SelectItem value="screenshot">Take Screenshot</SelectItem>
                      <SelectItem value="check_playback">Check Video Playback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="url">Target URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => updateFormData("url", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <Tabs value={selectedTask} onValueChange={setSelectedTask}>
                  <TabsContent value="login" className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username/Email</Label>
                      <Input
                        id="username"
                        value={formData.credentials.username}
                        onChange={(e) => updateFormData("username", e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.credentials.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="screenshot" className="space-y-4">
                    <div>
                      <Label htmlFor="element">Target Element (optional)</Label>
                      <Input
                        id="element"
                        value={formData.element}
                        onChange={(e) => updateFormData("element", e.target.value)}
                        placeholder="#main-content, .hero-section, etc."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        CSS selector to capture a specific element. Leave empty for full page.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="check_playback" className="space-y-4">
                    <div>
                      <Label htmlFor="video-title">Video Title</Label>
                      <Input
                        id="video-title"
                        value={formData.videoTitle}
                        onChange={(e) => updateFormData("videoTitle", e.target.value)}
                        placeholder="Movie or Show title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-element">Player Element Selector</Label>
                      <Input
                        id="player-element"
                        value={formData.element}
                        onChange={(e) => updateFormData("element", e.target.value)}
                        placeholder="#video-player, .player-container, etc."
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={executeTask} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {getTaskIcon()}
                    Execute {selectedTask.replace('_', ' ')} Task
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Terminal className="mr-2 h-5 w-5" />
                Automation Output
              </CardTitle>
              <CardDescription>
                Results from the AI-simulated automation task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4 font-mono text-sm">
                {responseOutput ? (
                  <pre className="whitespace-pre-wrap">{responseOutput}</pre>
                ) : (
                  <div className="text-muted-foreground italic">
                    Task output will appear here after execution...
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                Simulation only - no actual browser automation is performed
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding backend browser automation with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                In a real implementation, this feature would use Puppeteer and Steel to automate browser tasks on a backend server:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">1. AI Request</h3>
                  <p className="text-sm">The AI assistant would receive a command and send it to a secure backend API endpoint</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">2. Browser Automation</h3>
                  <p className="text-sm">A Node.js server would use Puppeteer/Steel to perform the requested browser tasks</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">3. Results</h3>
                  <p className="text-sm">The results would be returned to the AI, which could take further actions or report back</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-bold mb-2">Example Implementation Code:</h3>
                <div className="bg-slate-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-xs text-gray-300">
{`const { Steel } = require("@steel/sdk");
const puppeteer = require("puppeteer");

// Setup automation task
async function runAutomationTask(taskType, params) {
  const steel = new Steel({
    apiKey: process.env.STEEL_API_KEY
  });

  // Create session
  const session = await steel.sessions.create({ browser: "chrome" });
  const browser = await puppeteer.connect({
    browserWSEndpoint: session.wsEndpoint,
  });

  try {
    const page = await browser.newPage();
    await page.goto(params.url);
    
    // Execute task based on type
    if (taskType === "login") {
      // Perform login operations...
    } else if (taskType === "screenshot") {
      // Take and save screenshot...
    } else if (taskType === "check_playback") {
      // Check video playback state...
    }
    
    return { success: true, results: {} };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await browser.close();
    await steel.sessions.delete(session.id);
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AIAutomation;
