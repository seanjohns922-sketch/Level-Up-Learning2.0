import { redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';

// Keep saved expedition links demo-only until the Level 7–8 programmes launch.
export default async function ExpeditionPage() {
  const access = await getServerStarpathAccess();
  redirect(access.allowed ? '/demo-review/number-adventure/3d' : '/world/tower');
}
