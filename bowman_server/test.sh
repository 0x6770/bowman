#!/bin/bash

URL=http://localhost:8080
SESSION=
NAME=
ID=
X=

# start a session
SESSION=$(curl -s -X POST -H 'Content-Type: application/json' "${URL}"/start | jq '.code')
echo started session: ${SESSION}

# add players 
function addPlayer {
  result=($(curl -s -X POST -H 'Content-Type: application/json'\
        -d '{"code": '"$1"', "name": "'"$2"'"}'\
        "${URL}"\
        | jq '.id,.x')) # [id, x]
  ID=${result[0]}
  X=${result[1]}
  NAME=$2
  echo Added new player: $2
}

addPlayer $SESSION a
addPlayer $SESSION b
addPlayer $SESSION c
addPlayer $SESSION d

# print all players
function printAll {
  printf "=========================\n"
  printf "name\thp\tx\n"
  printf "=========================\n"
  curl -s -X GET -H 'Content-Type: application/json'\
    -d '{"code": '"${SESSION}"'}'\
    "${URL}"/players\
    | jq -r '.[] | "\(.name)\t\(.hp)\t\(.x)"'
}

# fire an arrow
function fire {
x=$(curl -s -X POST -H 'Content-Type: application/json'\
  -d '{"code": '"${SESSION}"', "id": '"${ID}"', "angle": '"$1"', "velocity": '"$2"'}'\
  "${URL}"/fire | jq '.x')
echo -e "\033[31m${NAME} shoot from ${X} to ${x}\033[0m"
}

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

