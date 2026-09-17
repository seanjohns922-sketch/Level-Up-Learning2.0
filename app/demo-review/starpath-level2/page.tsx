import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level2StarpathFiveFormReview from '@/components/demo/Level2StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level2StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level2StarpathFiveFormReview/></Suspense>;
}
