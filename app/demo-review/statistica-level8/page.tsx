import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level8StatisticaFiveFormReview from '@/components/demo/Level8StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level8StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level8StatisticaFiveFormReview/></Suspense>;
}
