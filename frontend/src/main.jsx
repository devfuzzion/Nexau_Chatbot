import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Header from './assets/components/header/page.jsx'
import Body from './assets/components/body/page.jsx'
import Footer from './assets/components/footer/page.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header/>
    <Body/>
    <Footer/>
  </StrictMode>,
)
