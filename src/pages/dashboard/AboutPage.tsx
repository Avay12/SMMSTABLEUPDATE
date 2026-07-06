import telegramLogo from "@/assets/telegram-logo.png";
import instagramLogo from "@/assets/instagram-logo.png";
import facebookLogo from "@/assets/facebook-logo.png";
import emailIcon from "@/assets/email-icon.png";
import phoneIcon from "@/assets/phone-icon.png";

const AboutPage = () => (
  <div>
    <h1 className="text-xl sm:text-2xl font-bold mb-1">About Us</h1>
    <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Learn more about Smmstable</p>
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gradient-premium mb-3">Smmstable</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Smmstable is a leading social media marketing platform that provides high-quality services at the most affordable prices.
          We support all major platforms including Instagram, TikTok, YouTube, Twitter, Facebook, Telegram, and more.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-semibold mb-3">Why Choose Us?</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">Cheapest prices on the market</li>
          <li className="flex items-start gap-3">Instant order delivery</li>
          <li className="flex items-start gap-3">24/7 customer support</li>
          <li className="flex items-start gap-3">High quality services with real engagement</li>
          <li className="flex items-start gap-3">Secure wallet payments via OxaPay</li>
          <li className="flex items-start gap-3">API access for resellers</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-semibold mb-4">Contact</h2>
        <div className="space-y-4">
          <a href="mailto:support@smmstable.com" className="flex items-center gap-3 group">
            <img src={emailIcon} alt="Email" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <span className="text-sm font-medium text-primary group-hover:underline">support@smmstable.com</span>
            </div>
          </a>
          <a href="tel:+16414358478" className="flex items-center gap-3 group">
            <img src={phoneIcon} alt="Phone" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <span className="text-sm font-medium text-primary group-hover:underline">+1 (641) 435-8478</span>
            </div>
          </a>
          <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <img src={telegramLogo} alt="Telegram" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
            <div>
              <div className="text-xs text-muted-foreground">Telegram</div>
              <span className="text-sm font-medium text-primary group-hover:underline">@smmstable</span>
            </div>
          </a>
          <a href="https://instagram.com/smmstable" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <img src={instagramLogo} alt="Instagram" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
            <div>
              <div className="text-xs text-muted-foreground">Instagram</div>
              <span className="text-sm font-medium text-primary group-hover:underline">@smmstable</span>
            </div>
          </a>
          <a href="https://facebook.com/smmstable" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <img src={facebookLogo} alt="Facebook" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
            <div>
              <div className="text-xs text-muted-foreground">Facebook</div>
              <span className="text-sm font-medium text-primary group-hover:underline">Smmstable</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
