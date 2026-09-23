"use client";
import type {CSSProperties} from 'react';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {patternReleaseVisual,readReleasedPattern,encodeReleasedPattern} from '@/lib/pattern-release-response';
import PatternPeaksAssessmentCard from '@/components/demo/PatternPeaksAssessmentCard';
import {ppEmpty} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
import styles from '@/components/demo/StatisticaFiveForms.module.css';
export default function ReleasedPatternQuestion({question,value,onChange}:{question:{id?:string;visual?:unknown};value:string|null;onChange:(v:string)=>void}){
 const visual=patternReleaseVisual(question);if(!visual)return null;
 const response=readReleasedPattern(question.id??'',value)??ppEmpty(),theme=getRealmTheme('pattern');
 return <div className={`${styles.card} ${styles.released}`} data-pattern-release-level={visual.level} style={{'--light':theme.chipText,'--accent':theme.accentText,'--selected':theme.ctaFrom,'--ring':theme.borderRing,'--cta':theme.ctaGradientCss,'--surface':theme.cardSurface,'--tint':theme.surfaceTint} as CSSProperties}><PatternPeaksAssessmentCard item={visual.item} response={response} update={r=>onChange(encodeReleasedPattern(question.id??'',r))}/></div>;
}
