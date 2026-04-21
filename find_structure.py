with open('index.html', encoding='utf-8') as f:
    lines = f.readlines()

# Find view-dashboard
start_line = None
for i, line in enumerate(lines, 1):
    if 'id="view-dashboard"' in line:
        start_line = i
        print(f'view-dashboard opens at line {i}')
        break

if start_line:
    # Find where it closes
    depth = 1
    for i in range(start_line, len(lines)):
        line = lines[i]
        depth += line.count('<div') - line.count('</div>')
        if depth == 0:
            print(f'view-dashboard closes at line {i+1}')
            break

# Find view-manage-timetable
for i, line in enumerate(lines, 1):
    if 'id="view-manage-timetable"' in line:
        print(f'view-manage-timetable opens at line {i}')
        break
