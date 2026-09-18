import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level4StarpathFiveFormReview from '@/components/demo/Level4StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level4StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level4StarpathFiveFormReview/></Suspense>;
}
