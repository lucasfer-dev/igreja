'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const interestValues = ['small_group','baptism','pastoral_visit','ministry','just_visiting'] as const;

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  phone: z.string().trim().min(10).max(25),
  visit_status: z.enum(['first_time','returning']),
  location_status: z.enum(['local','other_city']),
  prayer_request: z.string().trim().max(2000).optional().or(z.literal('')),
  whatsapp_opt_in: z.boolean(),
  lgpd_consent: z.literal(true),
  interests: z.array(z.enum(interestValues)).max(5),
  website: z.string().max(0),
});

export async function submitConnection(formData: FormData) {
  const parsed = schema.safeParse({
    full_name: formData.get('full_name'),
    birth_date: formData.get('birth_date') || '',
    phone: formData.get('phone'),
    visit_status: formData.get('visit_status'),
    location_status: formData.get('location_status'),
    prayer_request: formData.get('prayer_request') || '',
    whatsapp_opt_in: formData.get('whatsapp_opt_in') === 'on',
    lgpd_consent: formData.get('lgpd_consent') === 'on',
    interests: formData.getAll('interests').map(String),
    website: String(formData.get('website') || ''),
  });

  if (!parsed.success) {
    redirect('/conectar?error=' + encodeURIComponent('Revise os campos obrigatórios e confirme a autorização de uso dos dados.'));
  }

  const admin = createAdminClient();
  const slug = process.env.PUBLIC_CHURCH_SLUG || process.env.NEXT_PUBLIC_PUBLIC_CHURCH_SLUG || 'pibjg';
  const { data: church } = await admin.from('churches').select('id,name').eq('slug', slug).maybeSingle();

  if (!church) {
    redirect('/conectar?error=' + encodeURIComponent('O cartão de conexão está temporariamente indisponível.'));
  }

  const now = new Date();
  const consentAt = now.toISOString();
  const { data: visitor, error } = await admin.from('visitors').insert({
    church_id: church.id,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    birth_date: parsed.data.birth_date || null,
    visit_status: parsed.data.visit_status,
    location_status: parsed.data.location_status,
    interests: parsed.data.interests,
    prayer_request: parsed.data.prayer_request || null,
    source: 'cartao_conexao',
    stage: 'new',
    first_visit_at: now.toISOString().slice(0, 10),
    whatsapp_opt_in: parsed.data.whatsapp_opt_in,
    whatsapp_opt_in_at: parsed.data.whatsapp_opt_in ? consentAt : null,
    lgpd_consent: true,
    lgpd_consent_at: consentAt,
  }).select('id,phone,whatsapp_opt_in').single();

  if (error || !visitor) {
    redirect('/conectar?error=' + encodeURIComponent('Não foi possível enviar agora. Tente novamente em instantes.'));
  }

  if (parsed.data.prayer_request) {
    await admin.from('visitor_care_requests').insert({
      church_id: church.id,
      visitor_id: visitor.id,
      body: parsed.data.prayer_request,
      status: 'new',
      confidential: true,
    });
  }

  if (visitor.phone && visitor.whatsapp_opt_in) {
    const { data: rules } = await admin.from('whatsapp_followup_rules')
      .select('id,delay_hours,template_name,language_code')
      .eq('church_id', church.id)
      .eq('trigger_stage', 'new')
      .eq('active', true);

    if (rules?.length) {
      await admin.from('whatsapp_outbox').insert(rules.map(rule => ({
        church_id: church.id,
        visitor_id: visitor.id,
        rule_id: rule.id,
        to_phone: visitor.phone,
        template_name: rule.template_name,
        language_code: rule.language_code,
        scheduled_for: new Date(now.getTime() + rule.delay_hours * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      })));
    }
  }

  redirect('/conectar/sucesso');
}
