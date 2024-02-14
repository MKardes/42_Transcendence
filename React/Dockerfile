# Start the image with alpine 3.13
FROM debian:buster
# Getting nginx end Tsl (openssl for it)
RUN apt-get update
RUN apt-get install -y ca-certificates gnupg curl -y
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_21.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y
RUN mkdir -p /etc/ssl_volume
RUN npm install -g npm

RUN mkdir /root/React
COPY . /root/React
COPY init.sh /root/React
WORKDIR /root/React

RUN apt install openssl -y
RUN mkdir -p /etc/ssl_volume
# RUN npm install react-scripts

EXPOSE 3000

# ENTRYPOINT ["npm", "start"]
ENTRYPOINT [ "sh", "init.sh"]
# ENTRYPOINT ["sleep", "1000000000000"]
