import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year1MeasurementFiveFormReview from '@/components/demo/Year1MeasurementFiveFormReview';
export default async function Year1MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year1MeasurementFiveFormReview/></Suspense>;}
