import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level1StarpathFiveFormReview from '@/components/demo/Level1StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level1StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level1StarpathFiveFormReview/></Suspense>;
}
