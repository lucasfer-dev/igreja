'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, MessageCircle, Send, UserRound } from 'lucide-react';

type Member={id:string;fullName:string;phone:string};
type Event={id:string;title:string;startsAt:string;address?:string|null};

export function WhatsAppInviteComposer({
  churchName,
  members,
  events,
}:{churchName:string;members:Member[];events:Event[]}) {
  const [memberId,setMemberId]=useState(members[0]?.id||'');
  const [eventId,setEventId]=useState(events[0]?.id||'');

  const member=members.find(item=>item.id===memberId);
  const event=events.find(item=>item.id===eventId);

  const message=useMemo(()=>{
    if(!event) return '';
    return `Olá${member?.fullName ? ` ${member.fullName.split(' ')[0]}` : ''}! A ${churchName} quer convidar você para ${event.title}, em ${new Date(event.startsAt).toLocaleString('pt-BR')}${event.address ? ` — ${event.address}` : ''}. Será muito bom ter você com a gente!`;
  },[churchName,event,member]);

  const link=member&&event
    ? `https://wa.me/${member.phone.replace(/\D/g,'').replace(/^0+/,'').replace(/^(?!55)/,'55')}?text=${encodeURIComponent(message)}`
    : '#';

  return <div className="whatsapp-invite-composer">
    <div className="whatsapp-invite-fields">
      <label>
        <span><UserRound size={14}/> Membro</span>
        <select value={memberId} onChange={e=>setMemberId(e.target.value)} disabled={!members.length}>
          {members.length?members.map(item=><option key={item.id} value={item.id}>{item.fullName}</option>):<option>Nenhum membro com WhatsApp</option>}
        </select>
      </label>
      <label>
        <span><CalendarDays size={14}/> Evento</span>
        <select value={eventId} onChange={e=>setEventId(e.target.value)} disabled={!events.length}>
          {events.length?events.map(item=><option key={item.id} value={item.id}>{item.title}</option>):<option>Nenhum evento futuro</option>}
        </select>
      </label>
    </div>

    <div className="whatsapp-invite-preview">
      <span><MessageCircle size={16}/></span>
      <div>
        <small>Prévia do convite</small>
        <p>{message||'Selecione um membro e um evento para gerar o convite.'}</p>
      </div>
    </div>

    <a
      className={member&&event?'whatsapp-send-button':'whatsapp-send-button disabled'}
      href={member&&event?link:undefined}
      target="_blank"
      rel="noreferrer"
      aria-disabled={!member||!event}
    >
      <Send size={15}/> Abrir convite no WhatsApp
    </a>
    <small className="field-help">O envio abre a conversa do membro com a mensagem pronta. Automações de follow-up continuam usando a WhatsApp Cloud API.</small>
  </div>;
}
