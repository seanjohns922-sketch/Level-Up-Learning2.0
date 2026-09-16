import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year3MeasurementFiveFormReview from '@/components/demo/Year3MeasurementFiveFormReview';
export default async function Year3MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year3MeasurementFiveFormReview/></Suspense>;}
