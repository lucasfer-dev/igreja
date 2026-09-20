import { MonitorPlay } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function Projection(){
 const {supabase,churchId}=await requireChurch();
 const {data:sets}=await supabase.from('worship_sets').select('id,title,scheduled_at,notes').eq('church_id',churchId).order('scheduled_at',{ascending:false}).limit(12);
 const {data:rows}=await supabase.from('worship_set_songs').select('set_id,position,transpose_to,songs(title,artist,key,lyrics,chords)').order('position');
 return <><header className="topbar"><div className="title"><span className="eyebrow">Projeção</span><h1>Modo culto</h1><p>Abra um repertório e visualize letras/cifras em formato limpo para projeção.</p></div></header><section className="projection-grid">{sets?.length?sets.map(set=><article className="card projection-card" key={set.id}><div className="section-head"><div><span className="eyebrow">Repertório</span><h2>{set.title}</h2></div><span className="metric-icon"><MonitorPlay size={18}/></span></div>{(rows||[]).filter((r:any)=>r.set_id===set.id).map((r:any)=><details className="song-slide" key={r.position}><summary>{r.position}. {r.songs?.title} <span>{r.transpose_to||r.songs?.key||''}</span></summary><div className="slide-content"><pre>{r.songs?.lyrics||'Letra não cadastrada.'}</pre>{r.songs?.chords&&<pre className="chords">{r.songs.chords}</pre>}</div></details>)}</article>):<div className="card empty">Crie um repertório no módulo de Louvor.</div>}</section></>;
}
