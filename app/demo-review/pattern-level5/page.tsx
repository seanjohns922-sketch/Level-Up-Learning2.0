import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level5PatternPeaksFiveFormReview from '@/components/demo/Level5PatternPeaksFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function PatternLevel5ReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level5PatternPeaksFiveFormReview/></Suspense>;
}
