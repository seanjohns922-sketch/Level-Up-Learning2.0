import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Level6PatternPeaksFiveFormReview from '@/components/demo/Level6PatternPeaksFiveFormReview';
import { getServerStarpathAccess } from '@/lib/demo-session-server';
export default async function PatternLevel6ReviewPage(){
 const access=await getServerStarpathAccess();
 if(!access.allowed)redirect('/login');
 return <Suspense fallback={null}><Level6PatternPeaksFiveFormReview/></Suspense>;
}
