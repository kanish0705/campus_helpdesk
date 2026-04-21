"""Convert ASCII diagrams to PNG images using PIL."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import os

# Create output directory
output_dir = Path("diagram_images")
output_dir.mkdir(exist_ok=True)

diagram_dir = Path("diagram_exports")
diagram_files = sorted(diagram_dir.glob("*.txt"))

if not diagram_files:
    print("❌ No diagram files found in diagram_exports/")
    exit(1)

# Font settings (using default monospace)
try:
    font = ImageFont.truetype("C:\\Windows\\Fonts\\consolas.ttf", 10)
except:
    font = ImageFont.load_default()

print(f"📊 Converting {len(diagram_files)} diagrams to PNG...\n")

for idx, diagram_file in enumerate(diagram_files, 1):
    with open(diagram_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Calculate image size
    lines = text.split('\n')
    max_width = max(len(line) for line in lines) if lines else 50
    height = len(lines)
    
    # Image dimensions (padding + text size)
    img_width = max_width * 8 + 40
    img_height = height * 15 + 40
    
    # Create image
    img = Image.new('RGB', (img_width, img_height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw text
    y_position = 20
    for line in lines:
        draw.text((20, y_position), line, fill='black', font=font)
        y_position += 15
    
    # Save image
    output_file = output_dir / f"diagram_{idx}.png"
    img.save(output_file)
    print(f"✓ Created: {output_file} ({max_width}x{height} chars)")

print(f"\n✅ All diagrams converted!")
print(f"📁 Images saved to: {output_dir}/")
print(f"\n💡 You can now:")
print(f"   - View all PNG files in the diagram_images/ folder")
print(f"   - Print them")
print(f"   - Share them")
