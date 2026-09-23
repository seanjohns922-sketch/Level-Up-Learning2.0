import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level1PatternPeaksFiveFormReview from '@/components/demo/Level1PatternPeaksFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function PatternLevel1ReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level1PatternPeaksFiveFormReview/></Suspense>;
}
