import { Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

  return (
    <footer className="bg-muted text-muted-foreground py-8 mt-12 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">Need Help?</h3>
          <p className="text-sm mb-4">Contact us for any questions or support.</p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span>{contactEmail}</span>
              </a>
            )}
            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <span>{contactPhone}</span>
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 mt-6">
          <p className="text-sm">
            &copy; {currentYear} Vastra Vibes. All rights reserved.
          </p>
          <p className="text-xs mt-1">
            Designed with <span role="img" aria-label="love">❤️</span> for fashion enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
