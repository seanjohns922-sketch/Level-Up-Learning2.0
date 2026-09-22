import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level8StarpathFiveFormReview from '@/components/demo/Level8StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level8StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level8StarpathFiveFormReview/></Suspense>;
}
