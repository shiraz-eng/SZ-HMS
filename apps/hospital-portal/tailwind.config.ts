import type { Config } from "tailwindcss";
import preset from "@szhms/ui/tailwind-preset";

export default {
  presets: [preset],
  content: [
    "./src/**/*.{ts,tsx}",
    // Scan the shared design system so its utility classes are not purged.
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
