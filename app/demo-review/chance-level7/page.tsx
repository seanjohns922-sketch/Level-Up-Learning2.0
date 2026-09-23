import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import ChanceHollowFiveFormReview from '@/components/demo/ChanceHollowFiveFormReview';
import {LEVEL7_CHANCE_FORMS} from '@/data/assessments/revisions/level7ChanceHollowFiveForms';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
export default async function ChanceLevel7ReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><ChanceHollowFiveFormReview level={7} forms={LEVEL7_CHANCE_FORMS}/></Suspense>;}
