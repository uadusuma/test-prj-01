# How to Run Redis on Windows

Since Redis does not officially support Windows directly, you have a few options. Here are the two best ways to get started from scratch.

## Option 1: Memurai (Easiest Native Windows Solution)
Memurai is a Redis-compatible cache and datastore for Windows. It runs natively without needing Linux or Docker.

1.  **Download**: Go to [https://www.memurai.com/get-memurai](https://www.memurai.com/get-memurai).
2.  **Install**: Download the "Developer Edition" (free) and run the installer.
3.  **Run**:
    *   Memurai usually installs itself as a Windows Service, so it might already be running!
    *   Open your Command Prompt or PowerShell.
    *   Type `memurai-cli` to verify it's working.
    *   If you need to start the server manually, look for "Memurai" in your Start Menu or run `memurai.exe` from the installation folder.

## Option 2: Redis on Windows (Community Port)
There is a standalone `.zip` version of Redis 5.0.14 for Windows maintained by the community.

1.  **Download**: Go to the GitHub release page: [https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases).
2.  **Select File**: Download `Redis-x64-5.0.14.1.zip`.
3.  **Extract**: Unzip the folder to a location like `C:\Redis`.
4.  **Run Server**:
    *   Open PowerShell or Command Prompt.
    *   Navigate to the folder: `cd C:\Redis`
    *   Run the server: `./redis-server.exe`
5.  **Test**:
    *   Open a *new* terminal window.
    *   Navigate to the folder: `cd C:\Redis`
    *   Run the client: `./redis-cli.exe`
    *   Type `ping`. If it replies `PONG`, you are good to go!

## Option 3: WSL (Windows Subsystem for Linux) - Recommended for Advanced Users
This gives you the official, latest Redis version running in a real Linux environment.

1.  **Install WSL**: Open PowerShell as Administrator and run `wsl --install`. Restart your computer if asked.
2.  **Open Ubuntu**: After restart, open "Ubuntu" from your Start Menu.
3.  **Install Redis**:
    ```bash
    sudo apt-get update
    sudo apt-get install redis-server
    ```
4.  **Start Redis**:
    ```bash
    sudo service redis-server start
    ```
5.  **Test**:
    ```bash
    redis-cli ping
    ```

---

### Configuring Your Project
Once Redis is running (using any option above), your current project configuration in `server/.env` should work automatically because the default settings are:
- **Host**: `localhost`
- **Port**: `6379`
