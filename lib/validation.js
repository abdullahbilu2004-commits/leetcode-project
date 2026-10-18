import { z } from "zod";
import { LANG_KEYS } from "@/lib/languages";

const slug = z.string().regex(/^[a-z0-9-]{1,120}$/);
const language = z.enum(LANG_KEYS);
const code = z.string().min(1).max(65536);

export const runSchema = z.object({ slug, language, code, stdin: z.string().max(16384).default("") });
export const submitSchema = z.object({ slug, language, code });
export const draftSchema = z.object({ language, code: z.string().max(65536) });
export const testCasesSchema = z.object({
  slug,
  compareMode: z.enum(["tokens", "exact", "float"]).default("tokens"),
  cases: z.array(z.object({
    input: z.string().max(16384),
    expected: z.string().max(16384),
    isSample: z.boolean().default(false),
  })).min(1).max(50),
});
export { language as languageSchema };
