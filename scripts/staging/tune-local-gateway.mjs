// The CLI's local gateway defaults to 512 connections; never targets cloud.
import { execFileSync } from 'node:child_process';
import { localConfig } from './local-config.mjs';
localConfig();
if(process.argv.slice(2).some(arg=>arg!=='--restore'))throw new Error('Only --restore is supported');
const restore=process.argv.includes('--restore');
const script=restore ? `set -eu
cd /usr/local/kong
test -f nginx.conf.capacity-backup
cp nginx.conf.capacity-backup nginx-capacity.conf
nginx -t -p /usr/local/kong/ -c nginx-capacity.conf
mv nginx-capacity.conf nginx.conf
nginx -s reload -p /usr/local/kong/ -c nginx.conf
` : `set -eu
cd /usr/local/kong
if grep -q 'worker_connections 4096;' nginx.conf; then exit 0; fi
if grep -q worker_connections nginx.conf; then echo 'Unexpected explicit connection setting; inspect first.' >&2; exit 1; fi
if ! test -f nginx.conf.capacity-backup; then cp nginx.conf nginx.conf.capacity-backup; fi
sed '/^events {/a\\    worker_connections 4096;' nginx.conf > nginx-capacity.conf
nginx -t -p /usr/local/kong/ -c nginx-capacity.conf
mv nginx-capacity.conf nginx.conf
nginx -s reload -p /usr/local/kong/ -c nginx.conf
`;
execFileSync('docker',['exec','-i','supabase_kong_reliq-scale-local','sh'],{input:script,stdio:['pipe','inherit','inherit']});
console.log(restore?'Restored the local gateway configuration.':'Local gateway configured for 4096 worker connections.');
