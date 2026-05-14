export type LinkCard = {
  kind: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export type LinkSection = {
  eyebrow?: string;
  title: string;
  description: string;
  items: LinkCard[];
};
