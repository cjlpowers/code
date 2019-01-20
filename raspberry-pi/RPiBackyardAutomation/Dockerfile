FROM microsoft/dotnet:2.1-sdk as build  
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o out -r linux-arm

FROM microsoft/dotnet:2.1-runtime-stretch-slim-arm32v7 as runtime

WORKDIR /app
COPY --from=build /app/out ./

CMD ["dotnet", "RPiBackyardAutomation.dll"]