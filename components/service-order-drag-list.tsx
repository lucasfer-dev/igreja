'use client';

import { useState, useTransition } from 'react';
import { GripVertical, LoaderCircle } from 'lucide-react';
import { reorderServiceOrderItems } from '@/app/(protected)/service-order/actions';

type Item={id:string;title:string;item_type:string;position:number};
type Props={orderId:string;items:Item[]};

export function ServiceOrderDragList({orderId,items}:Props){
  const [ordered,setOrdered]=useState(items);
  const [dragId,setDragId]=useState<string|null>(null);
  const [isPending,startTransition]=useTransition();

  function move(draggedId:string,targetId:string){
    if(draggedId===targetId) return;
    const from=ordered.findIndex(item=>item.id===draggedId);
    const to=ordered.findIndex(item=>item.id===targetId);
    if(from<0||to<0) return;
    const next=[...ordered];
    const [moved]=next.splice(from,1);
    next.splice(to,0,moved);
    setOrdered(next);
    setDragId(null);
    startTransition(async()=>{
      await reorderServiceOrderItems(orderId,next.map(item=>item.id));
    });
  }

  if(ordered.length<2) return null;

  return <section className="service-drag-panel" aria-label="Reordenar momentos do culto">
    <div className="service-drag-head">
      <div><span className="section-eyebrow">Ordem rápida</span><strong>Arraste para reorganizar</strong><small>Os botões de subir/descer nos cards continuam disponíveis como alternativa acessível.</small></div>
      {isPending&&<span className="service-drag-saving"><LoaderCircle size={14}/> Salvando</span>}
    </div>
    <ol className="service-drag-list">
      {ordered.map((item,index)=><li
        key={item.id}
        draggable
        onDragStart={()=>setDragId(item.id)}
        onDragEnd={()=>setDragId(null)}
        onDragOver={event=>event.preventDefault()}
        onDrop={()=>dragId&&move(dragId,item.id)}
        className={dragId===item.id?'dragging':''}
      >
        <GripVertical size={16}/><span>{index+1}</span><strong>{item.title}</strong>
      </li>)}
    </ol>
  </section>;
}
