@echo off

set DIR=%cd%
set JAVA_HOME=%DIR%\jdk
set CLASS_PATH=%DIR%\mes-auto-print.jar

"%JAVA_HOME%\bin\java" -Dmes.auto.print.path="%DIR%" -jar "%CLASS_PATH%"

:end 