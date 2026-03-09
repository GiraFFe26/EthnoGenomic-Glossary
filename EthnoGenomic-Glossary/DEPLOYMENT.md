# Deployment guide

Target host from the user message: `ssh.cloud.nstu.ru:5159` (internal `172.17.7.181:22`). The app is exposed on port `3000`, which is NATed to `217.71.129.139:5888`.

## 1) Prepare the server (run once)
- Install Docker (engine + compose plugin) and Git:
  ```bash
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl git gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
. /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker $USER
  ```
- Optional but recommended: create a dedicated deploy user and give it docker access:
  ```bash
  sudo adduser deploy
  sudo usermod -aG docker deploy
  sudo mkdir -p /opt/ethno
  sudo chown deploy:deploy /opt/ethno
  ```

## 2) SSH key for GitHub Actions
Generate a key pair locally (or from the runner) and authorize it on the server:
```bash
ssh-keygen -t ed25519 -f ./ethno_deploy_key -C "ethno deploy"
ssh-copy-id -i ./ethno_deploy_key.pub -p 5159 deploy@ssh.cloud.nstu.ru
```
Upload **the private key** (`ethno_deploy_key`) to the GitHub secret `DEPLOY_KEY`. The public key stays on the server in `~/.ssh/authorized_keys`.

## 3) First manual deploy
```bash
ssh -p 5159 deploy@ssh.cloud.nstu.ru
cd /opt/ethno
git clone git@github.com:goghi48/EthnoGenomic-Glossary.git .
docker compose up -d --build
```
Check containers: `docker compose ps` and `docker compose logs -f backend`.

## 4) Configure GitHub Actions
Set repository secrets:
- `SERVER_HOST`: `ssh.cloud.nstu.ru`
- `SERVER_PORT`: `5159`
- `SERVER_USER`: `deploy` (or your chosen user)
- `DEPLOY_KEY`: private key content from step 2

If you need to change the deploy directory, branch, or repo URL, edit the `env` block at the top of `.github/workflows/deploy.yml` (`APP_DIR`, `BRANCH`, `REPO_URL`).

## 5) What the workflow does
On every push to `main`, the job:
1. SSHes to the server with the deploy key.
2. Clones the repo into `APP_DIR` if missing.
3. Fetches and hard-resets to the requested branch.
4. Builds/pulls Docker images and runs `docker compose up -d --remove-orphans`.
5. Cleans unused Docker images (`docker image prune -f`).

The frontend will be reachable at `http://217.71.129.139:5888/` after the containers start.
