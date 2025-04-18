export const SiteConfig = {
  title: "Les délices d'Erwann",
  description: "Click and collect pour les délices d'Erwann",
  prodUrl: "https://les-delices-d-erwann.vercel.app",
  domain: "les-delices-d-erwann.vercel.app",
  appIcon: "/images/icon.png",
  company: {
    name: "Les délices d'Erwann",
    address: "", // Remove if not needed
  },
  brand: {
    primary: "#007291", // You can adjust this to your brand color
  },
  team: {
    image: "",
    website: "https://miharisoa.fr",
    twitter: "",
    name: "Miharisoa",
  },
  features: {
    /**
     * If enable, you need to specify the logic of upload here : src/features/images/uploadImageAction.tsx
     * You can use Vercel Blob Storage : https://vercel.com/docs/storage/vercel-blob
     * Or you can use Cloudflare R2 : https://mlv.sh/cloudflare-r2-tutorial
     * Or you can use AWS S3 : https://mlv.sh/aws-s3-tutorial
     */
    enableImageUpload: false as boolean,
    /**
     * If enable, the user will be redirected to `/orgs` when he visits the landing page at `/`
     * The logic is located in middleware.ts
     */
    enableLandingRedirection: true as boolean,
  },
};
