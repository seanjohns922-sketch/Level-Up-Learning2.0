import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import ChanceHollowFiveFormReview from '@/components/demo/ChanceHollowFiveFormReview';
import {LEVEL5_CHANCE_FORMS} from '@/data/assessments/revisions/level5ChanceHollowFiveForms';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
export default async function ChanceLevel5ReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><ChanceHollowFiveFormReview level={5} forms={LEVEL5_CHANCE_FORMS}/></Suspense>;}
