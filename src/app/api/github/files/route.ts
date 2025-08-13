import { NextRequest, NextResponse } from 'next/server';
import { getGitHubService } from '@/lib/github-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const path = searchParams.get('path') || '';
    const ref = searchParams.get('ref');
    
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
    
    // If path is empty, get directory contents (root)
    if (!path || path === '' || path === '/') {
      const contents = await github.getDirectoryContent(owner, repo, '', ref);
      return NextResponse.json({
        contents,
        type: 'directory',
        success: true,
      });
    }

    // Try to get file content first
    try {
      const fileContent = await github.getFileContent(owner, repo, path, ref);
      return NextResponse.json({
        content: fileContent,
        type: 'file',
        success: true,
      });
    } catch (error: any) {
      // If it fails, try as directory
      if (error.message.includes('404')) {
        try {
          const dirContents = await github.getDirectoryContent(owner, repo, path, ref);
          return NextResponse.json({
            contents: dirContents,
            type: 'directory',
            success: true,
          });
        } catch (dirError) {
          throw error; // Throw original error
        }
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error fetching file/directory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    const body = await request.json();
    const { owner, repo, path, content, message, sha, branch } = body;

    if (!owner || !repo || !path || !content || !message) {
      return NextResponse.json(
        { error: 'Owner, repository name, path, content, and message are required' },
        { status: 400 }
      );
    }

    const github = getGitHubService(token);
    const result = await github.createOrUpdateFile(owner, repo, path, content, message, sha, branch);

    return NextResponse.json({
      result,
      success: true,
    });
  } catch (error: any) {
    console.error('Error creating/updating file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'GitHub token is required' }, { status: 401 });
    }

    const body = await request.json();
    const { owner, repo, path, message, sha, branch } = body;

    if (!owner || !repo || !path || !message || !sha) {
      return NextResponse.json(
        { error: 'Owner, repository name, path, message, and sha are required' },
        { status: 400 }
      );
    }

    const github = getGitHubService(token);
    const result = await github.deleteFile(owner, repo, path, message, sha, branch);

    return NextResponse.json({
      result,
      success: true,
    });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: 500 }
    );
  }
}