import json
from collections import Counter
import re

def tokens(text):
    return re.findall(r"[a-zA-Z0-9_]+", text.lower())

with open("c:/Users/Public/My Agent/telegraph-h2/eval-data/pairs_sanctions_v4.jsonl", "r", encoding="utf-8") as f:
    rows = [json.loads(line) for line in f if line.strip()]

chosen_toks = Counter()
rejected_toks = Counter()

for r in rows:
    c = r.get("better") or r.get("chosen")
    w = r.get("worse") or r.get("rejected")
    for t in set(tokens(c)): chosen_toks[t] += 1
    for t in set(tokens(w)): rejected_toks[t] += 1

print("Top words predominantly in chosen:")
diff_c = {k: v - rejected_toks.get(k, 0) for k, v in chosen_toks.items()}
for k, v in sorted(diff_c.items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f"  {k:20s}: chosen={chosen_toks[k]:3d}, rejected={rejected_toks.get(k, 0):3d} (diff={v:+d})")

print("\nTop words predominantly in rejected:")
diff_r = {k: v - chosen_toks.get(k, 0) for k, v in rejected_toks.items()}
for k, v in sorted(diff_r.items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f"  {k:20s}: chosen={chosen_toks.get(k, 0):3d}, rejected={rejected_toks[k]:3d} (diff={v:+d})")
