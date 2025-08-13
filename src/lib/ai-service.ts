/**
 * AI Integration Service for Lupin
 * Connects Lupin with AI services for intelligent code assistance
 */

import { ai } from '@/ai/ai-instance';
import { ChatSession, ChatMessage } from './chat-session-manager';

export interface AIContext {
  githubContext?: {
    currentRepo?: string;
    recentActions?: any[];
  };
  sdeContext?: {
    mode: 'basic' | 'advanced' | 'expert';
    activeFiles?: string[];
  };
  sessionHistory?: ChatMessage[];
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(
    userMessage: string,
    context: AIContext = {}
  ): Promise<string> {
    try {
      // Build context prompt
      let systemPrompt = this.buildSystemPrompt(context);
      
      // Build conversation history
      const messages = this.buildConversationHistory(context.sessionHistory || [], userMessage);

      // Generate response using AI
      const response = await ai.generate({
        prompt: {
          system: systemPrompt,
          messages: messages,
        },
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      return response.text;
    } catch (error) {
      console.error('AI generation error:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  private buildSystemPrompt(context: AIContext): string {
    let prompt = `You are Lupin, an advanced AI coding assistant with GitHub integration capabilities. 
You help developers with code analysis, debugging, repository management, and software development tasks.

Core Capabilities:
- GitHub repository operations (clone, fork, pull, push, create issues/PRs)
- Code analysis and generation
- Debugging assistance
- Architecture design and recommendations
- Testing strategies
- Deployment guidance

`;

    // Add SDE2+ context
    if (context.sdeContext) {
      const { mode, activeFiles } = context.sdeContext;
      prompt += `Current SDE2+ Mode: ${mode.toUpperCase()}
`;
      
      switch (mode) {
        case 'basic':
          prompt += `Basic Mode Features:
- Code analysis and explanation
- Basic debugging help
- Simple code generation
- Best practices suggestions
`;
          break;
        case 'advanced':
          prompt += `Advanced Mode Features:
- Full code analysis and optimization
- Advanced debugging with stack traces
- Complex code generation and refactoring
- Testing strategies and test generation
- Deployment recommendations
- Architecture patterns
`;
          break;
        case 'expert':
          prompt += `Expert Mode Features:
- Deep architectural analysis
- Performance optimization
- Security auditing
- Advanced patterns and design principles
- Scalability recommendations
- Full DevOps integration
`;
          break;
      }

      if (activeFiles && activeFiles.length > 0) {
        prompt += `Currently working with files: ${activeFiles.join(', ')}
`;
      }
    }

    // Add GitHub context
    if (context.githubContext?.currentRepo) {
      prompt += `Current Repository: ${context.githubContext.currentRepo}
`;
      
      if (context.githubContext.recentActions?.length > 0) {
        prompt += `Recent GitHub Actions:
${context.githubContext.recentActions.map(action => `- ${action.type}: ${action.description}`).join('\n')}
`;
      }
    }

    prompt += `
Guidelines:
- Always provide practical, actionable advice
- Include code examples when relevant
- Explain complex concepts clearly
- Suggest GitHub operations when appropriate
- Consider the user's current SDE2+ mode capabilities
- Be concise but comprehensive
- Format responses with proper markdown
`;

    return prompt;
  }

  private buildConversationHistory(history: ChatMessage[], currentMessage: string): any[] {
    const messages = [];
    
    // Add recent conversation history (last 10 messages)
    const recentHistory = history.slice(-10);
    
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: currentMessage });

    return messages;
  }

  private getFallbackResponse(userMessage: string, context: AIContext): string {
    const lowerMessage = userMessage.toLowerCase();

    // GitHub command responses
    if (lowerMessage.includes('repo') || lowerMessage.includes('github')) {
      return `I can help you with GitHub operations! Here are some things I can do:

🔧 **Repository Management:**
- List your repositories
- Fork repositories
- Clone repositories
- View repository details

🐛 **Issue & PR Management:**
- Create issues
- List open/closed issues
- Create pull requests
- Review pull requests

📁 **File Operations:**
- Browse repository files
- View file contents
- Create/update files
- Delete files

To get started, you can:
- Set your GitHub token in settings
- Ask me to "list my repositories"
- Say "fork [owner/repo]" to fork a repository
- Ask me to "create an issue" with details

What would you like to do?`;
    }

    // Code-related responses
    if (lowerMessage.includes('code') || lowerMessage.includes('debug') || lowerMessage.includes('help')) {
      const mode = context.sdeContext?.mode || 'basic';
      return `I'm here to help with your coding needs! 

🧠 **Current Mode:** SDE2+ ${mode.toUpperCase()}

${mode === 'basic' ? `**Basic Mode Capabilities:**
- Code analysis and explanation
- Basic debugging assistance
- Simple code generation
- Best practices suggestions` : 
  mode === 'advanced' ? `**Advanced Mode Capabilities:**
- Full code analysis and optimization
- Advanced debugging with stack traces
- Complex code generation and refactoring
- Testing strategies and test generation
- Deployment recommendations
- Architecture patterns` : 
`**Expert Mode Capabilities:**
- Deep architectural analysis
- Performance optimization
- Security auditing
- Advanced patterns and design principles
- Scalability recommendations
- Full DevOps integration`}

💡 **How to use me:**
- Share your code for analysis
- Describe bugs you're encountering
- Ask for architecture advice
- Request code generation for specific tasks
- Get help with testing strategies

What coding challenge can I help you with today?`;
    }

    // Default response
    return `Hello! I'm Lupin, your GitHub-integrated coding assistant.

🚀 **What I can help with:**
- GitHub repository management (clone, fork, issues, PRs)
- Code analysis and debugging
- Software architecture advice
- Code generation and refactoring
- Testing and deployment strategies

💬 **Quick commands to try:**
- "List my repositories"
- "Help me debug this code"
- "Generate a React component"
- "Create an issue for [description]"

How can I assist you today?`;
  }

  // GitHub command detection and processing
  async processGitHubCommand(
    message: string, 
    githubToken?: string
  ): Promise<{
    isCommand: boolean;
    action?: string;
    parameters?: any;
    requiresToken?: boolean;
  }> {
    const lowerMessage = message.toLowerCase();
    
    // Repository listing
    if (lowerMessage.includes('list') && lowerMessage.includes('repo')) {
      return {
        isCommand: true,
        action: 'list_repositories',
        requiresToken: true,
      };
    }

    // Fork repository
    const forkMatch = message.match(/fork\s+([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/i);
    if (forkMatch) {
      return {
        isCommand: true,
        action: 'fork_repository',
        parameters: {
          owner: forkMatch[1],
          repo: forkMatch[2],
        },
        requiresToken: true,
      };
    }

    // Create issue
    if (lowerMessage.includes('create') && lowerMessage.includes('issue')) {
      const titleMatch = message.match(/title:\s*"([^"]+)"/i) || 
                         message.match(/issue:\s*"([^"]+)"/i);
      const bodyMatch = message.match(/body:\s*"([^"]+)"/i) ||
                        message.match(/description:\s*"([^"]+)"/i);
      
      if (titleMatch) {
        return {
          isCommand: true,
          action: 'create_issue',
          parameters: {
            title: titleMatch[1],
            body: bodyMatch ? bodyMatch[1] : undefined,
          },
          requiresToken: true,
        };
      }
    }

    return { isCommand: false };
  }

  // Format AI responses with better markdown
  formatResponse(response: string): string {
    // Add spacing around headers
    response = response.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2\n');
    
    // Ensure code blocks are properly formatted
    response = response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `\`\`\`${lang || ''}\n${code.trim()}\n\`\`\``;
    });

    // Ensure list items have proper spacing
    response = response.replace(/^\s*[-*+]\s+(.+)$/gm, '• $1');
    
    return response.trim();
  }
}

// Singleton export
export const aiService = AIService.getInstance();