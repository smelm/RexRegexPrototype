
import re
import sys

inp = list(sys.stdin)

assert len(inp) == 1

regex, input = inp[0].split("SEP")

match = re.search(regex, input)

if match:
    print(1)
    print(match.start())
    print(match.end())
else:
    print(0)
