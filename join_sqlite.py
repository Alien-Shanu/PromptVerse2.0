import os
import glob

FILE_PATH = 'promptverse.sqlite'
PART_PATTERN = f"{FILE_PATH}.part*"

def join_file():
    parts = sorted(glob.glob(PART_PATTERN))
    if not parts:
        print("No parts found.")
        return

    with open(FILE_PATH, 'wb') as output_file:
        for part_name in parts:
            print(f"Reading {part_name}...")
            with open(part_name, 'rb') as part_file:
                output_file.write(part_file.read())
    print(f"Reassembled {FILE_PATH}")

if __name__ == '__main__':
    join_file()
