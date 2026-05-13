import type { LinkSection } from "@/config/contextualLinkTypes";
import { getDeudaArticleSections } from "@/config/deudaClusterLinks";
import { getPensionArticleSections } from "@/config/pensionClusterLinks";
import { getSueldoArticleSections } from "@/config/sueldoClusterLinks";

type ArticleSectionResolver = (slug: string) => LinkSection[];

const articleSectionResolvers: ArticleSectionResolver[] = [
  getSueldoArticleSections,
  getDeudaArticleSections,
  getPensionArticleSections,
];

export function getArticleContextualSections(slug: string): LinkSection[] {
  return articleSectionResolvers.flatMap(resolveSections =>
    resolveSections(slug)
  );
}