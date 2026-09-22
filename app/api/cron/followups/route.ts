import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';

export async function GET(request:Request){
  const secret=process.env.CRON_SECRET;
  if(secret&&request.headers.get('authorization')!==`Bearer ${secret}`) return NextResponse.json({error:'unauthorized'},{status:401});

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!serviceKey) return NextResponse.json({error:'Supabase service role não configurada.'},{status:500});
  const supabase=createClient(url,serviceKey,{auth:{persistSession:false}});

  const {data:items,error}=await supabase.from('whatsapp_outbox')
    .select('id,to_phone,template_name,language_code')
    .eq('status','pending').lte('scheduled_for',new Date().toISOString()).order('scheduled_for').limit(30);
  if(error) return NextResponse.json({error:error.message},{status:500});

  let sent=0,failed=0;
  for(const item of items||[]){
    await supabase.from('whatsapp_outbox').update({status:'processing'}).eq('id',item.id).eq('status','pending');
    try{
      const providerId=await sendWhatsAppTemplate({to:item.to_phone,templateName:item.template_name,languageCode:item.language_code});
      await supabase.from('whatsapp_outbox').update({status:'sent',provider_message_id:providerId||null,sent_at:new Date().toISOString(),error_message:null}).eq('id',item.id);
      sent++;
    }catch(error){
      await supabase.from('whatsapp_outbox').update({status:'failed',error_message:error instanceof Error?error.message:'Falha desconhecida'}).eq('id',item.id);
      failed++;
    }
  }
  return NextResponse.json({processed:(items||[]).length,sent,failed});
}
