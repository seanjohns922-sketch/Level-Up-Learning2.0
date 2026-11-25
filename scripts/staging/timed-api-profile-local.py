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
try:
    cfg={k:d['Config'][k] for k in ['Image','Entrypoint','Cmd','WorkingDir','User']}
    cfg['Image']=d['Image']
    cfg['Env']=[v for v in d['Config']['Env'] if not v.startswith('PGRST_SERVER_TIMING_ENABLED=')]+['PGRST_SERVER_TIMING_ENABLED=true']
    cfg['HostConfig']={'NetworkMode':network,'PortBindings':{'3000/tcp':[{'HostIp':'127.0.0.1','HostPort':'56529'}]}}
    cfg['ExposedPorts']={'3000/tcp':{}}
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
    subprocess.run(['node','--no-warnings','--experimental-strip-types','--experimental-loader',str(repo/'scripts/typescript-alias-loader.mjs'),str(repo/'scripts/staging/event-chain-profile-local.mjs'),'--contention'],env=env,check=True,timeout=180)
finally:
    if created: run('rm','-f',name)
    now=json.loads(run('inspect',original))[0]
    assert now['Id']==d['Id'] and now['State']['Running'] and now['Config']==d['Config']
    assert name not in run('ps','-a','--format','{{.Names}}').splitlines()
    print('Temporary API removed; original container identity/configuration unchanged.')
