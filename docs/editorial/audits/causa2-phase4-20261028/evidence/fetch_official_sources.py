from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
import re

OUT = Path(__file__).parent
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/129.0 Safari/537.36'
URLS = {
    'dt_imm': 'https://www.dt.gob.cl/portal/1628/w3-article-60141.html',
    'sp_sis': 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9917.html',
    'sp_afp': 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9897.html',
    'sp_transfer': 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9915.html',
    'sp_topes': 'https://www.spensiones.cl/portal/institucional/594/w3-article-16921.html',
    'afc': 'https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/',
    'sii_iusc': 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm',
    'salud_cotizaciones': 'https://www.superdesalud.gob.cl/tax-materias-isapres/cotizaciones-de-salud-3465/',
    'salud_plan': 'https://www.superdesalud.gob.cl/orientacion-en-salud/fonasa-o-isapre/',
}
class Blocks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts=[]
    def handle_starttag(self, tag, attrs):
        if tag in {'p','li','h1','h2','h3','h4','tr','br','section','article'}:
            self.parts.append('\n')
        elif tag in {'td','th'}:
            self.parts.append(' | ')
    def handle_data(self, data):
        data=' '.join(data.split())
        if data: self.parts.append(data)
    def handle_endtag(self, tag):
        if tag in {'p','li','h1','h2','h3','h4','tr','section','article'}:
            self.parts.append('\n')
def snippets(text, patterns):
    lines=[re.sub(r'\s+',' ',line).strip() for line in text.splitlines()]
    lines=[line for line in lines if line]
    found=[]
    for i,line in enumerate(lines):
        if any(re.search(p,line,re.I) for p in patterns):
            for j in range(max(0,i-1),min(len(lines),i+2)):
                if lines[j] not in found: found.append(lines[j])
    return found
PATTERNS={
 'dt_imm':[r'553\.553',r'01 de mayo'],
 'sp_sis':[r'agosto de 2026',r'1,78%',r'1,49%'],
 'sp_afp':[r'0,46% a 1,45%',r'AFP Capital: 1,44%',r'AFP Uno: 0,46%',r'24 meses',r'1 de octubre de 2025'],
 'sp_transfer':[r'cuando lo estimen',r'24 meses',r'30 de septiembre de 2027',r'1 de octubre de 2025'],
 'sp_topes':[r'90 UF',r'135,2 UF',r'2026'],
 'afc':[r'Cuenta Individual',r'Fondo de Cesantía Solidario',r'2,8%',r'11 años'],
 'sii_iusc':[r'Abril 2026',r'943\.501,50',r'37\.740,06',r'2\.096\.670,00'],
 'salud_cotizaciones':[r'cotización legal para salud',r'tope mensual de UF 90',r'6,3 UF'],
 'salud_plan':[r'costo adicional',r'copagos'],
}
for key,url in URLS.items():
    req=Request(url,headers={'User-Agent':UA,'Referer':url})
    try:
        with urlopen(req,timeout=30) as response:
            raw=response.read(); status=response.status
        (OUT/f'{key}.html').write_bytes(raw)
        parser=Blocks(); parser.feed(raw.decode('utf-8','replace'))
        text='\n'.join(parser.parts)
        print(f'## {key}\nURL: {url}\nHTTP: {status}; bytes: {len(raw)}')
        selected=snippets(text,PATTERNS[key])
        if not selected: print('NO MATCHING EXTRACT')
        for line in selected: print(line)
        print()
    except Exception as e:
        print(f'## {key}\nURL: {url}\nFETCH ERROR: {type(e).__name__}: {e}\n')
