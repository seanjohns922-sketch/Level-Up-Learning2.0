import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import ChanceHollowFiveFormReview from '@/components/demo/ChanceHollowFiveFormReview';
import {LEVEL8_CHANCE_FORMS} from '@/data/assessments/revisions/level8ChanceHollowFiveForms';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
export default async function ChanceLevel8ReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><ChanceHollowFiveFormReview level={8} forms={LEVEL8_CHANCE_FORMS}/></Suspense>;}
