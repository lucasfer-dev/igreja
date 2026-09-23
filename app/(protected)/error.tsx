'use client';

import { useEffect } from 'react';

export default function ProtectedError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
  useEffect(()=>{console.error(error);},[error]);

  return <section className="module-empty-state" role="alert">
    <h2>Não foi possível carregar esta área</h2>
    <p>Ocorreu um erro inesperado. Tente novamente; se continuar, a equipe pode verificar o código de diagnóstico.</p>
    {error.digest&&<small>Código: {error.digest}</small>}
    <button type="button" className="module-primary" onClick={reset}>Tentar novamente</button>
  </section>;
}
