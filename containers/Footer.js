//containers\Footer.js
"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import config from "@/config/config";
import { Separator } from "@/components/ui/separator";
import { Globe } from "lucide-react";
import DiscordIcon from "@/components/icons/DiscordIcon";
import OpenseaIcon from "@/components/icons/OpenseaIcon";
import TwitterIcon from "@/components/icons/TwitterIcon";

export default function Footer() {
  return (
    <section className="relative bg-slate-100 dark:bg-gray-950">
      <footer className="border-t border-muted px-4 pt-16 pb-4 text-foreground">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between gap-12">
            {/* Branding/Description (left) */}
            <div className="max-w-md space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Logo className="h-7 w-7 md:h-8 md:w-8 text-primary dark:text-sky-400" />
                <span className="text-xl font-bold text-primary dark:text-sky-400">
                  {config.appName}
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {config.appDescription}
              </p>
              {/* Social Media Icons */}
              <div className="flex items-center gap-4 mt-2">
                {config.website && (
                  <a
                    href={config.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Website"
                    className="text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Globe className="h-6 w-6 text-inherit group-hover:text-primary transition-colors" />
                  </a>
                )}
                {config.x && (
                  <a
                    href={config.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    className="text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <TwitterIcon className="h-6 w-6 text-inherit group-hover:text-primary transition-colors" />
                  </a>
                )}
                {config.discord && (
                  <a
                    href={config.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className="text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <DiscordIcon className="h-6 w-6 text-inherit group-hover:text-primary transition-colors" />
                  </a>
                )}
                {config.openSea && (
                  <a
                    href={config.openSea}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Opensea"
                    className="text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <OpenseaIcon className="h-6 w-6 text-inherit group-hover:text-primary transition-colors" />
                  </a>
                )}
              </div>
            </div>

            {/* Links (Explore + Legal, grouped right) */}
            <div className="flex flex-col sm:flex-row gap-8 md:gap-12 md:justify-end w-full md:w-auto">
              {/* Explore */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Explore</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {config.exploreLinks?.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-foreground transition-colors"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    <Link href="/privacy" className="hover:underline hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:underline hover:text-foreground transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Divider */}
          <Separator className="bg-muted" />

          {/* Copyright */}
          <div className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <a
              href={`https://${config.domainName}`}
              className="hover:underline transition-colors"
            >
              {config.appName}
            </a>
            . All Rights Reserved.
          </div>
        </div>
      </footer>
    </section>
  );
}
