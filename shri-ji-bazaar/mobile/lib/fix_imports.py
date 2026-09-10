#!/usr/bin/env python3
"""
Fix all import paths in the Flutter mobile app.
This script computes correct relative paths based on actual file existence.
"""
import os
import re

BASE = "/Users/apple/Documents/untitled folder/xx/shri-ji-bazaar/mobile/lib"

# Build a map of all dart files by filename (for cross-feature resolution)
all_files = {}
for root, dirs, files in os.walk(BASE):
    for f in files:
        if f.endswith('.dart'):
            full_path = os.path.join(root, f)
            # Store by basename -> full_path
            if f not in all_files:
                all_files[f] = []
            all_files[f].append(full_path)

def find_file(filename, from_dir):
    """Find the correct relative path for a file import"""
    # First check if it exists relative to from_dir (current import path)
    direct = os.path.normpath(os.path.join(from_dir, filename))
    if os.path.exists(os.path.join(BASE, direct)):
        # Return relative path
        return os.path.relpath(os.path.join(BASE, direct), from_dir)

    # Try within the same feature
    feature_match = re.search(r'/features/([^/]+)/', from_dir)
    if feature_match:
        feature = feature_match.group(1)
        feature_base = os.path.join(BASE, "features", feature)

        # Search in common subdirectories
        for subdir in ['domain/entities', 'domain/repositories', 'domain/usecases',
                       'data/models', 'data/datasources', 'data/repositories',
                       'presentation/controllers', 'presentation/pages', 'presentation/widgets']:
            candidate = os.path.join(feature_base, subdir, filename)
            if os.path.exists(candidate):
                return os.path.relpath(candidate, from_dir)

        # Search in root of feature
        candidate = os.path.join(feature_base, filename)
        if os.path.exists(candidate):
            return os.path.relpath(candidate, from_dir)

    # Search globally by basename
    if filename in all_files:
        for f in all_files[filename]:
            # Prefer same feature
            if feature_match and f'/features/{feature_match.group(1)}/' in f:
                return os.path.relpath(f, from_dir)
        # Otherwise just return first match
        return os.path.relpath(all_files[filename][0], from_dir)

    return None

def fix_imports_in_file(filepath):
    """Fix all imports in a Dart file"""
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    dirpath = os.path.dirname(filepath)

    # Find all import lines and fix them
    def fix_import(match):
        indent = match.group(1)
        imp_path = match.group(2)

        # Skip package imports
        if imp_path.startswith('package:'):
            return match.group(0)

        # Skip dart: imports
        if imp_path.startswith('dart:'):
            return match.group(0)

        # Compute the target file path
        filename = os.path.basename(imp_path)
        target = os.path.normpath(os.path.join(dirpath, imp_path))

        # Check if target exists
        if os.path.exists(os.path.join(BASE, target)):
            return match.group(0)  # Import is correct

        # Target doesn't exist - find correct path
        correct = find_file(filename, dirpath)
        if correct:
            return f"{indent}import '{correct}';"

        # Couldn't find it - return original
        return match.group(0)

    content = re.sub(r"(\s*)import '([^']+)';", fix_import, content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

# Process all Dart files in features/ and lib root
count = 0
for root, dirs, files in os.walk(BASE):
    for f in files:
        if f.endswith('.dart'):
            filepath = os.path.join(root, f)
            if fix_imports_in_file(filepath):
                count += 1

print(f"Fixed imports in {count} files")

# Remove the script itself
os.remove(os.path.join(BASE, "fix_imports.py"))
