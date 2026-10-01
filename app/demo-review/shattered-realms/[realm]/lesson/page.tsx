import { notFound, redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
import { number7ActivityHref } from '@/lib/number7-demo';
import LessonPage from '@/app/lesson/page';
export default async function Page({params,searchParams}:{params:Promise<{realm:string}>;searchParams:Promise<Record<string,string|undefined>>}) {
 if(!(await getServerStarpathAccess()).allowed)redirect('/login');
 if((await params).realm!=='number')notFound();
 const q=await searchParams,week=Number(q.week),match=q.lessonId?.match(/^y7-w(\d+)-l([1-3])$/);
 if(!match||Number(match[1])!==week||!Number.isInteger(week)||week<1||week>12)notFound();
 if(q.year!=='Year 7'||q.realm_id!=='number'||q.teacher_preview!=='1'||q.expedition!=='1')redirect(number7ActivityHref(week,Number(match[2])));
 return <LessonPage/>;
}
