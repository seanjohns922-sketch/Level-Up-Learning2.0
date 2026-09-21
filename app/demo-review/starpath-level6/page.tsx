import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level6StarpathFiveFormReview from '@/components/demo/Level6StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level6StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level6StarpathFiveFormReview/></Suspense>;
}
