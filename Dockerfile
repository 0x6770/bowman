#------------------------------------------------------------------------------
# Intermediate Stage
# 1. clone lab repo from github
#------------------------------------------------------------------------------

FROM ubuntu AS intermediate

# update apt source, install git and open-ssh
RUN apt-get update && apt-get install -y \ 
    openssh-client \
    git

## make .ssh, give it the right permissions, and add github.com to known_hosts
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

# clone repo to /langproc-2020-lab using shared ssh-agent connection 
# should be securer than passing content of key via ARG, inspired by ELEC50009 lab
RUN --mount=type=ssh git clone git@github.com:0x6770/bowman.git /bowman

#------------------------------------------------------------------------------
# Build react front end 
#------------------------------------------------------------------------------
From node AS node

ENV DIR /app

COPY --from=intermediate /bowman/bowman_front_end ${DIR}

WORKDIR ${DIR}

RUN yarn && yarn build 

#------------------------------------------------------------------------------
# Final Stage
# 1. install required tools
# 2. copy lab repo
#------------------------------------------------------------------------------

From hayd/alpine-deno

ENV DIR /bowman

WORKDIR ${DIR}

COPY --from=intermediate /bowman/bowman_server ${DIR}

RUN mkdir -p ${DIR}/public

COPY --from=node /app/build ${DIR}/public

RUN deno cache mod.ts

CMD ["run", "--allow-net", "--allow-read", "mod.ts"]
