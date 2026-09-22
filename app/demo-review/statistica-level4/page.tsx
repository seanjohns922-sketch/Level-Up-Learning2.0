import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level4StatisticaFiveFormReview from '@/components/demo/Level4StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level4StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level4StatisticaFiveFormReview/></Suspense>;
}
