import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level7StatisticaFiveFormReview from '@/components/demo/Level7StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level7StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level7StatisticaFiveFormReview/></Suspense>;
}
