import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

type Mood = 'happy' | 'sad';

const redis = createClient({
  url: process.env.REDIS_URL
});

if (!redis.isOpen) {
  redis.connect();
}

export async function GET(request: NextRequest, { params }: { params: { id: string; action: string } }) {
  const { id, action } = await params;
  
  if (action !== 'status') return NextResponse.json({ error: 'Use POST to change mood' }, { status: 400 });

  try {
    const mood = await redis.get(id) as Mood | null;
    return NextResponse.json({ id, mood: mood ?? 'unknown' });
  } catch (error) {
    console.error('Redis error:', error); // ✅ Now using the error
    return NextResponse.json({ error: 'Redis connection failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string; action: string } }) {
  const { id, action } = await params;
  
  const mood = action === 'feed' ? 'happy' : action === 'slap' ? 'sad' : null;
  if (!mood) return NextResponse.json({ error: 'Invalid action' }, { status: 404 });

  try {
    await redis.set(id, mood);
    return NextResponse.json({ id, mood });
  } catch (error) {
    console.error('Redis error:', error); // ✅ Now using the error
    return NextResponse.json({ error: 'Redis connection failed' }, { status: 500 });
  }
}