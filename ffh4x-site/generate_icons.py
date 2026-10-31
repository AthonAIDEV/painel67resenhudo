#!/usr/bin/env python3
"""
Gerador de ícones PWA para ffh4x Panel
Requer: pip install pillow
"""

from PIL import Image, ImageDraw
import os

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUTPUT_DIR = "public/assets"
BG_COLOR = "#00ff88"
FG_COLOR = "#0a0f0d"

def create_icon(size):
    img = Image.new('RGBA', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Cantos arredondados (máscara)
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = size // 4
    mask_draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    
    # Aplicar máscara
    img.putalpha(mask)
    
    # Desenhar linhas do logo (3 barras)
    line_height = max(2, size // 24)
    line_gap = max(4, size // 12)
    start_y = size // 3
    line_widths = [0.5, 0.375, 0.25]  # Proporções: 24/48, 18/48, 12/48
    
    for i, width_ratio in enumerate(line_widths):
        y = start_y + i * (line_height + line_gap)
        line_width = int(size * width_ratio)
        x_start = (size - line_width) // 2
        draw.rectangle([x_start, y, x_start + line_width, y + line_height], fill=FG_COLOR)
    
    return img

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"Gerando ícones PWA em {OUTPUT_DIR}/")
    
    for size in SIZES:
        icon = create_icon(size)
        filename = f"icon-{size}.png"
        path = os.path.join(OUTPUT_DIR, filename)
        icon.save(path, 'PNG', optimize=True)
        print(f"  ✓ {filename} ({size}x{size})")
    
    # Favicon.ico (multi-resolution)
    icons_ico = [create_icon(s) for s in [16, 32, 48]]
    ico_path = os.path.join(OUTPUT_DIR, "favicon.ico")
    icons_ico[0].save(ico_path, format='ICO', sizes=[(s.width, s.height) for s in icons_ico])
    print(f"  ✓ favicon.ico (16,32,48)")
    
    # Apple touch icon
    apple_icon = create_icon(180)
    apple_path = os.path.join(OUTPUT_DIR, "apple-touch-icon.png")
    apple_icon.save(apple_path, 'PNG', optimize=True)
    print(f"  ✓ apple-touch-icon.png (180x180)")
    
    # Screenshots placeholders
    wide = Image.new('RGB', (1280, 720), '#0a0f0d')
    draw = ImageDraw.Draw(wide)
    draw.text((640, 360), "Screenshot Wide - Painel ffh4x em ação", fill='#00ff88', anchor='mm')
    wide.save(os.path.join(OUTPUT_DIR, "screenshot-wide.png"), 'PNG')
    print(f"  ✓ screenshot-wide.png (1280x720)")
    
    narrow = Image.new('RGB', (720, 1280), '#0a0f0d')
    draw = ImageDraw.Draw(narrow)
    draw.text((360, 640), "Screenshot Narrow - Painel flutuante mobile", fill='#00ff88', anchor='mm')
    narrow.save(os.path.join(OUTPUT_DIR, "screenshot-narrow.png"), 'PNG')
    print(f"  ✓ screenshot-narrow.png (720x1280)")
    
    print("\n✅ Todos os assets gerados!")
    print("📝 Lembre-se: substitua screenshots por imagens reais do painel")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("❌ Pillow não instalado. Execute: pip install pillow")
    except Exception as e:
        print(f"❌ Erro: {e}")