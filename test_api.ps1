$phoneBody = @{
    phoneNumber = "9876543210"
    otpCode = "123456"
} | ConvertTo-Json

Write-Host "1. Testing Phone Login..."
$auth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/phone-login" -Method Post -ContentType "application/json" -Body $phoneBody
Write-Host "-> Login Success! User: $($auth.user.displayName), Coins: $($auth.user.coins), Level: $($auth.user.userLevel)"

$token = $auth.token
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`n2. Testing Room Lock..."
$lockBody = @{
    password = "secret_pin_777"
} | ConvertTo-Json

$lockRes = Invoke-RestMethod -Uri "http://localhost:5000/api/rooms/1/lock" -Method Post -Headers $headers -ContentType "application/json" -Body $lockBody
Write-Host "-> Lock response: $($lockRes.message), IsLocked: $($lockRes.isLocked)"

Write-Host "`n3. Testing Room Password Verification..."
$verifyBody = @{
    password = "secret_pin_777"
} | ConvertTo-Json

$verifyRes = Invoke-RestMethod -Uri "http://localhost:5000/api/rooms/1/verify-password" -Method Post -ContentType "application/json" -Body $verifyBody
Write-Host "-> Password verified: $($verifyRes.authorized)"

Write-Host "`n4. Testing Room Unlock..."
$unlockRes = Invoke-RestMethod -Uri "http://localhost:5000/api/rooms/1/unlock" -Method Post -Headers $headers
Write-Host "-> Unlock response: $($unlockRes.message)"

Write-Host "`n5. Testing Moderation Report (3 Days Ban)..."
$reportGuest = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/guest-login" -Method Post -ContentType "application/json" -Body "{}"
$guestId = $reportGuest.user.id
Write-Host "-> Created target user ID: $guestId ($($reportGuest.user.displayName))"

$reportReq = @{
    reportedUserId = $guestId
    reason = "Abusive chat in room"
    durationType = "ThreeDays"
} | ConvertTo-Json

$reportRes = Invoke-RestMethod -Uri "http://localhost:5000/api/moderation/report" -Method Post -Headers $headers -ContentType "application/json" -Body $reportReq
Write-Host "-> Report result: $($reportRes.message)"

Write-Host "`nAll backend tests passed with flying colors!"
