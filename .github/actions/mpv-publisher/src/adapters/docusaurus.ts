import { access, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DocumentationEngineAdapter } from "../types.js";
import { replaceDirectory, resolveInside } from "../fs.js";

async function exists(file: string) {
  try { await access(file); return true; } catch { return false; }
}

export const docusaurusAdapter: DocumentationEngineAdapter = {
  key: "docusaurus",
  async materialize({ siteDir, templateDir, manifest, publication }) {
    const docsSource = resolveInside(siteDir, publication.content.docsSourcePath);
    const docsTarget = resolveInside(templateDir, manifest.content.docsTarget);
    await replaceDirectory(docsSource, docsTarget);

    if (publication.content.staticSourcePath && manifest.content.staticTarget) {
      const staticSource = resolveInside(siteDir, publication.content.staticSourcePath);
      if (await exists(staticSource)) await replaceDirectory(staticSource, resolveInside(templateDir, manifest.content.staticTarget));
    }

    const envFile = path.join(templateDir, ".env.production");
    await writeFile(envFile, [
      `DOCS_TITLE=${JSON.stringify(publication.publication.title)}`,
      `DOCS_SITE_URL=${JSON.stringify(publication.publication.siteUrl)}`,
      `DOCS_BASE_PATH=${JSON.stringify(publication.publication.basePath)}`,
      `DOCS_PORTAL_NAME=${JSON.stringify(publication.portal.name)}`,
      `DOCS_PORTAL_URL=${JSON.stringify(publication.portal.url)}`,
      "",
    ].join("\n"));
  },
};
