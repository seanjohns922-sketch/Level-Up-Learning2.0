import {cave7Realm,cave7WeekCount} from "@/lib/cave7-config";
import { notFound, redirect } from 'next/navigation';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
import { number7ActivityHref } from '@/lib/number7-demo';
import LessonPage from '@/app/lesson/page';
export default async function Page({params,searchParams}:{params:Promise<{realm:string}>;searchParams:Promise<Record<string,string|undefined>>}) {
 if(!(await getServerStarpathAccess()).allowed)redirect('/login');
 const realm=(await params).realm;
 if(!cave7Realm(realm))notFound();
 const q=await searchParams,week=Number(q.week),match=q.lessonId?.match(realm==='number'?/^y7-w(\d+)-l([1-3])$/:new RegExp(`^y7-${realm}-w(\\d+)-l([1-3])$`));
 if(!match||Number(match[1])!==week||!Number.isInteger(week)||week<1||week>cave7WeekCount(realm))notFound();
 if(q.year!=='Year 7'||q.realm_id!==realm||q.teacher_preview!=='1'||q.expedition!=='1')redirect(number7ActivityHref(week,Number(match[2]),realm));
 return <LessonPage/>;
}
