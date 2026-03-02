param()

$inputJson = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($inputJson)) {
  Write-Output "sem-dados | 0% | $PWD"
  exit 0
}

try {
  $data = $inputJson | ConvertFrom-Json
}
catch {
  Write-Output "json-invalido | 0% | $PWD"
  exit 0
}

$model = $data.model.id
if ([string]::IsNullOrWhiteSpace($model)) {
  $model = "modelo-desconhecido"
}

$usage = $data.context_window.used_percentage
if ($null -eq $usage) {
  $usage = 0
}
$usageText = "{0}%" -f [math]::Round([double]$usage)

$dir = $data.cwd
if ([string]::IsNullOrWhiteSpace($dir)) {
  $dir = $PWD.Path
}

Write-Output "$model | $usageText | $dir"
