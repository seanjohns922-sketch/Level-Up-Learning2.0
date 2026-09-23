import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level7PatternPeaksFiveFormReview from '@/components/demo/Level7PatternPeaksFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function PatternLevel7ReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level7PatternPeaksFiveFormReview/></Suspense>;
}
