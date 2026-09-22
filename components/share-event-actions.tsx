'use client';

import { MessageCircle, Share2 } from 'lucide-react';

type Props={title:string;text:string;whatsappUrl:string};

export function ShareEventActions({title,text,whatsappUrl}:Props){
  async function share(){
    if(typeof navigator!=='undefined'&&navigator.share){
      try{
        await navigator.share({title,text,url:window.location.href});
        return;
      }catch(error){
        if(error instanceof DOMException&&error.name==='AbortError') return;
      }
    }
    window.open(whatsappUrl,'_blank','noopener,noreferrer');
  }

  return <>
    <button className="module-secondary" type="button" onClick={share}><Share2 size={15}/> Compartilhar</button>
    <a className="module-secondary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={15}/> WhatsApp</a>
  </>;
}
