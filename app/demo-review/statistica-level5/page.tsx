import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level5StatisticaFiveFormReview from '@/components/demo/Level5StatisticaFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level5StatisticaReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level5StatisticaFiveFormReview/></Suspense>;
}
