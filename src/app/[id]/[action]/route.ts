// First install redis client
// npm install redis
// or
// npm install ioredis

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis' // or 'import Redis from 'ioredis''

type Mood = 'happy' | 'sad';

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL // or whatever your Redis connection string is
});

// Connect if not already connected
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
    return NextResponse.json({ error: 'Redis connection failed' }, { status: 500 });
  }
}