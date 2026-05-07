# Enable SSL on Netlify site
$siteId = "ba0919b8-0c22-4287-be04-dd22e70c11dd"

$jsonData = @"
{
  `"site_id`": `"$siteId`",
  `"force_ssl`": true
}
"@

Write-Host "Enabling SSL for site: $siteId" -ForegroundColor Green
Write-Host "JSON Payload: $jsonData" -ForegroundColor Yellow

netlify api updateSite -d $jsonData
