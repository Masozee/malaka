#\!/bin/bash
for file in *.sql.bak; do
  original="${file%.bak}"
  echo "Fixing $original..."
  
  # Copy backup to original
  cp "$file" "$original"
  
  # Fix the file based on common patterns
  sed -i '' '
    # Remove UUID IDs from INSERT statements
    s/INSERT INTO \([a-z_]*\) (id, /INSERT INTO \1 (/g
    # Remove created_at, updated_at from column list
    s/, created_at, updated_at)/)/g
    # Remove the UUID values and timestamps from VALUES
    s/('\''[^'\'']*'\'', /(/g
    s/, NOW(), NOW())/)/g
    s/NOW(), NOW()//g
  ' "$original"
  
done
