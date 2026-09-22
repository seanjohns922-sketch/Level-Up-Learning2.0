import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level2StatisticaFiveFormReview from '@/components/demo/Level2StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level2StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level2StatisticaFiveFormReview/></Suspense>;
}
