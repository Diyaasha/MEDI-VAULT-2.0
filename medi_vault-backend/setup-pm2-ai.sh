#!/bin/bash

# Step 1: Start the AI processing job with PM2
pm2 start jobs/processAiSimplifiedDocs.js --name ai-simplified-processor

# Step 2: Generate system startup script and get the command to run with sudo
STARTUP_CMD=$(pm2 startup | grep sudo)

# Step 3: Run the generated command with sudo to configure startup (ask for password)
eval $STARTUP_CMD

# Step 4: Save current process list so PM2 will auto-restart your job on reboot
pm2 save

# Step 5: Show status and logs to confirm setup
pm2 ls
pm2 logs ai-simplified-processor --lines 20
