import { notFound, redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
import { number7ActivityHref } from '@/lib/number7-demo';
import Space7QuizClient from '@/components/starpath/Space7QuizClient';
import SessionPage from '@/app/session/page';
export default async function Page({params,searchParams}:{params:Promise<{realm:string}>;searchParams:Promise<Record<string,string|undefined>>}) {
 if(!(await getServerStarpathAccess()).allowed)redirect('/login');
 const realm=(await params).realm;
 if(realm!=='number'&&realm!=='measurement'&&realm!=='space')notFound();
 const q=await searchParams,week=Number(q.week);
 if(!Number.isInteger(week)||week<1||week>12)notFound();
 if(week===12)redirect(number7ActivityHref(12,'posttest',realm));
 if(q.year!=='Year 7'||q.realm_id!==realm||q.teacher_preview!=='1'||q.expedition!=='1'||q.type!=='quiz'||q.n!=='1')redirect(number7ActivityHref(week,'quiz',realm));
 return realm==='space'?<Space7QuizClient week={week}/>:<SessionPage/>;
}
