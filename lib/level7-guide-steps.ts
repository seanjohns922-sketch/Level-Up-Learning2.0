/** Worked-example steps for Level 7 skill guides. */
// One step per sentence or clause of the worked explanation. A calculation after a
// colon becomes its own step; decimals such as 2.5 never split.
export function solutionSteps(explanation=''){
 const tidy=(x:string)=>{const t=x.trim().replace(/^then\s+/i,'').replace(/[,;]$/,'');if(!t)return '';const cap=/^[a-z]{2,}\b/.test(t)?t[0].toUpperCase()+t.slice(1):t;return cap+(/[.!?]$/.test(cap)?'':'.');};
 return explanation.split(/(?<=[.!?])\s+(?=[A-Z(])|;\s+|,\s+then\s+|\s+then\s+(?=[a-z]+\s)/).flatMap(part=>{const m=part.match(/^(\S+(?:\s+\S+)+?):\s+(?=[-\d(a-zA-Z]\S*\s*[=×÷+−-])(.*)$/);return m?[m[1],m[2]]:[part];}).map(tidy).filter(Boolean);
}
