import { redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';

export default async function NumberAdventureReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect('/login');
  redirect('/demo-review/number-adventure/3d');
}
