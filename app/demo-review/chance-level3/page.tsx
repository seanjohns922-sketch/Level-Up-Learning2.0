import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import ChanceHollowFiveFormReview from '@/components/demo/ChanceHollowFiveFormReview';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
export default async function ChanceLevel3ReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><ChanceHollowFiveFormReview/></Suspense>;}
