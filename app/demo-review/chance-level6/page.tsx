import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import ChanceHollowFiveFormReview from '@/components/demo/ChanceHollowFiveFormReview';
import {LEVEL6_CHANCE_FORMS} from '@/data/assessments/revisions/level6ChanceHollowFiveForms';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
export default async function ChanceLevel6ReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><ChanceHollowFiveFormReview level={6} forms={LEVEL6_CHANCE_FORMS}/></Suspense>;}
