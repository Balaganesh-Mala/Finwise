# Build all runner images

Write-Host "Building Python Runner..."
docker build -t runner-python ./python

Write-Host "Building Node Runner..."
docker build -t runner-node ./node

Write-Host "Building C Runner..."
docker build -t runner-c ./c

Write-Host "Building C++ Runner..."
docker build -t runner-cpp ./cpp

Write-Host "Building Java Runner..."
docker build -t runner-java ./java

Write-Host "Building SQL Runner..."
docker build -t runner-sql ./sql

Write-Host "All images built successfully!"
