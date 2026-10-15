from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / 'extension'
(root / 'demo-assets').mkdir(exist_ok=True)
(root / 'icons').mkdir(exist_ok=True)
colors = ['#f4e7dd', '#e9e5f5', '#e2ece5', '#f0eadd']
for i, bg in enumerate(colors, 1):
    im=Image.new('RGB',(800,800),bg);d=ImageDraw.Draw(im)
    d.ellipse((165,640,650,705),fill='#d9d3cc')
    if i==1:
        d.rounded_rectangle((280,220,520,660),radius=60,fill='#c5a995')
        d.rounded_rectangle((320,165,480,250),radius=20,fill='#746f64')
        d.rectangle((280,380,520,510),fill='#eee8d7')
        d.text((333,425),'DAILY',fill='#9e907a',font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',35))
    elif i==2:
        d.arc((210,150,590,580),180,360,fill='#a39ab8',width=65)
        d.rounded_rectangle((190,360,300,630),radius=45,fill='#827a95')
        d.rounded_rectangle((500,360,610,630),radius=45,fill='#827a95')
        d.rounded_rectangle((230,390,310,590),radius=25,fill='#b0a7c1')
        d.rounded_rectangle((490,390,570,590),radius=25,fill='#b0a7c1')
    elif i==3:
        d.arc((280,140,520,450),180,360,fill='#acb098',width=35)
        d.rounded_rectangle((200,290,600,660),radius=45,fill='#cccdb4')
        d.text((310,435),'daily.',fill='#92977e',font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',65))
    else:
        d.rounded_rectangle((470,320,650,570),radius=65,outline='#aaa998',width=42)
        d.rounded_rectangle((220,280,530,660),radius=80,fill='#c3c1ae')
        d.rectangle((220,280,530,350),fill='#c3c1ae')
        d.ellipse((220,250,530,320),fill='#a19b85')
        d.ellipse((235,265,515,305),fill='#72664e')
    ext={1:'jpg',2:'webp',3:'jpg',4:'png'}[i]
    size={1:800,2:960,3:640,4:480}[i]
    im.resize((size,size),Image.Resampling.LANCZOS).save(root/'demo-assets'/f'item{i}.{ext}',quality=95)
for size in [16,48,128]:
    im=Image.new('RGBA',(size,size));d=ImageDraw.Draw(im)
    d.rounded_rectangle((0,0,size-1,size-1),radius=size//4,fill='#5145df')
    d.rectangle((size*.22,size*.22,size*.78,size*.78),outline='white',width=max(1,size//16))
    d.polygon([(size*.24,size*.70),(size*.44,size*.47),(size*.56,size*.60),(size*.68,size*.40),(size*.77,size*.70)],fill='white')
    d.ellipse((size*.32,size*.32,size*.42,size*.42),fill='white')
    im.save(root/'icons'/f'icon{size}.png')
print('Created 4 original image fixtures (JPG, WebP, PNG) and 3 icons.')
