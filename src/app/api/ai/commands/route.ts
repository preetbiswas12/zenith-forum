import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, githubToken } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const commandInfo = await aiService.processGitHubCommand(message, githubToken);

    return NextResponse.json({
      commandInfo,
      success: true,
    });
  } catch (error: any) {
    console.error('Command processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process command' },
      { status: 500 }
    );
  }
}