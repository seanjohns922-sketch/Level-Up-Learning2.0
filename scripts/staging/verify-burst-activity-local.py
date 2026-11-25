"""Verify saved per-run synthetic activity journals; never query production."""
import json
from pathlib import Path
import sys
root=Path('.local-archive/scale-local').resolve()
out=Path(sys.argv[1]).resolve()
assert root in out.parents, 'Only isolated local run archives are supported'
r=json.loads((out/'summary.json').read_text())
assert r['order']==[6,2,2,6] and len(r['rounds'])==4
checks=[]
for run in r['rounds']:
    entries=[json.loads(line) for line in (out/f"{run['round']}-activity.jsonl").read_text().splitlines()]
    activity_total=event_total=0
    for student in range(1,101):
        rows=[x for x in entries if x.get('studentOrdinal')==student]
        before=[x['secondsActive'] for x in rows if x['kind']=='baseline']
        after=[x['secondsActive'] for x in rows if x['kind']=='readback']
        assert len(before)==len(after)==1
        intents=[(x['operation'],x['sequence']) for x in rows if x['kind']=='intent']
        acks=[(x['operation'],x['sequence']) for x in rows if x['kind']=='acknowledged']
        assert len(intents)==len(set(intents)) and len(acks)==len(set(acks))
        assert set(intents)==set(acks), 'Every dispatched write needs acknowledgement'
        activity=sorted(seq for op,seq in acks if op=='activity')
        events=sorted(seq for op,seq in acks if op=='event')
        assert activity==events==list(range(1,len(activity)+1))
        assert after[0]-before[0]==30*len(activity)
        verified=[x for x in rows if x['kind']=='verified']
        assert len(verified)==1 and verified[0]['activityWrites']==len(activity)
        activity_total+=len(activity);event_total+=len(events)
    assert activity_total==run['activityWrites'] and event_total==run['events']
    assert run['verifiedStudents']==100 and run['failedOperations']==0 and run['failures']==[]
    checks.append({'round':run['round'],'students':100,'acknowledgedActivity':activity_total,'acknowledgedEvents':event_total,'unacknowledgedIntents':0})
r['journalChecks']=checks
r['journalLimitation']='Per-run API baseline/readbacks recorded during each run, not retrospective database deltas after all runs.'
(out/'verified-summary.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'rounds':[{'concurrency':x['concurrency'],'dashboardP95Ms':x['p95Ms']['dashboard_refresh'],'gatePassed':x['gatePassed']} for x in r['rounds']],'journalChecks':checks},indent=2))
