import { Church, Palette, Smartphone } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { updateChurch } from './actions';

type TenantSettings={short_name?:string;accent_color?:string;background_color?:string;instagram_url?:string|null;youtube_url?:string|null;address?:string|null};

export default async function SettingsPage() {
  const { supabase, churchId } = await requirePermission('church.manage');
  const { data: church } = await supabase.from('churches').select('name,email,phone,whatsapp,logo_url,primary_color,secondary_color,slug,plan_key,settings').eq('id', churchId).single();
  const settings=((church?.settings&&typeof church.settings==='object')?church.settings:{}) as TenantSettings;
  const shortName=settings.short_name||church?.name||'Igreja';

  return <>
    <header className="page-heading"><div><span className="page-kicker">Identidade do tenant</span><h1>Configurações</h1><p>Marca, contatos e aparência usados em toda a experiência da igreja.</p></div></header>
    <section className="tenant-settings-grid">
      <aside className="panel tenant-preview">
        <span className="section-eyebrow">Prévia</span>
        <div className="tenant-preview-brand" style={{background:church?.secondary_color||'#522402'}}>
          <span style={{backgroundImage:church?.logo_url?`url("${church.logo_url}")`:undefined}}>{!church?.logo_url&&<Church size={24}/>}</span>
          <div><strong>{shortName}</strong><small>{church?.name}</small></div>
        </div>
        <div className="tenant-swatches">
          <span style={{background:church?.primary_color||'#FF7100'}} title="Primária"/>
          <span style={{background:church?.secondary_color||'#522402'}} title="Secundária"/>
          <span style={{background:settings.accent_color||'#FDA83C'}} title="Destaque"/>
          <span style={{background:settings.background_color||'#F2E6D7'}} title="Fundo"/>
        </div>
        <p>Esses valores são carregados pelo shell do produto. Outras igrejas podem usar a mesma aplicação com sua própria identidade.</p>
      </aside>

      <div className="panel">
        <form action={updateChurch} className="form">
          <div className="form-section-title"><strong>Identidade</strong><span>Não redesenhe a marca aqui: use o arquivo oficial em uma URL estável.</span></div>
          <div className="form-row"><div className="field"><label htmlFor="name">Nome completo</label><input id="name" name="name" defaultValue={church?.name||''} required/></div><div className="field"><label htmlFor="shortName">Nome curto</label><input id="shortName" name="shortName" defaultValue={shortName} required/></div></div>
          <div className="field"><label htmlFor="logoUrl">URL da logo oficial</label><input id="logoUrl" name="logoUrl" type="url" defaultValue={church?.logo_url||''} placeholder="https://..."/></div>

          <div className="form-section-title"><strong><Palette size={14}/> Paleta</strong><span>Tokens semânticos aplicados em navegação, CTAs e superfícies.</span></div>
          <div className="tenant-color-grid">
            <label><span>Primária</span><input name="primaryColor" type="color" defaultValue={church?.primary_color||'#FF7100'}/><code>{church?.primary_color||'#FF7100'}</code></label>
            <label><span>Secundária</span><input name="secondaryColor" type="color" defaultValue={church?.secondary_color||'#522402'}/><code>{church?.secondary_color||'#522402'}</code></label>
            <label><span>Destaque</span><input name="accentColor" type="color" defaultValue={settings.accent_color||'#FDA83C'}/><code>{settings.accent_color||'#FDA83C'}</code></label>
            <label><span>Fundo</span><input name="backgroundColor" type="color" defaultValue={settings.background_color||'#F2E6D7'}/><code>{settings.background_color||'#F2E6D7'}</code></label>
          </div>

          <div className="form-section-title"><strong><Smartphone size={14}/> Contatos e canais</strong><span>Informações institucionais do ambiente.</span></div>
          <div className="form-row"><div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" defaultValue={church?.email||''}/></div><div className="field"><label htmlFor="phone">Telefone</label><input id="phone" name="phone" inputMode="tel" defaultValue={church?.phone||''}/></div></div>
          <div className="form-row"><div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={church?.whatsapp||''}/></div><div className="field"><label htmlFor="address">Endereço</label><input id="address" name="address" defaultValue={settings.address||''}/></div></div>
          <div className="form-row"><div className="field"><label htmlFor="instagramUrl">Instagram</label><input id="instagramUrl" name="instagramUrl" type="url" defaultValue={settings.instagram_url||''}/></div><div className="field"><label htmlFor="youtubeUrl">YouTube</label><input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={settings.youtube_url||''}/></div></div>

          <button className="primary-submit" type="submit">Salvar identidade</button>
        </form>
      </div>
    </section>
  </>;
}
