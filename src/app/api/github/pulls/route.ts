import { NextRequest, NextResponse } from 'next/server';
import { getGitHubService } from '@/lib/github-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const state = searchParams.get('state') as 'open' | 'closed' | 'all' || 'open';
    
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
    const pulls = await github.listPullRequests(owner, repo, state);

    return NextResponse.json({
      pulls,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pull requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    const body = await request.json();
    const { owner, repo, title, head, base, body: prBody } = body;

    if (!owner || !repo || !title || !head || !base) {
      return NextResponse.json(
        { error: 'Owner, repository name, title, head, and base are required' },
        { status: 400 }
      );
    }

    const github = getGitHubService(token);
    const pullRequest = await github.createPullRequest(owner, repo, title, head, base, prBody);

    return NextResponse.json({
      pullRequest,
      success: true,
    });
  } catch (error: any) {
    console.error('Error creating pull request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pull request' },
      { status: 500 }
    );
  }
}