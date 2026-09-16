import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year4MeasurementFiveFormReview from '@/components/demo/Year4MeasurementFiveFormReview';
export default async function Year4MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year4MeasurementFiveFormReview/></Suspense>;}
