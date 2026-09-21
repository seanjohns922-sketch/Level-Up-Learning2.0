import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level7StarpathFiveFormReview from '@/components/demo/Level7StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level7StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level7StarpathFiveFormReview/></Suspense>;
}
