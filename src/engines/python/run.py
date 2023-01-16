
import re
import sys
import json

inp = list(sys.stdin)
assert len(inp) == 1

inp = json.loads(inp[0].strip())
match = re.search(inp["regex"], inp["input"])

if not match:
    output = json.dumps({ "matches": False})
else:
    output = json.dumps({ "matches": bool(match), "groups": match.groupdict()})

print(output)
