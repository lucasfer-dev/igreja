'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Radio, Volume2, VolumeX } from 'lucide-react';
import styles from './member-shell.module.css';

type Props={
  src:string;
  name:string;
};

export function MemberRadioPlayer({src,name}:Props){
  const audioRef=useRef<HTMLAudioElement>(null);
  const [playing,setPlaying]=useState(false);
  const [muted,setMuted]=useState(false);

  useEffect(()=>{
    const audio=audioRef.current;
    if(!audio) return;
    const onPause=()=>setPlaying(false);
    const onPlay=()=>setPlaying(true);
    audio.addEventListener('pause',onPause);
    audio.addEventListener('play',onPlay);
    return ()=>{
      audio.removeEventListener('pause',onPause);
      audio.removeEventListener('play',onPlay);
    };
  },[]);

  async function togglePlayback(){
    const audio=audioRef.current;
    if(!audio) return;
    if(audio.paused){
      try{await audio.play();}catch{return;}
    }else{
      audio.pause();
    }
  }

  function toggleMuted(){
    const audio=audioRef.current;
    if(!audio) return;
    audio.muted=!audio.muted;
    setMuted(audio.muted);
  }

  return <aside id="radio-player" className={styles.radioPlayer} aria-label="Rádio da igreja">
    <audio ref={audioRef} src={src} preload="none"/>
    <span className={styles.radioStatus}><Radio size={14}/><i/> AO VIVO</span>
    <div className={styles.radioCopy}><strong>{name}</strong><small>Rádio da igreja</small></div>
    <button type="button" onClick={togglePlayback} aria-label={playing?'Pausar rádio':'Ouvir rádio'}>{playing?<Pause size={17}/>:<Play size={17}/>}</button>
    <button type="button" onClick={toggleMuted} aria-label={muted?'Ativar som':'Silenciar rádio'}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button>
  </aside>;
}
