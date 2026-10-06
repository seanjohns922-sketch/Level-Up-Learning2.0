import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import CurriculumReview from './review';
export default async function Page(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <CurriculumReview/>;
}
