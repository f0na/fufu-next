interface FooterLink {
  label: string;
  href: string;
}

const footer_links: FooterLink[] = [
  { label: "备案号", href: "#" },
  { label: "许可证", href: "#" },
  { label: "隐私政策", href: "#" },
];

export function Footer() {
  const current_year = new Date().getFullYear();

  return (
    <footer className="w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <p className="text-sm text-muted-foreground">
            ©{current_year} fufu all
          </p>
          <nav className="flex items-center gap-4">
            {footer_links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}