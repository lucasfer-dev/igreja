import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PIBJG',
    short_name: 'PIBJG',
    description: 'Ecossistema digital da Primeira Igreja Batista em Jardim Gláucia',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F2E6D7',
    theme_color: '#FF7100',
    lang: 'pt-BR',
    categories: ['lifestyle','social'],
  };
}
