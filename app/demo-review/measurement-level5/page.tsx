import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year5MeasurementFiveFormReview from '@/components/demo/Year5MeasurementFiveFormReview';
export default async function Year5MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year5MeasurementFiveFormReview/></Suspense>;}
