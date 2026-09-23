import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level4PatternPeaksFiveFormReview from '@/components/demo/Level4PatternPeaksFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function PatternLevel4ReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level4PatternPeaksFiveFormReview/></Suspense>;
}
