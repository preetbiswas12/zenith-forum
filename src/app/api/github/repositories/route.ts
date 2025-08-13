import { NextRequest, NextResponse } from 'next/server';
import { getGitHubService } from '@/lib/github-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    const github = getGitHubService(token);
    const repositories = await github.listRepositories('all');

    return NextResponse.json({
      repositories,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch repositories' },
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
    const { owner, repo } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repository name are required' },
        { status: 400 }
      );
    }

    const github = getGitHubService(token);
    const forkedRepo = await github.forkRepository(owner, repo);

    return NextResponse.json({
      repository: forkedRepo,
      success: true,
    });
  } catch (error: any) {
    console.error('Error forking repository:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fork repository' },
      { status: 500 }
    );
  }
}