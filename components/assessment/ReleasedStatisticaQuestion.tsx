"use client";
import type {CSSProperties} from 'react';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {statisticaReleaseVisual,emptyStatsResponse,readReleasedStatistica,encodeReleasedStatistica} from '@/lib/statistica-release-response';
import StatisticaAssessmentCard from '@/components/statistica/StatisticaAssessmentCard';
import styles from '@/components/demo/StatisticaFiveForms.module.css';
export default function ReleasedStatisticaQuestion({question,value,onChange}:{question:{id?:string;visual?:unknown};value:string|null;onChange:(v:string)=>void}){
 const visual=statisticaReleaseVisual(question);if(!visual)return null;
 const response=readReleasedStatistica(question.id??'',value)??emptyStatsResponse(visual.item),theme=getRealmTheme('statistics');
 return <div className={`${styles.card} ${styles.released}`} data-statistica-release-level={visual.level} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><StatisticaAssessmentCard item={visual.item} response={response} onChange={r=>onChange(encodeReleasedStatistica(question.id??'',r))}/></div>;
}
