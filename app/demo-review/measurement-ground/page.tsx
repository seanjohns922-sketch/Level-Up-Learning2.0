import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {getServerStarpathAccess} from '@/lib/demo-session-server';
import GroundMeasurementFiveFormReview from '@/components/demo/GroundMeasurementFiveFormReview';
export default async function GroundMeasurementReviewPage(){const access=await getServerStarpathAccess();if(!access.allowed)redirect('/login');return <Suspense fallback={null}><GroundMeasurementFiveFormReview/></Suspense>;}
