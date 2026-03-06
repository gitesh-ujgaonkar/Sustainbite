import React from 'react';
import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { CertificateVerification } from '@/components/certificate-verification';
import { Leaf, Users, Target, Award } from 'lucide-react';

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border p-6 hover:border-primary/50 transition-colors">
      <Icon className="h-8 w-8 text-primary mb-3" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How SustainBite Works</h2>
            <p className="text-muted-foreground">
              Three simple steps to make a real difference in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={Leaf}
              title="Donors List Food"
              description="Restaurants and individuals post available surplus food with details like quantity, type, and pickup time."
            />
            <FeatureCard
              icon={Users}
              title="Volunteers Connect"
              description="Our volunteers find nearby donations and confirm pickup. They deliver to verified NGOs and communities in need."
            />
            <FeatureCard
              icon={Target}
              title="Impact Delivered"
              description="NGOs receive verified food donations. Everyone earns Green Points and builds their SustainBite certificate."
            />
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2K+</div>
              <p className="text-muted-foreground">Meals Delivered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">500+</div>
              <p className="text-muted-foreground">Active Volunteers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">80+</div>
              <p className="text-muted-foreground">Partner Organizations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">15K+</div>
              <p className="text-muted-foreground">Families Supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everyone Can Help</h2>
            <p className="text-muted-foreground">
              Whether you have surplus food, spare time, or run an organization, there's a role for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-xl border border-border p-8 hover:border-primary/50 transition-colors hover:shadow-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Donors</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share your surplus food from restaurants or homes. Earn Green Points and certificates for your impact.
              </p>
              <ul className="text-sm space-y-1">
                <li>✓ List food in minutes</li>
                <li>✓ Automatic volunteer assignment</li>
                <li>✓ Tax deductions</li>
              </ul>
            </div>

            <div className="rounded-xl border border-primary/50 bg-primary/5 p-8 shadow-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Volunteers</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the bridge! Pick up food donations and deliver them to those in need. Get recognition and rewards.
              </p>
              <ul className="text-sm space-y-1">
                <li>✓ Flexible scheduling</li>
                <li>✓ Real-time task updates</li>
                <li>✓ Build your portfolio</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border p-8 hover:border-primary/50 transition-colors hover:shadow-lg">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">NGOs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Register your organization and receive verified food donations based on your current needs.
              </p>
              <ul className="text-sm space-y-1">
                <li>✓ Set hunger status</li>
                <li>✓ Track deliveries</li>
                <li>✓ Generate reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Verification Section */}
      <CertificateVerification />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container max-w-2xl text-center">
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join SustainBite today and become part of a community fighting food waste and hunger.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/signup" className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Get Started Now
            </a>
            <a href="/login" className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-border font-semibold hover:bg-muted transition-colors">
              Already a Member? Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg text-primary mb-4">
                <Leaf className="h-5 w-5" />
                SustainBite
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting food with purpose, waste with hope.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SustainBite. All rights reserved. Building solutions for food waste and hunger.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
