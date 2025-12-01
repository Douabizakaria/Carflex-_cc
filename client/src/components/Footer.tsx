import { Link } from "wouter";
import { Car } from "lucide-react";
import { SiStripe, SiFacebook, SiX, SiInstagram, SiLinkedin } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Carflex</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Flexible car subscriptions with no long-term commitment. Drive the car you want, when you want it.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-facebook">
                <SiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-twitter">
                <SiX className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-instagram">
                <SiInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-linkedin">
                <SiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide">Packs</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/packs" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-budget">
                  Budget Pack
                </Link>
              </li>
              <li>
                <Link href="/packs" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-midrange">
                  Midrange Pack
                </Link>
              </li>
              <li>
                <Link href="/packs" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-luxury">
                  Luxury Pack
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get updates on new vehicles and exclusive offers.
            </p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" data-testid="input-newsletter" />
              <Button data-testid="button-subscribe">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Carflex. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Secured by</span>
              <SiStripe className="h-6 w-12 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
