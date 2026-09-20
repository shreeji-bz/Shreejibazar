with open('src/pages/auth/LoginPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("from '../services/authService'", "from '../../services/authService'")
content = content.replace("from '../store/authStore'", "from '../../store/authStore'")

with open('src/pages/auth/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed LoginPage.tsx')
print(content[:300])
