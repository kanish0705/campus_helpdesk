"""Export diagrams from markdown files to image files."""
import os
import re
import subprocess
from pathlib import Path

# Create output folder
output_dir = Path("diagram_exports")
output_dir.mkdir(exist_ok=True)

md_files = [
    "SYSTEM_ARCHITECTURE.md",
    "SYSTEM_DOCUMENTATION.md",
    "DOCUMENTATION_INDEX.md"
]

diagram_counter = 1

for md_file in md_files:
    if not os.path.exists(md_file):
        continue
    
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract ASCII diagrams (code blocks with box-drawing characters)
    # Look for ``` blocks containing diagrams
    code_blocks = re.findall(r'```\n([\s\S]*?)```', content)
    
    for block in code_blocks:
        # Check if it looks like a diagram (contains box-drawing chars)
        if any(c in block for c in ['┌', '┐', '└', '┘', '│', '─', '├', '┤', '┼', '█']):
            diagram_file = output_dir / f"diagram_{diagram_counter}.txt"
            with open(diagram_file, 'w', encoding='utf-8') as f:
                f.write(block)
            print(f"✓ Saved: {diagram_file}")
            diagram_counter += 1

print(f"\n✅ Found {diagram_counter - 1} diagrams")
print(f"📁 All diagrams exported to: {output_dir}/")
print("\n💡 To convert to PNG/SVG, use:")
print("   - Kroki.io: https://kroki.io/ (paste ASCII, download PNG)")
print("   - Graphviz: plantuml for conversion")
