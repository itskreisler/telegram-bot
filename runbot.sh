#!/bin/bash
while :
do
    rand=$RANDOM
    dt=$(date '+%d/%m/%Y %H:%M:%S');
    printf "${dt} - Init: ${rand}\n"
    git pull
    echo "Starting NODE bot"
    node bot.js #npm run dev
    echo "Script terminated, restarting in 2 minutes..."
    dt=$(date '+%d/%m/%Y %H:%M:%S');
    printf "${dt} - finished: ${rand}\n"
    sleep 120
    clear
done