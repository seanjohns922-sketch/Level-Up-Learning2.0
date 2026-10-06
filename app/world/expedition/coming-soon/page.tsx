import Link from 'next/link';
import {redirect} from 'next/navigation';
import {LEVEL7_LIVE} from '@/lib/level7-release';
import ReadAloudBtn from '@/components/ReadAloudBtn';
export default function Level8ComingSoon(){
 if(!LEVEL7_LIVE)redirect('/world/tower');
 return <main className="grid min-h-dvh place-items-center bg-slate-950 p-8 text-white"><section className="max-w-xl text-center"><h1 className="text-3xl font-bold">Level 8 lessons are coming soon</h1><p className="my-5">Your progress is saved. Your teacher will let you know when the next lessons are ready.</p><ReadAloudBtn text="Level 8 lessons are coming soon. Your progress is saved. Your teacher will let you know when the next lessons are ready."/><p className="mt-6"><Link href="/world/tower" className="underline">Back to the Tower</Link></p></section></main>;
}
