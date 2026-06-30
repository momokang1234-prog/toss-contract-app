#!/bin/bash
echo "Starting RPA..."
powershell.exe -Command "\$wshell = New-Object -ComObject wscript.shell; Start-Process 'notepad'; Sleep 2; \$wshell.AppActivate('Notepad'); Sleep 1; \$wshell.SendKeys('Hello from Antigravity Desktop RPA{!}~This is an automated test.');" < /dev/null

sleep 1

echo "Capturing screen..."
powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; \$Screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; \$Bitmap = New-Object System.Drawing.Bitmap \$Screen.Width, \$Screen.Height; \$Graphics = [System.Drawing.Graphics]::FromImage(\$Bitmap); \$Graphics.CopyFromScreen(\$Screen.X, \$Screen.Y, 0, 0, \$Bitmap.Size); \$Bitmap.Save('raw_temp.png'); \$Graphics.Dispose(); \$Bitmap.Dispose();" < /dev/null

echo "Optimizing image..."
python3 -c "
from PIL import Image
import os
try:
    img = Image.open('raw_temp.png')
    w, h = img.size
    img = img.resize((w//2, h//2), Image.Resampling.LANCZOS).convert('L')
    img.save('verify.webp', 'webp', quality=40)
    os.remove('raw_temp.png')
    print('Visual verification saved to: verify.webp')
except Exception as e:
    print('Error processing image:', e)
"
