@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, ver. 3.2.0
@REM
@REM Optional ENV vars
@REM   MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM   MAVEN_BATCH_PAUSE - set to 'on' to wait for a key stroke before ending
@REM   MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM   MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible pre-existing ones, reset them here.
set MAVEN_HOME=
set MAVEN_PROJECTBASEDIR=
set MAVEN_CONFIG=

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%" == "" goto OkJavaHome

echo.
echo Error: JAVA_HOME is set to an invalid directory. >&2
echo JAVA_HOME = "%JAVA_HOME%" >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:OkJavaHome
if exist "%JAVA_HOME%\bin\java.exe" goto init

echo.
echo Error: JAVA_HOME is set to an invalid directory. >&2
echo JAVA_HOME = "%JAVA_HOME%" >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:init

@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".
@REM Fallback to current working directory if not found.

set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if not "%MAVEN_PROJECTBASEDIR%" == "" goto endDetectBaseDir

set EXEC_DIR=%CD%
set WRP_DIR=%~dp0
set WRP_DIR=%WRP_DIR:~0,-1%

:findBaseDir
if exist "%EXEC_DIR%\.mvn" (
    set MAVEN_PROJECTBASEDIR=%EXEC_DIR%
    goto endDetectBaseDir
)
if "%EXEC_DIR%" == "%EXEC_DIR:~0,3%" (
    set MAVEN_PROJECTBASEDIR=%WRP_DIR%
    goto endDetectBaseDir
)
for %%i in ("%EXEC_DIR%") do set EXEC_DIR=%%~dpi
set EXEC_DIR=%EXEC_DIR:~0,-1%
goto findBaseDir

:endDetectBaseDir

if not exist "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" (
    echo.
    echo Error: Could not find maven-wrapper.jar in %MAVEN_PROJECTBASEDIR%\.mvn\wrapper >&2
    echo.
    goto error
)

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

set MAVEN_CONFIG_FILE="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

"%JAVA_HOME%\bin\java.exe" %MAVEN_OPTS% -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %MAVEN_CONFIG_FILE% %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_BATCH_PAUSE%" == "on" goto mainEnd

:pauseEnd
pause

:mainEnd
if not "%ERROR_CODE%" == "0" exit /b %ERROR_CODE%
