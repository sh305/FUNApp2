# 1. Build stage (.NET 10 SDK)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Project file copy karke restore karein
COPY *.csproj ./
RUN dotnet restore

# Baaki sara code copy karke build & publish karein
COPY . ./
RUN dotnet publish -c Release -o /out

# 2. Runtime stage (.NET 10 ASP.NET)
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .

# Render ke liye port set karein
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

# Backend Output DLL Entrypoint
ENTRYPOINT ["dotnet", "YoYoVoiceChatApi.dll"]
