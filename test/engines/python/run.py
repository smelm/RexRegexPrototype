
import re
import sys

inp = list(sys.stdin)

assert len(inp) == 1

regex, input = inp[0].split("SEP")

result = re.match(regex, input)

print(result.span())
print(bool(result))
