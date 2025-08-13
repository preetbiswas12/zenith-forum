import { NextRequest, NextResponse } from 'next/server';
import { getGitHubService } from '@/lib/github-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch');
    const sha = searchParams.get('sha');
    
    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repository name are required' },
        { status: 400 }
      );
    }

    const github = getGitHubService(token);
    
    if (sha) {
      // Get specific commit
      const commit = await github.getCommit(owner, repo, sha);
      return NextResponse.json({
        commit,
        success: true,
      });
    } else {
      // List commits
      const commits = await github.listCommits(owner, repo, branch);
      return NextResponse.json({
        commits,
        success: true,
      });
    }
  } catch (error: any) {
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}