import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level5StarpathFiveFormReview from '@/components/demo/Level5StarpathFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function Level5StarpathReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level5StarpathFiveFormReview/></Suspense>;
}
