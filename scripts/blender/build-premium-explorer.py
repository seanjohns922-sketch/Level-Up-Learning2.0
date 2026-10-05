"""Editable, procedural Codemaster character benchmark. Blender Z-up; front is -Y.
Exports a real GLB and studio renders. No generated concept art is used.
"""
import bpy, math, os
from mathutils import Vector
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
OUT=os.path.join(ROOT,'output/avatar-premium');os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,metal=0,rough=.45,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if name=='Skin':p.inputs['Subsurface Weight'].default_value=.09
 if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
 return m
skin=mat('Skin',(.72,.43,.255),rough=.56);inner=mat('Ear blush',(.65,.29,.20),rough=.6);lip=mat('Smile',(.12,.039,.017),rough=.6)
hair=mat('Hair',(.095,.032,.009),rough=.52);hairlight=mat('Hair highlight',(.12,.042,.014),rough=.52)
white=mat('Eye white',(.91,.92,.87),rough=.24);iris=mat('Iris',(.12,.072,.028),rough=.22);pupil=mat('Pupil',(.006,.01,.014),rough=.12)
cloth=mat('Cloth',(.043,.031,.073),rough=.8);armour=mat('Armour',(.082,.059,.125),metal=.35,rough=.32);panel=mat('Armour shadow',(.037,.028,.058),metal=.3,rough=.38)
gold=mat('Gold trim',(.68,.43,.15),metal=.78,rough=.28);goldlight=mat('Gold highlight',(.92,.69,.28),metal=.7,rough=.25)
crystal=mat('Crystal',(.44,.11,.85),metal=.15,rough=.19,emission=.16);crystal2=mat('Crystal facets',(.76,.4,1),metal=.15,rough=.22,emission=.1)
boot=mat('Boot leather',(.145,.106,.19),rough=.56);sole=mat('Boot sole',(.041,.028,.03),rough=.8);silver=mat('Steel',(.38,.35,.42),metal=.65,rough=.34)
blade=mat('Flame blade',(.86,.07,.19),metal=.5,rough=.28);flame=mat('Flame amber',(1,.24,.025),rough=.4,emission=1.5);firecore=mat('Flame core',(1,.73,.1),rough=.3,emission=2)
objects=[];parent=None
def group(name,loc):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=loc;return o
def finish(o,name,m,smooth=True):
 o.name=name;o.data.materials.append(m)
 if smooth:
  for p in o.data.polygons:p.use_smooth=True
 if parent:
  bpy.context.view_layer.update();o.parent=parent;o.matrix_parent_inverse=parent.matrix_world.inverted()
 objects.append(o);return o
def uv(name,loc,scale,m,rot=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=loc);o=bpy.context.object;o.scale=scale
 if rot:o.rotation_euler=rot
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,m)
def box(name,loc,scale,m,bevel=.03,rot=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if rot:o.rotation_euler=rot
 if bevel:
  mod=o.modifiers.new('Rounded manufactured edges','BEVEL');mod.width=bevel;mod.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,m)
def line(name,pts,r,m,radii=None):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=8;c.bevel_depth=r;c.bevel_resolution=2
 s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for i,(p,v) in enumerate(zip(s.bezier_points,pts)):
  p.co=v;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
  if radii:p.radius=radii[i]
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o=bpy.context.object;o.select_set(False);return finish(o,name,m)
def plate(name,outline,front,depth,m,bevel=.012):
 # Polygon is given in x/z; a shallow bevel makes highlight edges read in game.
 v=[(x,front,z) for x,z in outline]+[(x,front+depth,z) for x,z in outline];n=len(outline)
 f=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,[],f);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o
 if bevel:
  mod=o.modifiers.new('Forged bevel','BEVEL');mod.width=bevel;mod.segments=3;bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,m,False)
def gem(name,loc,r,h):
 x,y,z=loc;vs=[(x,y,z+h)]+[(x+math.cos(i*math.pi/2)*r,y+math.sin(i*math.pi/2)*r,z) for i in range(4)]+[(x,y,z-h*.65)]
 fs=[(0,1+i,1+(i+1)%4) for i in range(4)]+[(5,1+(i+1)%4,1+i) for i in range(4)]
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);finish(o,name,crystal,False);o.data.materials.append(crystal2)
 for p in o.data.polygons:p.material_index=p.index%3==0
 return o
root=group('Explorer', (0,0,0));parent=group('Torso',(0,0,1.12));parent.parent=root
# Tailored torso: narrower waist, curved chest rather than a capsule.
verts=[];faces=[];sections=[(.82,.23,.145),(.90,.27,.17),(1.10,.285,.18),(1.34,.33,.185),(1.47,.31,.17),(1.52,.21,.14)]
for z,rx,ry in sections:
 for i in range(32):a=i*2*math.pi/32;verts.append((math.cos(a)*rx,math.sin(a)*ry,z))
for j in range(len(sections)-1):
 for i in range(32):a=j*32+i;b=j*32+(i+1)%32;faces.append((a,b,b+32,a+32))
faces.extend([tuple(reversed(range(32))),tuple(range((len(sections)-1)*32,len(sections)*32))]);me=bpy.data.meshes.new('Tailored torso');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Underarmour tunic',me);bpy.context.collection.objects.link(o);finish(o,o.name,cloth)
uv('Neck',(0,0,1.56),(.105,.105,.115),skin)
# Layered breastplate and interlocking chevron lames.
plate('Breastplate',[(-.29,1.45),(-.14,1.48),(0,1.42),(.14,1.48),(.29,1.45),(.255,1.20),(0,1.10),(-.255,1.20)],-.192,.09,armour)
for j in range(4):
 z=1.34-j*.105;w=.273-j*.006
 plate('Articulated chest plate', [(-w,z), (0,z-.093),(w,z),(w-.025,z-.09),(0,z-.17),(-w+.025,z-.09)],-.212-j*.002,.045,armour)
 line('Gold chevron',[(-w+.015,-.244-j*.002,z-.015),(0,-.25-j*.002,z-.105),(w-.015,-.244-j*.002,z-.015)],.008,goldlight)
for side in [-1,1]:
 line('Chest border',[(side*.28,-.223,1.44),(side*.265,-.224,1.22),(side*.235,-.22,.96)],.009,gold)
 for j in range(3):uv('Gold rivet',(side*.257,-.24,1.35-j*.14),(.014,.007,.014),gold)
gem('Chest crystal',(0,-.266,1.39),.065,.09)
box('Leather belt',(0,-.005,.895),(.54,.385,.08),sole,.015);box('Belt clasp',(0,-.215,.895),(.09,.026,.08),gold,.014)
for side in [-1,1]:
 plate('Hip plate',[(side*.035,.84),(side*.235,.86),(side*.265,.71),(side*.085,.73)],-.15,.045,armour)
 line('Hip trim',[(side*.06,-.173,.83),(side*.22,-.173,.84),(side*.245,-.173,.735)],.007,gold)
# Head with a shaped jaw and cheek volume. Eyes follow the front surface.
parent=group('Head',(0,0,1.62));parent.parent=root
head=uv('Sculpted head',(0,0,1.94),(.355,.29,.375),skin)
for v in head.data.vertices:
 if v.co.z<-.09:v.co.x*=1+.2*(v.co.z+.09)
 # subtly flatten the facial plane
 if v.co.y<-.12:v.co.y=-.12+(v.co.y+.12)*.84
for side in [-1,1]:
 uv('Ear',(side*.347,.0,1.925),(.065,.043,.09),skin);uv('Ear concha',(side*.374,-.03,1.925),(.024,.012,.052),inner)
 x=side*.12
 uv('Eye socket',(x,-.247,1.987),(.067,.029,.088),inner)
 uv('Eye white',(x,-.269,1.99),(.058,.024,.078),white)
 uv('Brown iris',(x,-.291,1.988),(.034,.012,.052),iris)
 uv('Pupil',(x,-.301,1.991),(.021,.007,.036),pupil)
 uv('Eye glint',(x-.009,-.307,2.015),(.011,.004,.014),white)
 uv('Lower glint',(x+.012,-.306,1.974),(.004,.003,.005),white)
 line('Upper eyelid',[(x-.048,-.28,2.023),(x,-.289,2.064),(x+.048,-.279,2.029)],.007,hair)
 line('Eyebrow',[(x-.049,-.261,2.103),(x,-.268,2.114),(x+.046,-.258,2.105)],.011,hair,[.35,1,.45])
 uv('Cheek',(side*.21,-.208,1.897),(.065,.008,.028),inner)
uv('Nose bridge',(0,-.244,1.946),(.031,.041,.065),skin);uv('Nose tip',(0,-.282,1.922),(.04,.04,.03),skin)
line('Smile',[(-.082,-.229,1.84),(-.043,-.26,1.813),(0,-.268,1.805),(.047,-.259,1.814),(.083,-.226,1.842)],.008,lip,[.5,1,1,1,.5])
# Swept scalp surface. Strand ridges follow the same surface, never floating ribbons.
def scalp(a,t,lift=0):
 front=max(0,-math.sin(a));theta=(1.48-.42*front+.32*front*math.cos(a))*t
 quiff=.095*front*math.sin(theta*1.8)
 return ((.373+lift)*math.sin(theta)*math.cos(a)-.10*(1-math.sin(theta))**2,(.306+lift)*math.sin(theta)*math.sin(a),1.967+(.385+lift)*math.cos(theta)+quiff)
verts=[];faces=[];rings=20;steps=64
for j in range(rings+1):
 for i in range(steps):verts.append(scalp(i*2*math.pi/steps,j/rings))
for j in range(rings):
 for i in range(steps):a=j*steps+i;b=j*steps+(i+1)%steps;faces.append((a,b,b+steps,a+steps))
# Close the hairline against the head so the lifted sweep is solid from every angle.
inner_start=len(verts)
for i in range(steps):
 a=i*2*math.pi/steps;front=max(0,-math.sin(a));theta=1.48-.42*front+.32*front*math.cos(a)
 x,y,z=scalp(a,1);verts.append((x*.89,y*.78,1.94+.365*math.cos(theta)))
for i in range(steps):faces.append((rings*steps+i,inner_start+i,inner_start+(i+1)%steps,rings*steps+(i+1)%steps))
me=bpy.data.meshes.new('Swept scalp');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Swept hair base',me);bpy.context.collection.objects.link(o);finish(o,o.name,hair)
for i in range(56):
 a=i*2*math.pi/56
 pts=[scalp(a+.22*math.sin(t*math.pi),t,.0018) for t in [.16,.32,.5,.68,.84,.98]]
 line('Sculpted hair grain',pts,.0024,hairlight,[.1,.65,1,1,.7,.1])
# Separate limb roots retain pivots for the existing walking gait.
for side,label in [(-1,'L'),(1,'R')]:
 parent=group('Arm.'+label,(side*.34,0,1.44));parent.parent=root
 uv('Upper sleeve',(side*.365,0,1.28),(.113,.127,.215),cloth, (0,side*-.08,0))
 uv('Elbow',(side*.386,0,1.085),(.09,.098,.08),cloth)
 uv('Fitted forearm',(side*.39,-.006,.963),(.087,.10,.17),cloth)
 uv('Pauldron',(side*.348,-.007,1.445),(.155,.18,.13),armour)
 line('Shoulder gold edge',[(side*.21,-.13,1.47),(side*.35,-.177,1.50),(side*.47,-.1,1.44)],.012,gold)
 for j in range(3):gem('Shoulder crystal',(side*(.28+j*.074),-.015,1.525-j*.026),.042,.12-j*.014)
 plate('Forearm guard',[(side*.32,1.065),(side*.455,1.045),(side*.46,.875),(side*.325,.88)],-.095,.04,armour)
 line('Bracer trim',[(side*.33,-.125,1.04),(side*.44,-.125,1.025),(side*.44,-.125,.89)],.007,gold)
 uv('Wrist',(side*.39,-.005,.804),(.065,.069,.065),skin)
 uv('Palm',(side*.39,-.02,.75),(.083,.057,.083),skin)
 for j in range(4):uv('Finger',(side*.39+(j-1.5)*.033,-.043,.717),(.018,.035,.042),skin)
 uv('Thumb',(side*.39-side*.074,-.044,.766),(.027,.035,.047),skin, (0,side*-.5,0))
 parent=group('Leg.'+label,(side*.16,0,.80));parent.parent=root
 uv('Trouser thigh',(side*.16,0,.64),(.128,.13,.19),cloth)
 uv('Trouser shin',(side*.16,0,.405),(.105,.107,.16),cloth)
 box('Boot shaft',(side*.16,-.003,.255),(.238,.25,.31),boot,.055)
 box('Boot toe',(side*.16,-.09,.09),(.256,.39,.14),boot,.052)
 box('Layered boot sole',(side*.16,-.093,.025),(.27,.407,.046),sole,.013)
 box('Boot cuff',(side*.16,0,.412),(.253,.267,.053),armour,.018)
 plate('Shin plate',[(side*.16-.085,.382),(side*.16+.085,.382),(side*.16+.08,.215),(side*.16-.08,.215)],-.143,.03,armour)
 for z in [.27,.324]:box('Boot strap',(side*.16,-.167,z),(.184,.02,.024),silver,.006)
 for k in range(5):box('Sole tread',(side*.16,-.25+k*.073,.013),(.248,.027,.014),sole,.004)
# Export the body alone. Equipment continues using the independent hand slot.
parent=None
# Merge static surfaces sharing a material within each articulated part.
bpy.context.view_layer.update()
buckets={}
for o in list(bpy.data.objects):
 if o.type=='MESH':buckets.setdefault((o.parent,tuple(m.name for m in o.data.materials)),[]).append(o)
for (par,mats),members in buckets.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in members:o.select_set(True)
 bpy.context.view_layer.objects.active=members[0]
 if len(members)>1:bpy.ops.object.join()
 obj=bpy.context.object;obj.name=(par.name if par else 'Body')+'_'+mats[0]
 if len(obj.data.polygons)>1200 and mats[0] not in ['Skin','Eye white']:
  mod=obj.modifiers.new('Game mesh reduction','DECIMATE');mod.ratio=.6;bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/avatars/models/codemaster-premium.glb'),export_format='GLB',use_selection=True,export_apply=True)
# Neutral studio preview: real geometry/materials, no painted mock-up.
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.014));floor=bpy.context.object;floor.name='Studio floor';floor.data.materials.append(mat('Studio',(.115,.13,.15),rough=.85))
def area(name,loc,energy,size,color):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=energy;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm key',(-3,-4,5),420,4,(1,.89,.77));area('Cool fill',(3,-2,3),260,3,(.75,.85,1));area('Rim',(1,2,4),500,3,(.78,.7,1))
bpy.ops.object.camera_add(location=(3,-6,3));camera=bpy.context.object;bpy.context.scene.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=3.05
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.world.color=(.18,.18,.18);scene.view_settings.view_transform='AgX'
for name,loc in [('front',(0,-6,2.9)),('three-quarter',(3,-6,2.9)),('back',(2,6,2.9))]:
 camera.location=loc;camera.rotation_euler=(Vector((0,0,1.25))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=os.path.join(OUT,name+'.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'codemaster-premium.blend'))
