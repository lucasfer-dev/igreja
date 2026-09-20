export default function Loading(){
  return <div className="route-loading" aria-live="polite" aria-label="Carregando conteúdo">
    <div className="route-loading-head"><span/><span/></div>
    <div className="route-loading-cards">{Array.from({length:4}).map((_,i)=><span key={i}/>)}</div>
    <div className="route-loading-panel"><span/><span/><span/><span/><span/></div>
  </div>;
}
