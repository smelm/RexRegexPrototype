ls */*.{ts,peg} | entr -c -s "npm run build && npm test"
