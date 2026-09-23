import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level8PatternPeaksFiveFormReview from '@/components/demo/Level8PatternPeaksFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function PatternLevel8ReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level8PatternPeaksFiveFormReview/></Suspense>;
}
