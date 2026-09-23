export type MessageTemplateInput={
  to:string;
  templateName:string;
  languageCode?:string;
};

export type MessageTextInput={
  to:string;
  body:string;
};

export interface MessagingProvider {
  sendTemplate(input:MessageTemplateInput):Promise<string|undefined>;
  sendMessage?(input:MessageTextInput):Promise<string|undefined>;
  sendInvitation?(input:MessageTemplateInput):Promise<string|undefined>;
}

export function normalizeWhatsAppPhone(value:string){
  const digits=value.replace(/\D/g,'');
  if(!digits) return '';
  return digits.startsWith('55')?digits:'55'+digits;
}

export function whatsappLink(phone:string|undefined|null,message:string){
  const normalized=phone?normalizeWhatsAppPhone(phone):'';
  const base=normalized?'https://wa.me/'+normalized:'https://wa.me/';
  return base+'?text='+encodeURIComponent(message);
}

class WhatsAppCloudProvider implements MessagingProvider {
  async sendTemplate(input:MessageTemplateInput){
    const token=process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
    const phoneNumberId=process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version=process.env.WHATSAPP_GRAPH_API_VERSION||'v25.0';
    if(!token||!phoneNumberId) throw new Error('WhatsApp Cloud API não configurada.');

    const response=await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`,{
      method:'POST',
      headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        messaging_product:'whatsapp',
        to:normalizeWhatsAppPhone(input.to),
        type:'template',
        template:{name:input.templateName,language:{code:input.languageCode||'pt_BR'}}
      })
    });
    const payload=await response.json();
    if(!response.ok) throw new Error(payload?.error?.message||'Falha ao enviar mensagem no WhatsApp.');
    return payload?.messages?.[0]?.id as string|undefined;
  }

  async sendInvitation(input:MessageTemplateInput){
    return this.sendTemplate(input);
  }
}

let provider:MessagingProvider|undefined;

export function getMessagingProvider():MessagingProvider{
  if(!provider) provider=new WhatsAppCloudProvider();
  return provider;
}

export async function sendWhatsAppTemplate(input:MessageTemplateInput){
  return getMessagingProvider().sendTemplate(input);
}
