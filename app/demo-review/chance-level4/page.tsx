import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import ChanceHollowFiveFormReview from '@/components/demo/ChanceHollowFiveFormReview';
import {LEVEL4_CHANCE_FORMS} from '@/data/assessments/revisions/level4ChanceHollowFiveForms';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
export default async function ChanceLevel4ReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><ChanceHollowFiveFormReview level={4} forms={LEVEL4_CHANCE_FORMS}/></Suspense>;}
