import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { scrollToTopNow } from './lib/smoothScroll.js'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Home from './pages/Home.jsx'
import ModelDetail from './pages/ModelDetail.jsx'
import Models from './pages/Models.jsx'
import Services from './pages/Services.jsx'

// every new page starts at the top (links with #section handle their own scrolling)
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) scrollToTopNow()
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/models" element={<Models />} />
        <Route path="/models/:category" element={<Models />} />
        <Route path="/model/:slug" element={<ModelDetail />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  )
}
