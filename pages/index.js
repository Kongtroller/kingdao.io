// pages/index.js
// REMOVE: import Navbar from '@/containers/NavBar'; // Remove this import
import HeroSection from '@/containers/Hero';
// REMOVE: import Footer from '@/containers/Footer';    // Remove this import

export default function Home() {
  return (
    // Remove the flex-col min-h-screen px-0 mx-0 overflow-x-hidden here.
    // _app.js is handling the overall structure and min-height.
    // Keeping overflow-x-hidden might be necessary if you have other horizontal overflow issues,
    // but try removing it first to see if the layout behaves normally.
    <div className=""> {/* Use a simple wrapper div, or potentially remove this div if HeroSection is top-level */}
      {/* REMOVE: <Navbar/> */}
      {/* The <main className="flex-grow"> is handled by _app.js */}
      {/* The page content goes directly here */}
      <HeroSection/>
      {/* REMOVE: <Footer /> */}
    </div>
  )
}