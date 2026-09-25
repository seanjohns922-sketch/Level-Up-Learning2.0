import '@/components/world3d/number-summit.css';
import { redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
import NumberAdventure3DEntry from '@/components/world3d/NumberAdventure3DEntry';
export default async function NumberAdventure3DPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect('/login');
  return <NumberAdventure3DEntry />;
}
