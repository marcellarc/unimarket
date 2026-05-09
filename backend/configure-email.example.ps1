# Copie este arquivo para configure-email.ps1, preencha os valores reais
# e rode antes de iniciar o backend na mesma janela do PowerShell.
#
# O Gmail exige uma senha de app de 16 caracteres.
# Nao use sua senha normal do Gmail.

$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "unimarketsup@gmail.com"
$env:MAIL_PASSWORD = "sua-senha-de-app-do-gmail"
$env:MAIL_FROM = $env:MAIL_USERNAME

Write-Host "Variaveis de email configuradas para esta janela do PowerShell."
Write-Host "Agora rode: cd backend; cmd /c mvnw.cmd spring-boot:run"
