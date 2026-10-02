import { notFound, redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
import { cavernRealm, cavernWeek, cavernWeekHref } from '@/lib/world3d/shattered-realms';
import ProgramPage from '@/app/program/page';

// Reuse the actual week-home component inside a server-authorised demo route.
export default async function CavernWeekPage({params,searchParams}:{params:Promise<{realm:string}>;searchParams:Promise<Record<string,string|undefined>>}) {
  const access=await getServerStarpathAccess();
  if(!access.allowed)redirect('/login');
  const realm=cavernRealm((await params).realm);
  if(!realm)notFound();
  const query=await searchParams;
  const week=cavernWeek(query.week,realm);
  if(query.realm_id!==realm||query.year!=='Year 7'||query.week!==String(week)||query.legacy!=='1'||query.teacher_preview!=='1'||query.expedition!=='1')redirect(cavernWeekHref(realm,week));
  return <ProgramPage/>;
}
