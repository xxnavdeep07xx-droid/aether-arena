import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // In production, this would send an email or save to database
    // For now, we'll just log it and return success
    console.log('Contact form submission:', { name, email, subject, message: message.substring(0, 100) });

    return NextResponse.json({ success: true, message: 'Message received' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
