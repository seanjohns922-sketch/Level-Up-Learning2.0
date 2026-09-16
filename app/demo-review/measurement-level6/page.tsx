import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year6MeasurementFiveFormReview from '@/components/demo/Year6MeasurementFiveFormReview';
export default async function Year6MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year6MeasurementFiveFormReview/></Suspense>;}
