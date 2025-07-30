# PowerShell script to take a screenshot using VirtualScreen for multi-monitor support
Add-Type -AssemblyName System.Windows.Forms,System.Drawing

function Take-Screenshot {
    param(
        [string]$Path = "screenshot.png"
    )
    
    try {
        # Get all screen information using VirtualScreen for multi-monitor setups
        $screens = [Windows.Forms.Screen]::AllScreens
        
        # Calculate bounds across all monitors
        $top    = ($screens.Bounds.Top    | Measure-Object -Minimum).Minimum
        $left   = ($screens.Bounds.Left   | Measure-Object -Minimum).Minimum
        $right  = ($screens.Bounds.Right  | Measure-Object -Maximum).Maximum
        $bottom = ($screens.Bounds.Bottom | Measure-Object -Maximum).Maximum
        
        $bounds = [Drawing.Rectangle]::FromLTRB($left, $top, $right, $bottom)
        
        Write-Output "Screen bounds: $($bounds.Width)x$($bounds.Height) at ($($bounds.X),$($bounds.Y))"
        
        # Create bitmap and graphics objects
        $bmp = New-Object System.Drawing.Bitmap ([int]$bounds.width), ([int]$bounds.height)
        $graphics = [Drawing.Graphics]::FromImage($bmp)
        
        # Capture screen content
        $graphics.CopyFromScreen($bounds.Location, [Drawing.Point]::Empty, $bounds.size)
        
        # Remove existing screenshot if it exists
        if (Test-Path $Path) {
            Remove-Item -Path $Path -Force
        }
        
        # Save screenshot
        $bmp.Save($Path)
        
        Write-Output "Screenshot saved to: $Path"
        
        # Clean up resources
        $graphics.Dispose()
        $bmp.Dispose()
        
        return $Path
    }
    catch {
        Write-Error "Failed to take screenshot: $($_.Exception.Message)"
        return $null
    }
}

# Execute screenshot
Write-Output "Taking screenshot using VirtualScreen..."
$result = Take-Screenshot -Path "screenshot.png"

if ($result) {
    Write-Output "Screenshot operation completed successfully: $result"
} else {
    Write-Output "Screenshot operation failed"
}