# HTTPS Setup with Let's Encrypt

## Prerequisites
- A domain name pointing to your server's IP
- Port 80 and 443 open on your firewall

## Step 1: Install Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# Or using snap (recommended)
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

## Step 2: Obtain SSL Certificate

Stop any services using port 80, then run:

```bash
sudo certbot certonly --standalone -d your-domain.com
```

Or if you have nginx running:

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d your-domain.com
```

## Step 3: Update Configuration

1. Edit `nginx-ssl.conf` and replace `your-domain.com` with your actual domain
2. Use the SSL docker-compose file:

```bash
docker-compose -f docker-compose.ssl.yml up -d --build
```

## Step 4: Auto-Renewal

Add a cron job for auto-renewal:

```bash
sudo crontab -e
```

Add this line:
```
0 0,12 * * * certbot renew --quiet && docker-compose -f docker-compose.ssl.yml restart app
```

## Quick Alternative: Cloudflare Tunnel (Free HTTPS)

If you don't have a domain or want a quick solution:

```bash
# Install cloudflared
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Run tunnel (gives you a free HTTPS URL)
cloudflared tunnel --url http://localhost:8004
```

This instantly gives you a `*.trycloudflare.com` HTTPS URL that works with camera access!

## Verify Camera Works

After HTTPS is set up, test camera access:
1. Open your HTTPS URL in Safari/Chrome
2. Click the camera button
3. Accept the permission prompt
4. Camera should now work!
