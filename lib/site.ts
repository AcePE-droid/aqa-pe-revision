/**
 * The site's canonical origin. `www` is deliberate: the apex `acepe.co.uk`
 * and the `aqa-pe-revision.vercel.app` deployment URL both 308-redirect here,
 * so this is the only host search engines should ever be told about.
 *
 * No trailing slash - every consumer appends its own path.
 */
export const SITE_URL = "https://www.acepe.co.uk";
