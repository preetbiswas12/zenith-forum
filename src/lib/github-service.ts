/**
 * GitHub Integration Service for Lupin
 * Provides comprehensive GitHub repository operations and management
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language: string | null;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  html_url: string;
  download_url: string | null;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token: string | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: this.getHeaders(),
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API Error: ${response.status} - ${error.message || error.error_description || 'Request failed'}`);
    }

    return response.json();
  }

  // Repository Operations
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  async listRepositories(type: 'all' | 'owner' | 'public' | 'private' = 'all'): Promise<GitHubRepository[]> {
    return this.makeRequest<GitHubRepository[]>(`/user/repos?type=${type}&sort=updated&per_page=100`);
  }

  async searchRepositories(query: string, sort: 'stars' | 'forks' | 'updated' = 'updated'): Promise<{
    items: GitHubRepository[];
    total_count: number;
  }> {
    return this.makeRequest<{
      items: GitHubRepository[];
      total_count: number;
    }>(`/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&per_page=50`);
  }

  async forkRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}/forks`, {
      method: 'POST',
    });
  }

  // Issue Operations
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.makeRequest<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  async listIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    return this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?state=${state}&per_page=100`);
  }

  async createIssue(owner: string, repo: string, title: string, body?: string, labels?: string[]): Promise<GitHubIssue> {
    return this.makeRequest<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body, labels }),
    });
  }

  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    updates: { title?: string; body?: string; state?: 'open' | 'closed'; labels?: string[] }
  ): Promise<GitHubIssue> {
    return this.makeRequest<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Pull Request Operations
  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<GitHubPullRequest> {
    return this.makeRequest<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  }

  async listPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> {
    return this.makeRequest<GitHubPullRequest[]>(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`);
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<GitHubPullRequest> {
    return this.makeRequest<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, head, base, body }),
    });
  }

  // Commit Operations
  async listCommits(owner: string, repo: string, branch?: string): Promise<GitHubCommit[]> {
    const url = `/repos/${owner}/${repo}/commits${branch ? `?sha=${branch}` : ''}`;
    return this.makeRequest<GitHubCommit[]>(url);
  }

  async getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    return this.makeRequest<GitHubCommit>(`/repos/${owner}/${repo}/commits/${sha}`);
  }

  // File Operations
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<GitHubFileContent> {
    const url = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
    return this.makeRequest<GitHubFileContent>(url);
  }

  async getDirectoryContent(owner: string, repo: string, path: string = '', ref?: string): Promise<GitHubFileContent[]> {
    const url = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
    return this.makeRequest<GitHubFileContent[]>(url);
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch?: string
  ): Promise<{
    content: GitHubFileContent;
    commit: GitHubCommit;
  }> {
    const body: any = {
      message,
      content: btoa(content), // Base64 encode content
    };

    if (sha) {
      body.sha = sha;
    }

    if (branch) {
      body.branch = branch;
    }

    return this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ): Promise<{ commit: GitHubCommit }> {
    const body: any = {
      message,
      sha,
    };

    if (branch) {
      body.branch = branch;
    }

    return this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
  }

  // Branch Operations
  async listBranches(owner: string, repo: string): Promise<Array<{
    name: string;
    commit: {
      sha: string;
      url: string;
    };
    protected: boolean;
  }>> {
    return this.makeRequest(`/repos/${owner}/${repo}/branches`);
  }

  async createBranch(owner: string, repo: string, branchName: string, fromSha: string): Promise<{
    ref: string;
    node_id: string;
    url: string;
    object: {
      sha: string;
      type: string;
      url: string;
    };
  }> {
    return this.makeRequest(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: fromSha,
      }),
    });
  }

  // User Operations
  async getCurrentUser(): Promise<{
    login: string;
    id: number;
    avatar_url: string;
    name: string | null;
    email: string | null;
    bio: string | null;
    location: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
  }> {
    return this.makeRequest('/user');
  }

  // Utility Methods
  generateCloneUrl(owner: string, repo: string, useSSH: boolean = false): string {
    return useSSH
      ? `git@github.com:${owner}/${repo}.git`
      : `https://github.com/${owner}/${repo}.git`;
  }

  parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com[\/:]([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
    return null;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }
}

// Singleton instance
let githubService: GitHubService | null = null;

export function getGitHubService(token?: string): GitHubService {
  if (!githubService || (token && token !== githubService['token'])) {
    githubService = new GitHubService(token);
  }
  return githubService;
}