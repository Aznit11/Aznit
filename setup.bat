@echo off
echo Setting up AzniT e-commerce website...

rem Install dependencies
echo Installing dependencies...
call npm install

rem Create necessary directories if they don't exist
echo Creating necessary directories...
if not exist "public\images" mkdir public\images

rem Install specific packages if needed
echo Installing additional packages...
call npm install --save react-icons @heroicons/react next-themes

rem Build the project
echo Building the project...
call npm run build

echo Setup complete! You can now run the development server with:
echo npm run dev 