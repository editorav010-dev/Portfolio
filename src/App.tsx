import ParticleBackground from './components/reactbits/ParticleBackground';
import Hero from './components/sections/Hero';
import Construction from './components/sections/Construction';
import Socials from './components/sections/Socials';
import Contact from './components/sections/Contact';
import { Nav, Ticker, Footer } from './components/Chrome';

export default function App() {
  return (
    <div className="grain relative min-h-screen">
      <ParticleBackground />
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Construction />
        <Socials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
