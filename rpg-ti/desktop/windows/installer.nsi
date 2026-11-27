; Instalador do Masmorra do Deploy para Windows (NSIS 3).
; Gerado por desktop/windows/build.sh, que passa:
;   -DVERSION=1.0.0  -DSRC=<pasta win-unpacked>  -DOUT=<arquivo .exe de saída>

Unicode true
!include "MUI2.nsh"
!include "FileFunc.nsh"

!define APP "Masmorra do Deploy"
!define EXE "Masmorra do Deploy.exe"
!define PUBLISHER "bento123xd"
!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\MasmorraDoDeploy"
!ifndef VERSION
  !error "Informe -DVERSION=x.y.z"
!endif
!ifndef SRC
  !error "Informe -DSRC=<pasta win-unpacked>"
!endif
!ifndef OUT
  !error "Informe -DOUT=<instalador.exe>"
!endif

Name "${APP}"
OutFile "${OUT}"
InstallDir "$LOCALAPPDATA\Programs\${APP}"
InstallDirRegKey HKCU "${UNINST_KEY}" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetCompressorDictSize 64
BrandingText "${APP} ${VERSION}"
ShowInstDetails show
ShowUninstDetails show

!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Instalar o ${APP}"
!define MUI_WELCOMEPAGE_TEXT "RPG de cartas de TI: responda perguntas de Infra, Dev e Redes e suba de Júnior a Tech Lead.$\r$\n$\r$\nO jogo será instalado só para o seu usuário e não precisa de permissão de administrador.$\r$\n$\r$\nClique em Avançar para continuar."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "Abrir o ${APP} agora"

!insertmacro MUI_PAGE_WELCOME
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE GarantePastaDoApp
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "PortugueseBR"

VIProductVersion "${VERSION}.0"
VIFileVersion "${VERSION}.0"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "ProductName" "${APP}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "FileDescription" "Instalador do ${APP}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "CompanyName" "${PUBLISHER}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "LegalCopyright" "Bentools"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "ProductVersion" "${VERSION}"

; Sempre instala numa pasta própria do jogo, para que a desinstalação
; nunca apague outra pasta escolhida pelo usuário (ex.: C:\ ou Documentos).
Function GarantePastaDoApp
  ${GetFileName} "$INSTDIR" $0
  StrCmp $0 "${APP}" +2
    StrCpy $INSTDIR "$INSTDIR\${APP}"
FunctionEnd

Section "Instalar"
  nsExec::Exec 'taskkill /IM "${EXE}" /F'
  Pop $0
  Call GarantePastaDoApp
  SetOutPath "$INSTDIR"
  RMDir /r "$INSTDIR\resources"
  RMDir /r "$INSTDIR\locales"
  File /r "${SRC}\*.*"
  WriteUninstaller "$INSTDIR\Desinstalar.exe"

  CreateShortCut "$SMPROGRAMS\${APP}.lnk" "$INSTDIR\${EXE}" "" "$INSTDIR\${EXE}" 0
  CreateShortCut "$DESKTOP\${APP}.lnk" "$INSTDIR\${EXE}" "" "$INSTDIR\${EXE}" 0

  WriteRegStr HKCU "${UNINST_KEY}" "DisplayName" "${APP}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINST_KEY}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\${EXE}"
  WriteRegStr HKCU "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINST_KEY}" "UninstallString" '"$INSTDIR\Desinstalar.exe"'
  WriteRegStr HKCU "${UNINST_KEY}" "QuietUninstallString" '"$INSTDIR\Desinstalar.exe" /S'
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoRepair" 1
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "${UNINST_KEY}" "EstimatedSize" "$0"
SectionEnd

Section "Uninstall"
  nsExec::Exec 'taskkill /IM "${EXE}" /F'
  Pop $0
  Delete "$SMPROGRAMS\${APP}.lnk"
  Delete "$DESKTOP\${APP}.lnk"
  ; só apaga a pasta se ela for mesmo a do jogo
  IfFileExists "$INSTDIR\${EXE}" 0 +2
    RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${UNINST_KEY}"
  ; As contas (contas.json em %APPDATA%\Masmorra do Deploy) são mantidas de propósito.
SectionEnd
