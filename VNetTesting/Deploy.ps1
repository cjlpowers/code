
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [String]$ResourceGroupName,
    [Parameter()]
    [String]$Location = "South Central US"
)
process{
    $resourceGroup = New-AzResourceGroup -Name $ResourceGroupName -Location $Location
    $resourceGroup | Format-List
    $resourceGroup | Remove-AzResourceGroup -Force
}
