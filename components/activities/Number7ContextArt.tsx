'use client';
import Image from 'next/image';
import {BookOpen, Coins, Package, ShoppingBag, Sprout, Ticket, Lightbulb, ArrowUpDown, Thermometer} from 'lucide-react';
import {number7ContextArt} from '@/lib/number7-context-art';
import {getRealmTheme} from '@/lib/useRealmTheme';

export default function Number7ContextArt({prompt}:{prompt:string}) {
  const kind=number7ContextArt(prompt);
  if(!kind)return null;
  const theme=getRealmTheme('number');
  const icons={garden:Sprout,bag:ShoppingBag,notebook:BookOpen,ticket:Ticket,parcel:Package,lights:Lightbulb,coins:Coins,lift:ArrowUpDown,thermometer:Thermometer};
  const Icon=kind==='jug'||kind==='bottle'||kind==='tank'||kind==='rope'?null:icons[kind];
  // The prompt already names the object and has read-aloud. This art is decorative,
  // with no water-level markings, counts or measured geometry to interpret.
  return <div aria-hidden="true" data-number7-context-art={kind} className="my-2 flex h-24 items-center justify-center rounded-xl" style={{background:theme.surfaceTint,color:theme.ctaFrom}}>
    {kind==='tank'?<svg viewBox="0 0 120 100" className="h-20 w-24"><path d="M25 22V80C25 94 95 94 95 80V22 M25 38C25 52 95 52 95 38 M25 58C25 72 95 72 95 58" fill="none" stroke="currentColor" strokeWidth="3"/><ellipse cx="60" cy="22" rx="35" ry="12" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M95 76H107V87" fill="none" stroke="currentColor" strokeWidth="4"/></svg>:kind==='rope'?<svg viewBox="0 0 140 80" className="h-20 w-32"><path d="M12 60C30 10 70 10 70 40S105 75 128 20" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/><path d="M12 60C30 10 70 10 70 40S105 75 128 20" fill="none" stroke="white" strokeWidth="2" strokeDasharray="2 5"/></svg>:Icon?<Icon size={56} strokeWidth={1.5}/>:<Image src={`/images/measurelands/containers/${kind}.png`} width={96} height={96} alt="" className="h-24 w-24 object-contain"/>}
  </div>;
}
