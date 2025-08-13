/**
 * Lupin Chat Component - GitHub-integrated chat interface with SDE2+ mode
 */

'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Github, 
  Code, 
  MessageSquare, 
  Settings, 
  Plus, 
  Send, 
  GitBranch,
  GitPullRequest,
  FileCode,
  Bug,
  Zap,
  Brain,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { getChatSessionManager, ChatSession, ChatMessage } from '@/lib/chat-session-manager';
import { getGitHubService } from '@/lib/github-service';

interface LupinChatProps {
  className?: string;
}

export default function LupinChat({ className }: LupinChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionManager = getChatSessionManager();
  const { toast } = useToast();

  // Load sessions and active session
  useEffect(() => {
    const loadedSessions = sessionManager.getAllSessions();
    setSessions(loadedSessions);
    
    const active = sessionManager.getActiveSession();
    if (active) {
      setActiveSession(active);
    } else if (loadedSessions.length > 0) {
      sessionManager.setActiveSession(loadedSessions[0].id);
      setActiveSession(loadedSessions[0]);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const createNewSession = () => {
    const newSession = sessionManager.createSession();
    setSessions(sessionManager.getAllSessions());
    setActiveSession(newSession);
    toast({
      title: "New Chat Session",
      description: `Created "${newSession.name}"`,
    });
  };

  const switchSession = (sessionId: string) => {
    sessionManager.setActiveSession(sessionId);
    const session = sessionManager.getSession(sessionId);
    setActiveSession(session);
    setSessions(sessionManager.getAllSessions());
  };

  const deleteSession = (sessionId: string) => {
    sessionManager.deleteSession(sessionId);
    const updatedSessions = sessionManager.getAllSessions();
    setSessions(updatedSessions);
    
    if (activeSession?.id === sessionId) {
      const newActive = updatedSessions.length > 0 ? updatedSessions[0] : null;
      if (newActive) {
        sessionManager.setActiveSession(newActive.id);
        setActiveSession(newActive);
      } else {
        setActiveSession(null);
      }
    }
    
    toast({
      title: "Session Deleted",
      description: "Chat session has been removed",
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeSession || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Add user message
      sessionManager.addMessage(activeSession.id, {
        role: 'user',
        content: userMessage,
      });

      // Process GitHub commands
      const githubCommandResult = await processGitHubCommand(userMessage, activeSession);
      
      // Generate AI response
      let aiResponse = await generateAIResponse(userMessage, activeSession, githubCommandResult);

      // Add AI response
      sessionManager.addMessage(activeSession.id, {
        role: 'assistant',
        content: aiResponse,
        metadata: githubCommandResult ? { github: githubCommandResult } : undefined,
      });

      // Refresh session data
      const updatedSession = sessionManager.getSession(activeSession.id);
      setActiveSession(updatedSession);
      setSessions(sessionManager.getAllSessions());

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processGitHubCommand = async (message: string, session: ChatSession): Promise<any> => {
    if (!session.settings.githubIntegration || !githubToken) return null;

    try {
      // Use AI API to detect GitHub commands
      const response = await fetch('/api/ai/commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          githubToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process command');
      }

      const { commandInfo } = await response.json();
      
      if (!commandInfo.isCommand) return null;
      if (commandInfo.requiresToken && !githubToken) {
        return {
          action: 'error',
          result: { error: 'GitHub token is required for this operation' },
        };
      }

      const github = getGitHubService(githubToken);

      switch (commandInfo.action) {
        case 'list_repositories':
          const repos = await github.listRepositories();
          return {
            action: 'list_repositories',
            result: repos,
          };

        case 'fork_repository':
          if (!commandInfo.parameters) return null;
          const { owner, repo } = commandInfo.parameters;
          const forkedRepo = await github.forkRepository(owner, repo);
          return {
            action: 'fork_repository',
            result: forkedRepo,
          };

        case 'create_issue':
          if (!commandInfo.parameters || !session.githubContext.currentRepository) {
            return {
              action: 'error',
              result: { error: 'Please set a current repository first' },
            };
          }
          const { title, body } = commandInfo.parameters;
          const { owner: issueOwner, repo: issueRepo } = session.githubContext.currentRepository;
          const issue = await github.createIssue(issueOwner, issueRepo, title, body);
          return {
            action: 'create_issue',
            result: issue,
          };

        default:
          return null;
      }
    } catch (error: any) {
      console.error('GitHub command error:', error);
      return {
        action: 'error',
        result: { error: error.message },
      };
    }
  };

  const generateAIResponse = async (
    message: string,
    session: ChatSession,
    githubResult?: any
  ): Promise<string> => {
    try {
      const aiContext = {
        githubContext: {
          currentRepo: session.githubContext.currentRepository 
            ? `${session.githubContext.currentRepository.owner}/${session.githubContext.currentRepository.repo}`
            : undefined,
          recentActions: githubResult ? [githubResult] : [],
        },
        sdeContext: {
          mode: session.sdeContext.mode,
          activeFiles: session.sdeContext.activeFiles,
        },
        sessionHistory: session.messages,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: aiContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const { response: aiResponse } = await response.json();
      return aiResponse;
    } catch (error) {
      console.error('AI service error:', error);
      
      // Fallback response logic
      let response = "I'm Lupin, your GitHub-integrated coding assistant. ";

      if (githubResult) {
        switch (githubResult.action) {
          case 'list_repositories':
            response += `I found ${githubResult.result.length} repositories in your account. `;
            if (githubResult.result.length > 0) {
              const topRepos = githubResult.result.slice(0, 3);
              response += `Here are your most recently updated repositories:\n\n`;
              topRepos.forEach((repo: any) => {
                response += `• **${repo.name}** - ${repo.description || 'No description'}\n`;
              });
            }
            break;
          
          case 'fork_repository':
            response += `Successfully forked the repository! Your fork is available at: ${githubResult.result.html_url}`;
            break;
          
          case 'create_issue':
            response += `Created issue #${githubResult.result.number}: "${githubResult.result.title}". You can view it at: ${githubResult.result.html_url}`;
            break;
          
          case 'error':
            response += `I encountered an error with the GitHub operation: ${githubResult.result.error}`;
            break;
          
          default:
            response += "I processed your GitHub command. ";
        }
      } else {
        response += `How can I help you with coding or GitHub today?`;
      }

      // Add SDE2+ mode context
      if (session.sdeContext.mode !== 'basic') {
        response += `\n\n🧠 **SDE2+ ${session.sdeContext.mode.toUpperCase()} Mode Active**\n`;
        if (session.sdeContext.activeFiles.length > 0) {
          response += `Currently working with: ${session.sdeContext.activeFiles.join(', ')}`;
        }
      }

      return response;
    }
  };

  const updateGitHubToken = () => {
    if (!activeSession) return;
    
    sessionManager.setGitHubToken(activeSession.id, githubToken);
    setActiveSession(sessionManager.getSession(activeSession.id));
    toast({
      title: "GitHub Token Updated",
      description: "GitHub integration is now active for this session",
    });
  };

  const setSDE2Mode = (mode: 'basic' | 'advanced' | 'expert') => {
    if (!activeSession) return;
    
    sessionManager.setSDE2Mode(activeSession.id, mode);
    setActiveSession(sessionManager.getSession(activeSession.id));
    toast({
      title: `SDE2+ Mode: ${mode.toUpperCase()}`,
      description: `Switched to ${mode} development mode`,
    });
  };

  const formatMessage = (message: ChatMessage) => {
    return message.content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < message.content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sessions Sidebar */}
      <div className="w-64 border-r bg-muted/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Lupin
          </h2>
          <Button size="sm" onClick={createNewSession}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/20 ${
                activeSession?.id === session.id ? 'bg-primary/10 border border-primary/20' : ''
              }`}
              onClick={() => switchSession(session.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.name}</p>
                <p className="text-xs text-muted-foreground">
                  {session.messages.length} messages
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{activeSession.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={activeSession.sdeContext.mode === 'basic' ? 'secondary' : 'default'}>
                    SDE2+ {activeSession.sdeContext.mode.toUpperCase()}
                  </Badge>
                  {activeSession.githubContext.currentRepository && (
                    <Badge variant="outline">
                      <Github className="h-3 w-3 mr-1" />
                      {activeSession.githubContext.currentRepository.owner}/
                      {activeSession.githubContext.currentRepository.repo}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b p-4 bg-muted/5"
              >
                <Tabs defaultValue="github" className="w-full">
                  <TabsList>
                    <TabsTrigger value="github">GitHub</TabsTrigger>
                    <TabsTrigger value="sde">SDE2+ Mode</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="github" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">GitHub Token</label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="password"
                          placeholder="ghp_..."
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                        />
                        <Button onClick={updateGitHubToken} size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sde" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Development Mode</label>
                      <Select
                        value={activeSession.sdeContext.mode}
                        onValueChange={(value: 'basic' | 'advanced' | 'expert') => setSDE2Mode(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic - Code analysis & generation</SelectItem>
                          <SelectItem value="advanced">Advanced - Full development features</SelectItem>
                          <SelectItem value="expert">Expert - All features + architecture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {activeSession.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`max-w-[80%] ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/10'
                    }`}>
                      <CardContent className="p-3">
                        <div className="text-sm">
                          {formatMessage(message)}
                        </div>
                        {message.metadata?.github && (
                          <div className="mt-2 pt-2 border-t border-border/20">
                            <Badge size="sm">
                              <Github className="h-3 w-3 mr-1" />
                              {message.metadata.github.action?.replace('_', ' ')}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about GitHub repos, create issues, or get coding help..."
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setInputMessage('List my repositories')}>
                  <Github className="h-3 w-3 mr-1" />
                  List Repos
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputMessage('Help me debug this code')}>
                  <Bug className="h-3 w-3 mr-1" />
                  Debug
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputMessage('Generate code for')}>
                  <Code className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Welcome to Lupin</h3>
              <p className="text-muted-foreground mb-4">
                Your GitHub-integrated coding assistant with SDE2+ capabilities
              </p>
              <Button onClick={createNewSession}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}