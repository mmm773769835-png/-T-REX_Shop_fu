@echo off
echo Testing connectivity to T-REX Shop server...
echo.

echo Checking if server is running on port 4001...
netstat -an | findstr 4001

echo.
echo Testing local connection to server...
curl -v http://localhost:4001/api/health

echo.
echo Testing network connection to server...
curl -v http://172.20.44.26:4001/api/health

echo.
echo If you see "Connection refused" or timeout errors above, the server may not be running.
echo Make sure to start the server with: npm start (in the server directory)
pause