import React, { useEffect } from 'react'
import Hero from '../../Components/Hero/Hero'
import CategoryHome from '../../Components/CategoryHome/CategoryHome'
import FeatureListHome from '../../Components/FeatureListHome/FeatureListHome'
import FAQ from '../../Components/FAQ/FAQ'
import AboutUs from '../../Components/AboutUs/AboutUs'
import Services from '../../Components/Services/Services'
import Testimonial from '../../Components/Testimonial/Testimonial'
import HomeBanner from '../../Components/HomeInnerBanner/HomeBanner'
import OurValue from '../../Components/Value/OurValue'
import MetaTag from '../../Components/Meta/MetaTag'
import GetServicePopup from '../../Components/getservicepopup/GetServicePopup'
import UserApp from '../AppComponent/UserApp'
import CaseStudy from '../../Components/CaseStudy/CaseStudy'
import OurClient from '../../Components/OurClient/OurClient'

function Home() {
  const [isPopUp, setPopUp] = React.useState(false)

  const handlePopupActive = () => {
    setPopUp(true)
  }

  const handlePopupDeactive = () => {
    setPopUp(false)
  }

  useEffect(() => {
    handlePopupActive();
  }, []);


  return (
    <div>
      {
        isPopUp && (
          <GetServicePopup handlePopupDeactive={handlePopupDeactive} />
        )
      }
      <MetaTag title={'Premium HVAC & Energy Solutions by Blueace India - Eco-Friendly'} description={`Explore Blueace India's top-rated HVAC, solar, and EV cold room systems. Sustainable, efficient, and reliable. Get a Quote Today for tailored solutions!`}/>
      <Hero />
      <CategoryHome />
      <UserApp/>
      <FeatureListHome />
      <AboutUs />
      <OurValue />
      <Services />
      <HomeBanner />
      <CaseStudy />
      <FAQ />
      <OurClient />
      <Testimonial />
    </div>
  )
}

export default Home
