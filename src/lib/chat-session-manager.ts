/**
 * Chat Session Manager for Lupin
 * Manages multiple chat sessions with GitHub integration and SDE2+ mode
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    github?: {
      repository?: string;
      action?: string;
      result?: any;
    };
    sde?: {
      mode: 'basic' | 'advanced' | 'expert';
      context?: any;
    };
  };
}

export interface GitHubContext {
  token?: string;
  currentRepository?: {
    owner: string;
    repo: string;
    branch?: string;
  };
  connectedRepositories: Array<{
    owner: string;
    repo: string;
    lastUsed: string;
  }>;
}

export interface SDE2Context {
  mode: 'basic' | 'advanced' | 'expert';
  capabilities: {
    codeAnalysis: boolean;
    debugging: boolean;
    testing: boolean;
    deployment: boolean;
    codeGeneration: boolean;
    architectureDesign: boolean;
  };
  workingDirectory?: string;
  activeFiles: string[];
  projectStructure?: any;
}

export interface ChatSession {
  id: string;
  name: string;
  created: string;
  lastUpdated: string;
  messages: ChatMessage[];
  githubContext: GitHubContext;
  sdeContext: SDE2Context;
  isActive: boolean;
  settings: {
    autoSave: boolean;
    githubIntegration: boolean;
    sdeMode: boolean;
    maxMessages: number;
  };
}

class ChatSessionManager {
  private sessions: Map<string, ChatSession> = new Map();
  private activeSessionId: string | null = null;

  constructor() {
    this.loadSessions();
  }

  // Session Management
  createSession(name?: string): ChatSession {
    const id = this.generateSessionId();
    const session: ChatSession = {
      id,
      name: name || `Chat Session ${this.sessions.size + 1}`,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messages: [],
      githubContext: {
        connectedRepositories: [],
      },
      sdeContext: {
        mode: 'basic',
        capabilities: {
          codeAnalysis: true,
          debugging: true,
          testing: false,
          deployment: false,
          codeGeneration: true,
          architectureDesign: false,
        },
        activeFiles: [],
      },
      isActive: false,
      settings: {
        autoSave: true,
        githubIntegration: true,
        sdeMode: true,
        maxMessages: 100,
      },
    };

    this.sessions.set(id, session);
    this.setActiveSession(id);
    this.saveSessions();

    return session;
  }

  getSession(id: string): ChatSession | null {
    return this.sessions.get(id) || null;
  }

  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  deleteSession(id: string): boolean {
    if (this.activeSessionId === id) {
      this.activeSessionId = null;
    }
    const deleted = this.sessions.delete(id);
    if (deleted) {
      this.saveSessions();
    }
    return deleted;
  }

  setActiveSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;

    // Deactivate all sessions
    this.sessions.forEach((s) => {
      s.isActive = false;
    });

    // Activate the selected session
    session.isActive = true;
    this.activeSessionId = id;
    this.saveSessions();

    return true;
  }

  getActiveSession(): ChatSession | null {
    return this.activeSessionId ? this.sessions.get(this.activeSessionId) || null : null;
  }

  // Message Management
  addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const newMessage: ChatMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date().toISOString(),
    };

    session.messages.push(newMessage);
    session.lastUpdated = new Date().toISOString();

    // Trim messages if exceeded max
    if (session.messages.length > session.settings.maxMessages) {
      session.messages = session.messages.slice(-session.settings.maxMessages);
    }

    if (session.settings.autoSave) {
      this.saveSessions();
    }

    return newMessage;
  }

  updateMessage(sessionId: string, messageId: string, updates: Partial<ChatMessage>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const messageIndex = session.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return false;

    session.messages[messageIndex] = { ...session.messages[messageIndex], ...updates };
    session.lastUpdated = new Date().toISOString();

    if (session.settings.autoSave) {
      this.saveSessions();
    }

    return true;
  }

  deleteMessage(sessionId: string, messageId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const initialLength = session.messages.length;
    session.messages = session.messages.filter((m) => m.id !== messageId);
    const wasDeleted = session.messages.length < initialLength;

    if (wasDeleted) {
      session.lastUpdated = new Date().toISOString();
      if (session.settings.autoSave) {
        this.saveSessions();
      }
    }

    return wasDeleted;
  }

  clearMessages(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.messages = [];
    session.lastUpdated = new Date().toISOString();

    if (session.settings.autoSave) {
      this.saveSessions();
    }

    return true;
  }

  // GitHub Context Management
  setGitHubToken(sessionId: string, token: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.githubContext.token = token;
    session.lastUpdated = new Date().toISOString();
    this.saveSessions();

    return true;
  }

  setCurrentRepository(sessionId: string, owner: string, repo: string, branch?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.githubContext.currentRepository = { owner, repo, branch };
    
    // Add to connected repositories if not already present
    const existing = session.githubContext.connectedRepositories.find(
      (r) => r.owner === owner && r.repo === repo
    );

    if (existing) {
      existing.lastUsed = new Date().toISOString();
    } else {
      session.githubContext.connectedRepositories.push({
        owner,
        repo,
        lastUsed: new Date().toISOString(),
      });
    }

    session.lastUpdated = new Date().toISOString();
    this.saveSessions();

    return true;
  }

  // SDE2+ Context Management
  setSDE2Mode(sessionId: string, mode: 'basic' | 'advanced' | 'expert'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.sdeContext.mode = mode;
    
    // Update capabilities based on mode
    switch (mode) {
      case 'basic':
        session.sdeContext.capabilities = {
          codeAnalysis: true,
          debugging: true,
          testing: false,
          deployment: false,
          codeGeneration: true,
          architectureDesign: false,
        };
        break;
      case 'advanced':
        session.sdeContext.capabilities = {
          codeAnalysis: true,
          debugging: true,
          testing: true,
          deployment: true,
          codeGeneration: true,
          architectureDesign: true,
        };
        break;
      case 'expert':
        session.sdeContext.capabilities = {
          codeAnalysis: true,
          debugging: true,
          testing: true,
          deployment: true,
          codeGeneration: true,
          architectureDesign: true,
        };
        break;
    }

    session.lastUpdated = new Date().toISOString();
    this.saveSessions();

    return true;
  }

  addActiveFile(sessionId: string, filePath: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (!session.sdeContext.activeFiles.includes(filePath)) {
      session.sdeContext.activeFiles.push(filePath);
      session.lastUpdated = new Date().toISOString();
      this.saveSessions();
    }

    return true;
  }

  removeActiveFile(sessionId: string, filePath: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const initialLength = session.sdeContext.activeFiles.length;
    session.sdeContext.activeFiles = session.sdeContext.activeFiles.filter(
      (f) => f !== filePath
    );

    if (session.sdeContext.activeFiles.length < initialLength) {
      session.lastUpdated = new Date().toISOString();
      this.saveSessions();
      return true;
    }

    return false;
  }

  // Session Settings
  updateSessionSettings(sessionId: string, settings: Partial<ChatSession['settings']>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.settings = { ...session.settings, ...settings };
    session.lastUpdated = new Date().toISOString();
    this.saveSessions();

    return true;
  }

  updateSessionName(sessionId: string, name: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.name = name;
    session.lastUpdated = new Date().toISOString();
    this.saveSessions();

    return true;
  }

  // Persistence
  private saveSessions(): void {
    try {
      const sessionsData = Array.from(this.sessions.entries());
      localStorage.setItem('lupin-chat-sessions', JSON.stringify({
        sessions: sessionsData,
        activeSessionId: this.activeSessionId,
      }));
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  }

  private loadSessions(): void {
    try {
      const stored = localStorage.getItem('lupin-chat-sessions');
      if (stored) {
        const data = JSON.parse(stored);
        this.sessions = new Map(data.sessions);
        this.activeSessionId = data.activeSessionId;
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  }

  // Utility Methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Export/Import
  exportSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  importSession(sessionData: string): boolean {
    try {
      const session: ChatSession = JSON.parse(sessionData);
      
      // Generate new ID to avoid conflicts
      const newId = this.generateSessionId();
      session.id = newId;
      session.isActive = false;
      
      this.sessions.set(newId, session);
      this.saveSessions();
      
      return true;
    } catch (error) {
      console.error('Failed to import session:', error);
      return false;
    }
  }
}

// Singleton instance
let sessionManager: ChatSessionManager | null = null;

export function getChatSessionManager(): ChatSessionManager {
  if (!sessionManager) {
    sessionManager = new ChatSessionManager();
  }
  return sessionManager;
}

// Export types and manager
export { ChatSessionManager };