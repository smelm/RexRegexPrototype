
import re
import sys

inp = list(sys.stdin)

assert len(inp) == 1

regex, input = inp[0].split("SEP")

match = re.search(regex, input)

if match:
    print(1)
else:
    print(0)
