import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level6StatisticaFiveFormReview from '@/components/demo/Level6StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level6StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level6StatisticaFiveFormReview/></Suspense>;
}
