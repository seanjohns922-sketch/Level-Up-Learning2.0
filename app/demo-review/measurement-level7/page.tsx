import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import Year7MeasurementFiveFormReview from '@/components/demo/Year7MeasurementFiveFormReview';
export default async function Year7MeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><Year7MeasurementFiveFormReview/></Suspense>;}
