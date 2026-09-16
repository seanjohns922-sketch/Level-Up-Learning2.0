import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year8MeasurementFiveFormReview from '@/components/demo/Year8MeasurementFiveFormReview';
export default async function Year8MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year8MeasurementFiveFormReview/></Suspense>;}
