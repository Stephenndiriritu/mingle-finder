import { NextResponse } from 'next/server';
import { getAuthStatus } from '@/lib/auth';

export async function GET() {
  const authStatus = await getAuthStatus();
  
  return NextResponse.json(authStatus);
}