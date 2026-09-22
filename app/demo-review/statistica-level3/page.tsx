import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level3StatisticaFiveFormReview from '@/components/demo/Level3StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level3StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level3StatisticaFiveFormReview/></Suspense>;
}
