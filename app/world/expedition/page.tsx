import {LEVEL7_LIVE} from '@/lib/level7-release';
import CoreExpeditionEntry from '@/components/world3d/CoreExpeditionEntry';
import '@/components/world3d/number-summit.css';
import { redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';

// Keep saved expedition links demo-only until the Level 7–8 programmes launch.
export default async function ExpeditionPage() {
  if(LEVEL7_LIVE)return <CoreExpeditionEntry/>;
  const access = await getServerStarpathAccess();
  redirect(access.allowed ? '/demo-review/number-adventure/3d' : '/world/tower');
}
