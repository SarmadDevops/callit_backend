# 🐳 Docker MongoDB Setup Guide

## Overview

This guide shows how to run MongoDB locally using Docker Compose, so you don't need to install MongoDB manually.

**Benefits:**
- ✅ No installation needed - Docker handles it
- ✅ Easy to start/stop
- ✅ Automatic backups in volumes
- ✅ Consistent environment
- ✅ Easy to reset database

---

## Prerequisites

You need to have **Docker** and **Docker Compose** installed:

### Check if Docker is installed:
```bash
docker --version
```

Should output something like: `Docker version 20.10.x`

### Check if Docker Compose is installed:
```bash
docker-compose --version
```

Should output something like: `Docker Compose version 2.x.x`

**If not installed:**
- **Mac:** Download Docker Desktop from https://www.docker.com/products/docker-desktop
- **Windows:** Download Docker Desktop from https://www.docker.com/products/docker-desktop
- **Linux:** Follow https://docs.docker.com/compose/install/

---

## Setup Steps

### Step 1: Check docker-compose.yml

The file `docker-compose.yml` should already exist in your project with:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: callit_mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
      MONGO_INITDB_DATABASE: callit_db
    volumes:
      - mongodb_data:/data/db
```

✅ This is already created for you!

### Step 2: Check .env File

Your `.env` file should have the MongoDB connection string for Docker:

```env
MONGO_URI=mongodb://admin:admin123@localhost:27017/callit_db?authSource=admin
```

✅ This is already updated for you!

### Step 3: Start MongoDB with Docker

Open terminal in your project folder and run:

```bash
docker-compose up -d
```

**What this does:**
- `docker-compose up` → Start the services
- `-d` → Run in background (detached mode)

**You should see:**
```
Creating callit_mongodb ... done
```

✅ MongoDB is now running!

### Step 4: Verify MongoDB is Running

Check container status:

```bash
docker-compose ps
```

You should see:
```
NAME              COMMAND                  SERVICE    STATUS
callit_mongodb    mongod                   mongodb    Up 40s
```

✅ MongoDB container is up!

---

## Testing MongoDB Connection

### Option 1: Using MongoDB Shell (mongosh)

Install mongosh:
```bash
brew install mongosh  # Mac
# Or download from https://www.mongodb.com/try/download/shell
```

Connect to MongoDB:
```bash
mongosh "mongodb://admin:admin123@localhost:27017/callit_db?authSource=admin"
```

You should see:
```
callit_db>
```

Try a command:
```bash
show databases
```

You should see databases listed!

✅ MongoDB is working!

### Option 2: Using Node.js (From Your Backend)

Run your backend:
```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

✅ Your backend connected to MongoDB!

### Option 3: Using Docker Exec

Check logs from inside container:
```bash
docker-compose logs mongodb
```

You should see MongoDB starting up messages.

✅ MongoDB is running!

---

## Common Docker Commands

### Start MongoDB
```bash
docker-compose up -d
```

### Stop MongoDB
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs mongodb
```

### View logs in real-time
```bash
docker-compose logs -f mongodb
```

### Reset everything (DELETE all data!)
```bash
docker-compose down -v
```

Warning: This deletes the MongoDB database! Only use if you want to start fresh.

### Restart MongoDB
```bash
docker-compose restart mongodb
```

### Connect to MongoDB shell
```bash
docker exec -it callit_mongodb mongosh -u admin -p admin123
```

---

## .env Configuration Explained

### MONGO_URI Breakdown

Your connection string:
```
mongodb://admin:admin123@localhost:27017/callit_db?authSource=admin
```

What each part means:
```
mongodb://        ← Protocol
admin             ← Username
:admin123         ← Password
@localhost       ← Host (localhost = your machine)
:27017           ← Port (default MongoDB port)
/callit_db       ← Database name
?authSource=admin ← Authentication database
```

### Docker vs Remote MongoDB

**Docker (Local - Current Setup):**
```env
MONGO_URI=mongodb://admin:admin123@localhost:27017/callit_db?authSource=admin
```

**Remote (Atlas/Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/callit_db
```

✅ You're using Docker (local) which is perfect for development!

---

## Volumes Explained

Your docker-compose.yml creates volumes:

```yaml
volumes:
  - mongodb_data:/data/db
```

This means:
- MongoDB stores data in `mongodb_data` volume
- Data persists even if container stops
- You can backup/restore this volume
- Delete with `docker-compose down -v`

**Where is the data stored?**
- **Mac/Linux:** `~/.docker/volumes/`
- **Windows:** `%APPDATA%\Docker\volumes\`

---

## Troubleshooting

### Issue: "docker-compose: command not found"
**Solution:**
- Install Docker Desktop which includes Docker Compose
- Or install Docker Compose separately

### Issue: Port 27017 already in use
**Solution:**
Option 1: Change port in docker-compose.yml
```yaml
ports:
  - "27018:27017"  # Use 27018 instead
```

Option 2: Stop other MongoDB processes
```bash
# Find what's using port 27017
lsof -i :27017
# Kill the process
kill -9 <PID>
```

### Issue: "MongoDB connected error" when running backend
**Solution:**
1. Check MongoDB is running: `docker-compose ps`
2. Check MONGO_URI in .env is correct
3. Check credentials match (admin/admin123)
4. Try connecting with mongosh
5. Check logs: `docker-compose logs mongodb`

### Issue: Container won't start
**Solution:**
```bash
# Check logs
docker-compose logs mongodb

# Restart
docker-compose restart mongodb

# Or restart from scratch
docker-compose down
docker-compose up -d
```

### Issue: Can't connect with mongosh
**Solution:**
```bash
# Make sure you're using correct credentials
mongosh "mongodb://admin:admin123@localhost:27017/callit_db?authSource=admin"

# If still failing, check if MongoDB is running
docker-compose ps
```

---

## Workflow Example

Here's a typical development workflow:

### Morning (Start work)
```bash
# Start MongoDB
docker-compose up -d

# Start backend
npm start

# Terminal 2: Test APIs
# (Run your payment system tests)
```

### End of day (Stop work)
```bash
# Stop MongoDB
docker-compose down
```

### Next morning (Start again)
```bash
# Data persists! Just restart
docker-compose up -d

# Your database still has all data
```

---

## Advanced: Custom Credentials

Want to change username/password?

Edit `docker-compose.yml`:
```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: myuser
  MONGO_INITDB_ROOT_PASSWORD: mypassword
```

Edit `.env`:
```env
MONGO_URI=mongodb://myuser:mypassword@localhost:27017/callit_db?authSource=admin
```

Restart:
```bash
docker-compose down -v
docker-compose up -d
```

⚠️ Using `-v` deletes data! Only use when first setting up.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start MongoDB | `docker-compose up -d` |
| Stop MongoDB | `docker-compose down` |
| Check status | `docker-compose ps` |
| View logs | `docker-compose logs mongodb` |
| Connect shell | `mongosh "mongodb://admin:admin123@localhost:27017"` |
| Reset (delete data) | `docker-compose down -v` |

---

## Next Steps

1. ✅ Docker Compose set up
2. ✅ .env configured
3. → Start MongoDB: `docker-compose up -d`
4. → Test connection: `npm start`
5. → Run payment tests

---

## Support

**Official MongoDB Docker Image:**
https://hub.docker.com/_/mongo

**Docker Compose Documentation:**
https://docs.docker.com/compose/

**Troubleshooting:**
Check `docker-compose logs mongodb` for error messages

