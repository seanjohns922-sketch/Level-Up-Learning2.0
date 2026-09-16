import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year2MeasurementFiveFormReview from '@/components/demo/Year2MeasurementFiveFormReview';
export default async function Year2MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year2MeasurementFiveFormReview/></Suspense>;}
