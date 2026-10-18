// Safe to import on client and server (no secrets here).
export const LANGUAGES = {
  javascript: { label: "JavaScript", monaco: "javascript", leetSlug: "javascript" },
  python: { label: "Python 3", monaco: "python", leetSlug: "python3" },
  java: { label: "Java", monaco: "java", leetSlug: "java" },
  cpp: { label: "C++", monaco: "cpp", leetSlug: "cpp" },
};
export const LANG_KEYS = Object.keys(LANGUAGES);

// Neutral stdin->stdout programs. Used only when LeetCode provides no starter code for that language.
export const GENERIC_TEMPLATES = {
  javascript: `const input = require("fs").readFileSync(0, "utf8");\nconsole.log(input.trim());\n`,
  python: `import sys\n\ndata = sys.stdin.read()\nprint(data.strip())\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(sc.hasNextLine() ? sc.nextLine() : "");\n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    cout << line << endl;\n    return 0;\n}\n`,
};
