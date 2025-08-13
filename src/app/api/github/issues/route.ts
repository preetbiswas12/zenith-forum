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
    const issues = await github.listIssues(owner, repo, state);

    return NextResponse.json({
      issues,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch issues' },
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
    const { owner, repo, title, body: issueBody, labels } = body;

    if (!owner || !repo || !title) {
      return NextResponse.json(
        { error: 'Owner, repository name, and title are required' },
        { status: 400 }
      );
    }

    const github = getGitHubService(token);
    const issue = await github.createIssue(owner, repo, title, issueBody, labels);

    return NextResponse.json({
      issue,
      success: true,
    });
  } catch (error: any) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create issue' },
      { status: 500 }
    );
  }
}