@echo off
echo ========================================
echo   INSTALADOR SISTEMA RESERVA AUTOBUSES
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descarga Node.js desde: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/4] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [3/4] Verificando MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: MySQL no encontrado en PATH
    echo Asegurate de tener MySQL instalado y funcionando
)

echo.
echo [4/4] Configuracion completada
echo.
echo ========================================
echo           INSTRUCCIONES
echo ========================================
echo 1. Asegurate de que MySQL este funcionando
echo 2. Ejecuta: npm start
echo 3. Visita: http://localhost:3000/create-database
echo 4. Luego: http://localhost:3000/init-db
echo 5. Sistema listo en: http://localhost:3000
echo.
echo Admin panel: http://localhost:3000/admin.html
echo ========================================
echo.
pause