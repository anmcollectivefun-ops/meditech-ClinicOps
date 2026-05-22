import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'ANM Planner | Zorganizuj Swój Wymarzony Event za 0 zł',
  description: 'Darmowy planer ślubny i eventowy online. Zarządzaj listą gości, kontroluj budżet, monitoruj zadania i stwórz e-zaproszenie. Sprawdź!',
  openGraph: {
    title: 'ANM Planner | Wirtualny Organizer',
    description: 'Cała moc planera w Twojej kieszeni. Zaplanuj z nami każdy detal.',
    url: 'https://anmcollective.fun', 
    type: 'website',
  },
};

export default function Page() {
  // Ten kod ładuje Twój dotychczasowy wygląd strony
  return <HomeClient />;
}