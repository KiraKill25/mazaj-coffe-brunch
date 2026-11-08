; MAZAJ Coffee Shop - Inno Setup script
; 1) Run windows\build-desktop.bat   2) Right-click this file > Compile
#define AppName "MAZAJ Coffee Shop"
#define AppVersion "1.0.0"

[Setup]
AppId={{8B6F2C1E-4D7A-4E59-9A3B-6C2D1F0E7A11}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=MAZAJ
DefaultDirName={autopf}\MAZAJ Coffee Shop
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputDir=Output
OutputBaseFilename=Mazaj-POS-Setup-v{#AppVersion}
SetupIconFile=mazaj.ico
UninstallDisplayIcon={app}\mazaj.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "autostart"; Description: "Start MAZAJ when Windows starts"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "stage\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\MAZAJ.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\mazaj.ico"
Name: "{group}\Stop MAZAJ server"; Filename: "{app}\Stop-MAZAJ.bat"; WorkingDir: "{app}"; IconFilename: "{app}\mazaj.ico"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\MAZAJ.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\mazaj.ico"; Tasks: desktopicon
Name: "{userstartup}\{#AppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\MAZAJ.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\mazaj.ico"; Tasks: autostart

[Run]
; Replace the old rule on upgrades. Allow same-LAN phones on all Windows profiles,
; but only on MAZAJ's TCP port, not every Node port or internet source.
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""MAZAJ Coffee Shop"""; Flags: runhidden
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""MAZAJ Coffee Shop"" dir=in action=allow program=""{app}\node.exe"" enable=yes profile=any protocol=TCP localport=8080 remoteip=LocalSubnet"; Flags: runhidden
Filename: "{sys}\wscript.exe"; Parameters: """{app}\MAZAJ.vbs"""; Description: "{cm:LaunchProgram,{#AppName}}"; Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "{app}\Stop-MAZAJ.bat"; Flags: runhidden; RunOnceId: "StopServer"
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""MAZAJ Coffee Shop"""; Flags: runhidden; RunOnceId: "DelFirewall"
; Close the MAZAJ app window (Chrome/Edge using the MazajPOS profile) so its data files are not locked.
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -Command ""Get-CimInstance Win32_Process | Where-Object {{ $_.CommandLine -like '*MazajPOS*' } | ForEach-Object {{ Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Start-Sleep -Seconds 2"""; Flags: runhidden; RunOnceId: "CloseAppWindow"

[UninstallDelete]
; Uninstall = full wipe: sales, register sessions, clock-in/out history and settings live in this browser profile.
Type: filesandordirs; Name: "{localappdata}\MazajPOS"
