import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level3StarpathFiveFormReview from '@/components/demo/Level3StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level3StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level3StarpathFiveFormReview/></Suspense>;
}
