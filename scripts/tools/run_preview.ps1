$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body (@{ email='admin@lovelace.edu'; password='SuperAdmin2026!' } | ConvertTo-Json)
$token = $login.accessToken
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/products/import/preview' -Headers @{ Authorization = "Bearer $token" } -Form @{ file = Get-Item 'scripts/test/import_sample.csv' }
$resp | ConvertTo-Json -Depth 10
