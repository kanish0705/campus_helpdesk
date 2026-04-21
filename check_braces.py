import re

with open('index.html', encoding='utf-8') as f:
    content = f.read()

open_br = len(re.findall(r'\{', content))
close_br = len(re.findall(r'\}', content))

print(f'Opening braces: {open_br}')
print(f'Closing braces: {close_br}')
print(f'Difference: {open_br - close_br}')

if open_br != close_br:
    print("\n⚠️ BRACES ARE UNBALANCED!")
    print("Looking for the mismatch...")
    
    # Find lines with unbalanced braces
    lines = content.split('\n')
    balance = 0
    for i, line in enumerate(lines, 1):
        open_count = line.count('{')
        close_count = line.count('}')
        balance += open_count - close_count
        if balance < 0:
            print(f"ERROR: Line {i} breaks balance (balance becomes negative)")
            print(f"  {line[:100]}")
            break
