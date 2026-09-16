"use client";
import {createContext, useContext, type CSSProperties, type ReactNode} from 'react';
import {HelpCircle} from 'lucide-react';
import {getRealmTheme} from '@/lib/useRealmTheme';

export const AssessmentSkipContext = createContext<(() => void) | undefined>(undefined);

/** Shared visual/response workspace. Wide tasks retain a full-width canvas. */
export default function AssessmentWorkspace({visual, children, realmId, wide=false}:{visual:ReactNode;children:ReactNode;realmId?:string;wide?:boolean}) {
 const onIdk=useContext(AssessmentSkipContext);
 const theme=getRealmTheme(realmId);
 return <div className="assessment-workspace" data-wide-task={wide} style={{borderColor:theme.accentText, '--workspace-accent':theme.accentText} as CSSProperties}>
  <div className="assessment-workspace-visual">{visual}</div>
  <div className="assessment-response-panel">
   <div className="assessment-response-content">{children}</div>
   {onIdk?<button type="button" className="assessment-workspace-skip" onClick={onIdk}><HelpCircle size={20} aria-hidden="true"/>I don&apos;t know</button>:null}
  </div>
 </div>;
}
