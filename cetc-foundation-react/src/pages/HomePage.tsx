import HomeCertificate from '../components/home/HomeCertificate';
import HomeHero from '../components/home/HomeHero';
import HomePartners from '../components/home/HomePartners';
import HomeSteps from '../components/home/HomeSteps';
import HomeTrades from '../components/home/HomeTrades';

function HomePage() {
  return (
    <div className="page home-page">
      <div className="home-block home-block-hero">
        <HomeHero />
      </div>
      <div className="home-block home-block-flow">
        <HomeSteps />
      </div>
      <div className="home-block home-block-trades">
        <HomeTrades />
      </div>
      <div className="home-block home-block-certificate">
        <HomeCertificate />
      </div>
      <div className="home-block home-block-partners">
        <HomePartners />
      </div>
    </div>
  );
}

export default HomePage;
