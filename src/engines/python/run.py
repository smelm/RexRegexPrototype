
import re
import sys
import json

inp = list(sys.stdin)
assert len(inp) == 1

inp = json.loads(inp[0].strip())
match = re.search(inp["regex"], inp["input"])

output = json.dumps({ "matches": bool(match) })

print(output)
