#!/usr/bin/env python3
"""Sample a curated subset of Lichess's CC0 puzzle database for the chess
intuition trainer: one-move puzzles only (matches the "flash a position,
find the one right move" intuition-training mechanic), filtered for quality
(popularity/play count), spread evenly across rating bands 600-2800.

Setup: download the source database first (not committed -- 1.1GB
decompressed), run this script from the same directory, then copy its
output into public/data/puzzles.json:

    curl -O https://database.lichess.org/lichess_db_puzzle.csv.zst
    unzstd lichess_db_puzzle.csv.zst
    python3 scripts/sample_puzzles.py
    cp puzzles_sample.json public/data/puzzles.json
"""
import csv
import json
import random
from collections import defaultdict

random.seed(42)

MIN_POPULARITY = 80
MIN_PLAYS = 1000
BAND_SIZE = 100
MIN_RATING = 600
MAX_RATING = 2800
PER_BAND = 200

buckets = defaultdict(list)

with open("lichess_db_puzzle.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        themes = row["Themes"].split()
        if "oneMove" not in themes:
            continue
        pop = int(row["Popularity"])
        plays = int(row["NbPlays"])
        rating = int(row["Rating"])
        if pop < MIN_POPULARITY or plays < MIN_PLAYS:
            continue
        if rating < MIN_RATING or rating > MAX_RATING:
            continue
        band = (rating - MIN_RATING) // BAND_SIZE
        moves = row["Moves"].split()
        if len(moves) != 2:
            # oneMove should always be setup + 1 solution move, but be safe
            continue
        active = row["FEN"].split(" ")[1]  # whose turn to make the setup move
        turn = "b" if active == "w" else "w"  # flips after the setup move
        buckets[band].append({
            "id": row["PuzzleId"],
            "fen": row["FEN"],
            "setup": moves[0],
            "solution": moves[1],
            "rating": rating,
            "themes": [t for t in themes if t != "oneMove"],
            "turn": turn,
        })

sampled = []
for band, items in sorted(buckets.items()):
    random.shuffle(items)
    take = items[:PER_BAND]
    sampled.extend(take)
    lo = MIN_RATING + band * BAND_SIZE
    print(f"band {lo}-{lo+BAND_SIZE-1}: {len(items)} available, took {len(take)}")

random.shuffle(sampled)
print(f"\nTotal sampled: {len(sampled)}")

with open("puzzles_sample.json", "w") as f:
    json.dump(sampled, f, ensure_ascii=False)

print("wrote puzzles_sample.json")
