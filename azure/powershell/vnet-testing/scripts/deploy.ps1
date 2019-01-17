
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [String]$ResourceGroupName,
    [Parameter()]
    [String]$Location = "South Central US"
)
process{
    $prefix = "$((New-Guid).ToString().SubString(0,8))-"

    "Creating resource group..."
    $resourceGroup = New-AzResourceGroup `
        -Name $ResourceGroupName `
        -Location $Location `

    "Creating virtual network..."
    $snetDmzIn = New-AzVirtualNetworkSubnetConfig `
        -Name "$($prefix)snet-dmz-in" `
        -AddressPrefix "10.0.0.0/27"
    
    $snetDmzOut = New-AzVirtualNetworkSubnetConfig `
        -Name "$($prefix)snet-dmz-out" `
        -AddressPrefix "10.0.0.32/27"

    $vnet = New-AzVirtualNetwork `
        -Name "$($prefix)vnet" `
        -ResourceGroupName $resourceGroup.ResourceGroupName `
        -Location $Location `
        -AddressPrefix "10.0.0.0/16" `
        -Subnet $snetDmzIn, $snetDmzOut

    return $vnet
}
