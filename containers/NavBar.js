// containers\NavBar.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react'; 
import config from '@/config/config';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to handle scroll for background change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect to close mobile menu on route change (or section click)
  useEffect(() => {
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a[href^="#"]');

    const handleLinkClick = () => {
      setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 100);
    };

    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    // Cleanup listeners
    return () => {
      mobileMenuLinks.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, []);


  return (

    // <nav className={`fixed w-full z-50 top-0 left-0 ${isScrolled ? 'bg-background/80 shadow-sm' : '_bg-transparent'}`}> // for changing transparency on scroll variant
    <nav className={`fixed w-full z-50 top-0 left-0 ${isScrolled ? 'bg-background/80 shadow-sm' : 'bg-background/80 shadow-sm'}`}>
      <div className={`container mx-auto px-4 sm:px-6 transition-colors duration-300`}>
        <div className="flex items-center justify-between h-16 lg:h-20 gap-x-4">

          {/* Logo & App Name */}
          <Link href="/" className="flex items-center z-10 flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}> 
            <Logo className="h-6 w-6 lg:h-10 lg:w-10 text-primary dark:text-sky-400" />
            <span className="ml-1 lg:ml-2 text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {config.appName} {/* Use appName from config */}
            </span>
          </Link>

          {/* Desktop Nav Links (Hidden on Mobile) */}
          <ul className="hidden lg:flex items-center space-x-6 ml-12 mr-auto">
            {/* <li><a href="#description" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-sky-400 font-medium transition-colors">Features</a></li> */}
            <li><a href="#faq" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-sky-400 font-medium transition-colors">FAQ</a></li>
            <li>
                <a href="/dashboard" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-sky-400 font-medium transition-colors border rounded-full border-primary dark:border-sky-400 px-4 py-2">
                    Dashboard
                </a>
            </li>
            <li>
                <a href="/proposals" className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-sky-400 font-medium transition-colors border rounded-full border-primary dark:border-sky-400 px-4 py-2">
                    Proposals
                </a>
            </li>
          </ul>

          {/* Right Section: Wallet Button & Mobile Toggle */}
          <div className="flex items-center space-x-2 z-10 flex-shrink-0">
            <div>
                 <appkit-button />
            </div>

            {/* Mobile Menu Toggle Button (Hidden on Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 text-gray-700 dark:text-gray-300 hover:bg-muted dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMobileMenuOpen ? "close" : "menu"}
                  initial={{ rotate: isMobileMenuOpen ? -180 : 0, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: isMobileMenuOpen ? 180 : 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                   {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div> 
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu-overlay" // Unique key for AnimatePresence
            initial={{ opacity: 0 }} // Starts transparent
            animate={{ opacity: 1 }} // Fades in
            exit={{ opacity: 0 }} // Fades out
            transition={{ duration: 0.3 }} // Animation duration
            // Mobile menu overlay should have a consistent transparency when open,
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" // Example: semi-transparent black background + blur
            onClick={() => setIsMobileMenuOpen(false)} // Close menu when clicking overlay
          >
            <motion.div
              key="mobile-menu-panel" // Unique key for AnimatePresence
              initial={{ x: '100%' }} // Starts off-screen to the right
              animate={{ x: '0%' }} // Slides in to position
              exit={{ x: '100%' }} // Slides out to the right
              transition={{ duration: 0.3, ease: 'easeOut' }} // Animation duration and easing
              className="fixed top-0 right-0 w-64 h-full bg-card shadow-lg p-6 z-50" // Keep layout/style classes. bg-card should be opaque.
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside sidebar from closing menu
            >
              <Button
                 variant="ghost"
                 size="icon"
                 className="absolute top-4 right-4 text-gray-700 dark:text-gray-300 hover:bg-muted dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                 onClick={() => setIsMobileMenuOpen(false)}
                 aria-label="Close menu"
               >
                 <X className="h-6 w-6" />
              </Button>

              {/* Mobile Nav Links */}
              <ul className="mt-12 space-y-4">
                  {/* <li><a href="#description" className="block text-gray-800 hover:text-primary dark:text-gray-200 dark:hover:text-sky-400 text-lg font-medium">Features</a></li> */}
                  <li><a href="#faq" className="block text-gray-800 hover:text-primary dark:text-gray-200 dark:hover:text-sky-400 text-lg font-medium">FAQ</a></li>
                  <li><a href="/dashboard" className="block text-gray-800 hover:text-primary dark:text-gray-200 dark:hover:text-sky-400 text-lg font-medium">Dashboard</a></li>
              </ul>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}