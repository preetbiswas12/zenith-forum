# Lupin - GitHub Integration for Zenith Forum

## Overview
Lupin is a comprehensive GitHub-integrated coding assistant built into the Zenith Forum platform. It provides AI-powered development assistance with multiple sophistication levels (SDE2+ modes) and seamless GitHub repository integration.

## Features

### 🚀 GitHub Integration
- **Repository Management**: List, fork, clone repositories
- **Issue & PR Operations**: Create and manage issues and pull requests
- **File Operations**: Browse, view, create, update, and delete files
- **Commit History**: View commit history and specific commits
- **Branch Operations**: List and create branches

### 🧠 SDE2+ Development Modes
- **Basic Mode**: Code analysis, basic debugging, simple generation
- **Advanced Mode**: Full development features, testing, deployment
- **Expert Mode**: Architecture design, performance optimization, security auditing

### 💬 Chat Interface
- **Multi-Session Support**: Multiple concurrent chat sessions
- **Session Persistence**: Auto-save conversations and context
- **GitHub Context**: Per-session GitHub repository context
- **AI Integration**: Intelligent responses with context awareness

## Architecture

### Backend Services
- **GitHub Service** (`/src/lib/github-service.ts`): GitHub API integration
- **Chat Session Manager** (`/src/lib/chat-session-manager.ts`): Session state management
- **AI Service** (`/src/lib/ai-service.ts`): AI response generation and command processing

### API Endpoints
- **GitHub APIs**: `/api/github/*` - Repository, issues, PRs, files, commits
- **AI APIs**: `/api/ai/*` - Chat responses and command processing

### Frontend Components
- **Lupin Chat** (`/src/components/lupin-chat.tsx`): Main chat interface
- **Navigation** (`/src/components/navigation.tsx`): App navigation
- **Settings Panels**: GitHub token management, SDE2+ mode selection

## Setup and Configuration

### Environment Variables
Create a `.env.local` file with the following:

```bash
# Google Gemini AI
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here

# GitHub Integration (Optional - users can provide their own tokens)
GITHUB_DEFAULT_TOKEN=your_github_token_here

# Application Settings
NEXT_PUBLIC_HOST_URL=http://localhost:3000
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

### Getting Started
1. Navigate to `/lupin` to access the chat interface
2. Click "Start New Chat" to create a new session
3. Configure GitHub token in settings if needed
4. Select your preferred SDE2+ mode
5. Start chatting with Lupin!

### GitHub Commands
- `"List my repositories"` - Show your GitHub repositories
- `"Fork owner/repo"` - Fork a specific repository
- `"Create issue title: "Bug fix" body: "Description""` - Create an issue
- Ask for code analysis, debugging help, or generation

### SDE2+ Modes
- **Basic**: Ideal for beginners, basic code help
- **Advanced**: Full development support with testing and deployment
- **Expert**: Advanced architecture and optimization guidance

## API Reference

### GitHub Service
```typescript
// List repositories
const repos = await github.listRepositories();

// Fork repository
const forkedRepo = await github.forkRepository('owner', 'repo');

// Create issue
const issue = await github.createIssue('owner', 'repo', 'title', 'body');
```

### Chat Session Management
```typescript
// Create new session
const session = sessionManager.createSession('My Session');

// Add message
const message = sessionManager.addMessage(sessionId, {
  role: 'user',
  content: 'Hello Lupin!'
});

// Set GitHub context
sessionManager.setCurrentRepository(sessionId, 'owner', 'repo');
```

## Development

### Adding New GitHub Operations
1. Add method to `GitHubService` class
2. Create corresponding API endpoint
3. Update command processing in `AIService`
4. Add UI controls if needed

### Extending SDE2+ Capabilities
1. Update `SDE2Context` interface
2. Modify capability definitions in `ChatSessionManager`
3. Enhance AI prompts in `AIService`
4. Add UI for new features

## Security Considerations
- GitHub tokens are stored locally in browser storage
- All GitHub API calls are made client-side or through proxy endpoints
- No sensitive data is logged or stored on the server
- Users control their own authentication credentials

## Contributing
1. Follow existing code patterns and TypeScript types
2. Add comprehensive error handling
3. Update documentation for new features
4. Test both UI and API functionality
5. Ensure GitHub integration works with various repository types

## Troubleshooting

### Common Issues
- **GitHub API Rate Limits**: Use authenticated tokens for higher limits
- **Build Errors**: Ensure all TypeScript types are properly defined
- **Chat Not Working**: Check AI service configuration and API keys
- **Session Not Persisting**: Verify localStorage is available and functional

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and checking browser console for detailed logs.

## License
This project is part of the Zenith Forum platform. See the main project license for terms and conditions.