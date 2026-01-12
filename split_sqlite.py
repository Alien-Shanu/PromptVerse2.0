import os

CHUNK_SIZE = 500 * 1024 * 1024 # 500MB to be safe
FILE_PATH = 'promptverse.sqlite'

def split_file():
    if not os.path.exists(FILE_PATH):
        print(f"{FILE_PATH} not found.")
        return

    with open(FILE_PATH, 'rb') as f:
        part_num = 0
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            part_name = f"{FILE_PATH}.part{part_num:03d}"
            with open(part_name, 'wb') as part_file:
                part_file.write(chunk)
            print(f"Created {part_name}")
            part_num += 1

if __name__ == '__main__':
    split_file()
