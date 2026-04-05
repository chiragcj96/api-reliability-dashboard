import type { CreateServiceInput } from "@/lib/types";

export const defaultServices: CreateServiceInput[] = [
  {
    name: "Hacker News Search API",
    url: "https://hn.algolia.com/api/v1/search?query=ai"
  },
  {
    name: "Open-Meteo Weather API",
    url: "https://api.open-meteo.com/v1/forecast?latitude=1.29&longitude=103.85&current_weather=true"
  },
  {
    name: "GitHub Public API",
    url: "https://api.github.com/repos/vercel/next.js"
  },
  {
    name: "Public Countries API",
    url: "https://restcountries.com/v3.1/name/singapore"
  }
];
