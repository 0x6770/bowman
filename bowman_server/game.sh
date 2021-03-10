#!/bin/bash

URL=http://localhost:8080
SESSION=
NAME=
ID=
X=

# add players 
function addPlayer {
  result=($(curl -s -X POST -H 'Content-Type: application/json'\
        -d '{"code": '"$1"', "name": "'"$2"'"}'\
        "${URL}"\
        | jq '.id,.x')) # [id, x]
  ID=${result[0]}
  X=${result[1]}
  NAME=$2
}

# print all players
function printAll {
  printf "=========================\n"
  printf "name\thp\tx\n"
  printf "=========================\n"
  curl -s -X GET -H 'Content-Type: application/json'\
    -d '{"code": '"${SESSION}"'}'\
    "${URL}"/players\
    | jq -r '.[] | "\(.name)\t\(.hp)\t\(.x)"' 2>/dev/null
  if (( $? != 0 ));then
    echo "invalid code"
    exit 1
  fi
}

# fire an arrow
function fire {
x=$(curl -s -X POST -H 'Content-Type: application/json'\
  -d '{"code": '"${SESSION}"', "id": '"${ID}"', "angle": '"$1"', "velocity": '"$2"'}'\
  "${URL}"/fire | jq '.x')
echo -e "\033[31m${NAME} shoot from ${X} to ${x}\033[0m"
}


# Main
read -p "Start a new Game (y/n)?" choice
case "$choice" in 
  y|Y ) 
    echo "Starting new Game"
    SESSION=$(curl -s -X POST -H 'Content-Type: application/json' "${URL}"/start | jq '.code')
    echo -e "Started Game with Code: \033[1;31m${SESSION}\033[0;m"
    ;;
  n|N ) 
    echo "Joining Game"
    read -p "Session Code: " SESSION
    ;;
  * ) echo "invalid option" && exit 1;;
esac

read -p "Your Name: " NAME
addPlayer "${SESSION}" "${NAME}"

echo "All players in this game."
printAll

while true; do
  echo
  echo    "#########################"
  echo    "# Hi ${NAME}, you are at ${X}"
  read -p "# angle: " angle
  read -p "# velocity: " velocity
  echo    "#########################"
  echo 
  fire "${angle}" "${velocity}"
  printAll
done

