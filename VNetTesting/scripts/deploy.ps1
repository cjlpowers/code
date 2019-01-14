
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [String]$ResourceGroupName,
    [Parameter()]
    [String]$Location = "South Central US"
)
process{
    "Creating resource group..."
    $resourceGroup = New-AzResourceGroup -Name $ResourceGroupName -Location $Location
    $resourceGroup | Format-List

    "Removing resource group..."
    $resourceGroup | Remove-AzResourceGroup -Force
}
