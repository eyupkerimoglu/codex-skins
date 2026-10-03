$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assets = Join-Path (Split-Path -Parent $PSScriptRoot) 'assets'
New-Item -ItemType Directory -Path $assets -Force | Out-Null
function RoundedPath([single]$x,[single]$y,[single]$w,[single]$h,[single]$r) {
    $p=New-Object Drawing.Drawing2D.GraphicsPath
    $d=$r*2
    $p.AddArc($x,$y,$d,$d,180,90); $p.AddArc($x+$w-$d,$y,$d,$d,270,90)
    $p.AddArc($x+$w-$d,$y+$h-$d,$d,$d,0,90); $p.AddArc($x,$y+$h-$d,$d,$d,90,90); $p.CloseFigure()
    return ,$p
}
$images = @()
foreach ($size in @(16,24,32,48,64,128,256)) {
    $bitmap = New-Object Drawing.Bitmap($size,$size)
    $g=[Drawing.Graphics]::FromImage($bitmap); $g.SmoothingMode='AntiAlias'; $g.ScaleTransform($size/256.0,$size/256.0)
    $background=New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml('#17221c'))
    $screen=New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml('#0c1510'))
    $yellow=New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml('#F0B137'))
    $blue=New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml('#4AA3FF'))
    $red=New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml('#E84C3D'))
    $silver=New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml('#d9e5dd'))
    $outline=New-Object Drawing.Pen([Drawing.ColorTranslator]::FromHtml('#718e7c'),5)
    $ink=New-Object Drawing.Pen([Drawing.ColorTranslator]::FromHtml('#8fe5ae'),10); $ink.StartCap='Round'; $ink.EndCap='Round'; $ink.LineJoin='Round'
    $case=RoundedPath 10 10 236 236 46; $g.FillPath($background,$case); $g.DrawPath($outline,$case)
    $monitor=RoundedPath 43 53 165 121 14; $g.FillPath($screen,$monitor); $g.DrawPath($outline,$monitor)
    $g.DrawLines($ink,[Drawing.PointF[]]@([Drawing.PointF]::new(72,87),[Drawing.PointF]::new(96,108),[Drawing.PointF]::new(72,129)))
    $g.DrawLine($ink,112,134,142,134); $g.FillRectangle($silver,113,177,20,13); $g.FillRectangle($silver,91,189,65,7)
    $g.FillEllipse($silver,154,141,69,64); $g.FillEllipse($background,187,179,23,24)
    $g.FillEllipse($yellow,164,157,11,11); $g.FillEllipse($blue,183,150,10,10); $g.FillEllipse($red,202,160,10,10)
    if ($size -eq 256) { $bitmap.Save((Join-Path $assets 'codex-skins-preview.png'),[Drawing.Imaging.ImageFormat]::Png) }
    $memory=New-Object IO.MemoryStream; $bitmap.Save($memory,[Drawing.Imaging.ImageFormat]::Png)
    $images += ,@{size=$size; bytes=$memory.ToArray()}
    $memory.Dispose(); $g.Dispose(); $bitmap.Dispose(); $case.Dispose(); $monitor.Dispose()
    foreach ($object in @($background,$screen,$yellow,$blue,$red,$silver,$outline,$ink)) { $object.Dispose() }
}
$file=[IO.File]::Create((Join-Path $assets 'codex-skins.ico')); $writer=New-Object IO.BinaryWriter($file)
$writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$images.Count)
$offset=6+16*$images.Count
foreach ($entry in $images) {
    $dimension=if ($entry.size -eq 256) {0} else {$entry.size}
    $writer.Write([byte]$dimension); $writer.Write([byte]$dimension); $writer.Write([byte]0); $writer.Write([byte]0)
    $writer.Write([uint16]1); $writer.Write([uint16]32); $writer.Write([uint32]$entry.bytes.Length); $writer.Write([uint32]$offset)
    $offset+=$entry.bytes.Length
}
foreach ($entry in $images) { $writer.Write([byte[]]$entry.bytes) }
$writer.Dispose(); $file.Dispose()
