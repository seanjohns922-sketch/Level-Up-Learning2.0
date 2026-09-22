import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level1StatisticaFiveFormReview from '@/components/demo/Level1StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level1StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level1StatisticaFiveFormReview/></Suspense>;
}
