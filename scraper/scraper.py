import os
from pathlib import Path
from bs4 import BeautifulSoup
import json

# 1 - Looping over the multiple files

favorites_dir = Path(__file__).parent / "favorites"
all_items = {}

for file_path in favorites_dir.iterdir():
    if file_path.suffix != ".txt":
        continue

    print(f"Processing: {file_path.name}")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        soup = BeautifulSoup(content, 'html.parser')
        dextable = soup.find("table", class_="dextable")
        if dextable is None:
            print(f"No dextable found in {file_path.name}")
            continue
        rows = dextable.find_all("tr")
        print(f"Found {len(rows)} rows in {file_path.name}")

        for tr in rows[1:]:
            cells = tr.find_all("td")
            if len(cells) < 4:
                print(f"Skipping row with {len(cells)} cells in {file_path.name}")
                continue
            # Name
            name_cell = cells[1]
            name = name_cell.find("u")
            item_name = name.get_text(strip=True) if name else ""
            if not item_name:
                print(f"Skipping item with no name in {file_path.name}")
                continue

            # Description
            description_cell = cells[2]
            item_description = description_cell.get_text(strip=True)

            # Category
            category_cell = cells[3]
            item_category = category_cell.get_text(strip=True)

            print(f"Parsed item: {item_name} from {file_path.name}")

            # Check if item already exists
            if item_name in all_items:
                # Append to favorites list if not already present
                if file_path.stem not in all_items[item_name]["favorites"]:
                    all_items[item_name]["favorites"].append(file_path.stem)
            else:
                all_items[item_name] = {
                    "name": item_name,
                    "description": item_description,
                    "category": item_category,
                    "favorites": [file_path.stem]
                }

# Convert dict for JSON
items_list = list(all_items.values())

# Save JSON
output_path = Path(__file__).parent.parent / "data" / "output" / "favorites.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(items_list, f, indent=2)

print(f"Saved {len(items_list)} items to {output_path}")

example_dict = [
    {
        "name": "Wall storage box",
        "image": "wallstoragebox.png",
        "description": "It may be small, but it can store lots of stuff.",
        "category": "Decoration"
    }
]
   



