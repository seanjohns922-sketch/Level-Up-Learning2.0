import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level3PatternPeaksFiveFormReview from '@/components/demo/Level3PatternPeaksFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function PatternLevel3ReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level3PatternPeaksFiveFormReview/></Suspense>;
}
