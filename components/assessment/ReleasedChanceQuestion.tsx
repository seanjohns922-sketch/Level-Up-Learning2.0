"use client";
import type {CSSProperties} from 'react';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {chanceReleaseVisual,readReleasedChance,encodeReleasedChance} from '@/lib/chance-release-response';
import ChanceHollowAssessmentCard from '@/components/demo/ChanceHollowAssessmentCard';
import {chEmpty} from '@/data/assessments/revisions/level3ChanceHollowFiveForms';
import styles from '@/components/demo/StatisticaFiveForms.module.css';
export default function ReleasedChanceQuestion({question,value,onChange}:{question:{id?:string;visual?:unknown};value:string|null;onChange:(v:string)=>void}){
 const visual=chanceReleaseVisual(question);if(!visual)return null;
 const response=readReleasedChance(question.id??'',value)??chEmpty(),theme=getRealmTheme('chance');
 return <div className={`${styles.card} ${styles.released}`} data-chance-release-level={visual.level} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><ChanceHollowAssessmentCard item={visual.item} response={response} level={visual.level} update={r=>onChange(encodeReleasedChance(question.id??'',r))}/></div>;
}
