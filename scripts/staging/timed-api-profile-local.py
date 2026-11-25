"""Ephemeral official API timing probe. Existing container remains untouched."""
import json, os, subprocess, http.client, socket, time
from pathlib import Path
repo=Path(__file__).resolve().parents[2]
name='reliq-read-timing-probe'
original='supabase_rest_reliq-scale-local'
network='supabase_network_reliq-scale-local'
def run(*args):
    return subprocess.check_output(['docker',*args],text=True,stderr=subprocess.PIPE)
def api(path, body=None, method='POST'):
    class Connection(http.client.HTTPConnection):
        def connect(self):
            self.sock=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
            self.sock.connect(str(Path.home()/'.docker/run/docker.sock'))
    c=Connection('localhost');c.request(method,path,json.dumps(body) if body else None,{'Content-Type':'application/json'})
    r=c.getresponse();data=r.read();c.close()
    if r.status>=300: raise RuntimeError('Docker operation failed: '+str(r.status))
    return json.loads(data) if data else None
assert name not in run('ps','-a','--format','{{.Names}}').splitlines()
d=json.loads(run('inspect',original))[0]
assert d['State']['Running'] and not d['Mounts']
assert d['Config']['Image']=='public.ecr.aws/supabase/postgrest:v14.8'
created=False
child=None
metrics=[]
try:
    cfg={k:d['Config'][k] for k in ['Image','Entrypoint','Cmd','WorkingDir','User']}
    cfg['Image']=d['Image']
    cfg['Env']=[v for v in d['Config']['Env'] if not v.startswith(('PGRST_SERVER_TIMING_ENABLED=','PGRST_ADMIN_SERVER_PORT='))]+['PGRST_SERVER_TIMING_ENABLED=true','PGRST_ADMIN_SERVER_PORT=3001']
    cfg['HostConfig']={'NetworkMode':network,'PortBindings':{'3000/tcp':[{'HostIp':'127.0.0.1','HostPort':'56529'}],'3001/tcp':[{'HostIp':'127.0.0.1','HostPort':'56530'}]}}
    cfg['ExposedPorts']={'3000/tcp':{},'3001/tcp':{}}
    api('/containers/create?name='+name,cfg);created=True;run('start',name)
    # HTTP 401 is expected without credentials and demonstrates listener readiness.
    for attempt in range(40):
        try:
            c=http.client.HTTPConnection('127.0.0.1',56529,timeout=1);c.request('GET','/');r=c.getresponse();r.read();c.close()
            if r.status in [200,401]: break
        except OSError: pass
        time.sleep(.25)
    else: raise RuntimeError('Temporary API did not become ready')
    env=os.environ.copy();env['SCALE_TIMED_API']='1'
    profile=os.environ.get('SCALE_READ_PROFILE','--contention')
    assert profile in ['--contention','--bursts']
    command=['node','--no-warnings','--experimental-strip-types','--experimental-loader',str(repo/'scripts/typescript-alias-loader.mjs'),str(repo/'scripts/staging/event-chain-profile-local.mjs'),profile]
    def sample():
        started=time.time()*1000
        c=http.client.HTTPConnection('127.0.0.1',56530,timeout=3)
        c.request('GET','/metrics');r=c.getresponse();body=r.read().decode();c.close()
        assert r.status==200
        values={line.split()[0]:float(line.split()[1]) for line in body.splitlines() if line.startswith('pgrst_db_pool_') and len(line.split())==2}
        assert all(key in values for key in ['pgrst_db_pool_waiting','pgrst_db_pool_available','pgrst_db_pool_max','pgrst_db_pool_timeouts_total'])
        metrics.append({'startedEpochMs':started,'finishedEpochMs':time.time()*1000,'values':values})
    sample()
    child=subprocess.Popen(command,env=env)
    deadline=time.monotonic()+180
    while child.poll() is None:
        sample()
        if time.monotonic()>deadline: raise RuntimeError('Read workload timed out')
        time.sleep(.1)
    assert child.returncode==0
    sample()
    Path('.local-archive/scale-local/timed-api-pool-metrics.json').write_text(json.dumps({'intervalTargetMs':100,'samples':metrics,'caveat':'Sampled pool occupancy, not per-request acquisition duration; scrape latency and observer overhead apply.'},indent=2)+'\n')
finally:
    if child is not None and child.poll() is None:
        child.terminate()
        try: child.wait(timeout=10)
        except subprocess.TimeoutExpired: child.kill();child.wait()
    if created: run('rm','-f',name)
    now=json.loads(run('inspect',original))[0]
    assert now['Id']==d['Id'] and now['State']['Running'] and now['Config']==d['Config']
    assert name not in run('ps','-a','--format','{{.Names}}').splitlines()
    print('Temporary API removed; original container identity/configuration unchanged.')
