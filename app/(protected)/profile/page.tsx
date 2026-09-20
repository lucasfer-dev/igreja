import { requireChurch } from '@/lib/auth';
import { updateProfile } from './actions';

export default async function ProfilePage() {
  const { supabase, user, roleName, churchName } = await requireChurch();
  const { data: profile } = await supabase.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle();

  return (
    <>
      <header className="topbar"><div className="title"><span className="eyebrow">Conta</span><h1>Meu perfil</h1><p>Seus dados de acesso e identificação na {churchName}.</p></div></header>
      <section className="profile-grid">
        <div className="card profile-summary"><div className="avatar xl">{(profile?.full_name || user.email || 'U').slice(0, 1).toUpperCase()}</div><h2>{profile?.full_name || 'Seu perfil'}</h2><p>{user.email}</p><span className="badge">{roleName}</span></div>
        <div className="card"><h2>Informações pessoais</h2><form action={updateProfile} className="form"><div className="field"><label htmlFor="fullName">Nome completo</label><input id="fullName" name="fullName" defaultValue={profile?.full_name || ''} required /></div><div className="field"><label htmlFor="phone">Telefone</label><input id="phone" name="phone" defaultValue={profile?.phone || ''} /></div><div className="field"><label>E-mail</label><input value={user.email || ''} disabled /></div><button className="btn" type="submit">Salvar alterações</button></form></div>
      </section>
    </>
  );
}
