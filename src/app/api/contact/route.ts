import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { strictLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await strictLimiter(`contact:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Input length limits to prevent abuse
    if (name.length > 100 || email.length > 254 || message.length > 5000 || (subject && subject.length > 200)) {
      return NextResponse.json({ error: 'Input too long. Please shorten your message.' }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Save contact submission to database
    await db.contactSubmission.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
      },
    });

    return NextResponse.json({ success: true, message: 'Message received. We will get back to you soon!' });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
