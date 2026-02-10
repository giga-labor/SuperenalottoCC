import json
import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
algos_dir = root / 'pages' / 'algoritmi'
output_path = root / 'data' / 'cards-index.json'

cards = []

if algos_dir.exists():
    for algo_dir in sorted([p for p in algos_dir.rglob('*') if p.is_dir() and (p / 'card.json').exists()]):
        card_path = algo_dir / 'card.json'
        try:
            card_data = json.loads(card_path.read_text(encoding='utf-8-sig'))
        except Exception:
            continue
        if not isinstance(card_data, dict):
            continue
        card = dict(card_data)
        card.setdefault('id', algo_dir.name)

        rel_base = algo_dir.relative_to(root).as_posix().rstrip('/') + '/'
        card_base = rel_base

        card.setdefault('page', card_base)
        card.setdefault('cardBase', card_base)
        card.setdefault('image', 'img.webp')
        card.setdefault('isActive', False)
        image_name = str(card.get('image') or '').strip()
        if image_name and '/' not in image_name and not image_name.startswith(('http://', 'https://')):
            image_path = algo_dir / image_name
            if image_path.exists():
                card['imageVersion'] = int(image_path.stat().st_mtime)
        card.setdefault('title', algo_dir.name)
        cards.append(card)

storico_card_path = root / 'pages' / 'storico-estrazioni' / 'card.json'
if storico_card_path.exists():
    try:
        storico_data = json.loads(storico_card_path.read_text(encoding='utf-8-sig'))
    except Exception:
        storico_data = None
    if isinstance(storico_data, dict):
        storico_card = dict(storico_data)
        storico_card.setdefault('id', 'storico-estrazioni')
        storico_base = 'pages/storico-estrazioni/'
        storico_card.setdefault('page', storico_base)
        storico_card.setdefault('cardBase', storico_base)
        storico_card.setdefault('image', 'img.webp')
        storico_card.setdefault('isActive', False)
        image_name = str(storico_card.get('image') or '').strip()
        if image_name and '/' not in image_name and not image_name.startswith(('http://', 'https://')):
            image_path = root / 'pages' / 'storico-estrazioni' / image_name
            if image_path.exists():
                storico_card['imageVersion'] = int(image_path.stat().st_mtime)
        storico_card.setdefault('title', 'Storico estrazioni')
        cards.append(storico_card)

cards.sort(key=lambda item: item.get('title', '').lower())
output_path.write_text(json.dumps(cards, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Wrote {len(cards)} cards to {output_path}')