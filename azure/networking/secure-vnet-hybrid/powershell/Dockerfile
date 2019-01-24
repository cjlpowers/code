FROM mcr.microsoft.com/powershell
RUN pwsh -c "Install-Module -Name Az -AllowClobber -Scope CurrentUser -Force"
WORKDIR /app
COPY scripts scripts
ENTRYPOINT ["pwsh", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]