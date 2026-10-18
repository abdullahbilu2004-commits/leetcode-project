// Provider module. LeetCode GraphQL is NOT an official public API; it may change or rate-limit.
// To switch data source, re-implement these four exports only.
import sanitizeHtml from "sanitize-html";

const ENDPOINT = "https://leetcode.com/graphql";
const BASE = "https://leetcode.com/problems";

async function gql(query, variables = {}, attempt = 0) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({ query, variables }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return gql(query, variables, attempt + 1);
    }
    if (!res.ok) throw new Error(`LeetCode responded ${res.status}`);
    const body = await res.json();
    if (body.errors?.length) throw new Error(body.errors[0].message || "GraphQL error");
    return body.data;
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "LeetCode request timed out" : e.message);
  } finally {
    clearTimeout(t);
  }
}

const RANK = { Easy: 1, Medium: 2, Hard: 3 };

export async function fetchProblemPage(skip = 0, limit = 100) {
  const data = await gql(
    `query list($skip:Int,$limit:Int){
      problemsetQuestionList: questionList(categorySlug:"", limit:$limit, skip:$skip, filters:{}){
        total: totalNum
        questions: data { frontendQuestionId: questionFrontendId title titleSlug difficulty isPaidOnly topicTags { name } }
      }}`,
    { skip, limit }
  );
  const list = data?.problemsetQuestionList;
  if (!list) throw new Error("Unexpected response shape from LeetCode");
  return {
    total: list.total,
    items: list.questions.map((q) => ({
      frontendId: Number(q.frontendQuestionId),
      slug: q.titleSlug,
      title: q.title,
      difficulty: q.difficulty,
      difficultyRank: RANK[q.difficulty] || 0,
      isPaidOnly: !!q.isPaidOnly,
      tags: (q.topicTags || []).map((t) => t.name),
      url: `${BASE}/${q.titleSlug}/`,
    })),
  };
}

export async function fetchProblemDetail(slug) {
  const data = await gql(
    `query q($slug:String!){ question(titleSlug:$slug){
      content hints exampleTestcases isPaidOnly
      codeSnippets { lang langSlug code } } }`,
    { slug }
  );
  const q = data?.question;
  if (!q) return null;
  return {
    isPaidOnly: !!q.isPaidOnly,
    // content is null for premium problems: we store nothing rather than invent it.
    contentHtml: q.content
      ? sanitizeHtml(q.content, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "sup", "sub", "u"]),
          allowedAttributes: { img: ["src", "alt", "width", "height"], "*": ["class"] },
          allowedSchemes: ["https", "http"],
        })
      : null,
    hints: (q.hints || []).map((h) => sanitizeHtml(h)),
    exampleTestcases: q.exampleTestcases || null,
    codeSnippets: q.codeSnippets || [],
  };
}

export async function fetchDailySlug() {
  const data = await gql(`query { activeDailyCodingChallengeQuestion { date question { titleSlug } } }`);
  return data?.activeDailyCodingChallengeQuestion?.question?.titleSlug || null;
}
