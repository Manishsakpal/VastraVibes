const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-muted text-muted-foreground py-8 mt-12 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {currentYear} Vastra Vibes. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Designed with <span role="img" aria-label="love">❤️</span> for fashion enthusiasts.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
