// Fix your route.ts file
import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

type Mood = 'happy' | 'sad';

export async function GET(request: NextRequest, { params }: { params: { id: string; action: string } }) {
  // ✅ Await params first
  const { id, action } = await params;
  
  if (action !== 'status') return NextResponse.json({ error: 'Use POST to change mood' }, { status: 400 });

  const mood = await kv.get<Mood>(id);
  return NextResponse.json({ id, mood: mood ?? 'unknown' });
}

export async function POST(request: NextRequest, { params }: { params: { id: string; action: string } }) {
  // ✅ Await params first
  const { id, action } = await params;
  
  const mood = action === 'feed' ? 'happy' : action === 'slap' ? 'sad' : null;
  if (!mood) return NextResponse.json({ error: 'Invalid action' }, { status: 404 });

  await kv.set(id, mood);
  return NextResponse.json({ id, mood });
}