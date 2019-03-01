
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [String]$ResourceGroupName
)
process{
    "Removing resource group..."
    $resourceGroup = Get-AzResourceGroup -Name $ResourceGroupName
    return $resourceGroup | Remove-AzResourceGroup -Force
}
