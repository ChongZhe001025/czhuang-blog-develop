## 1. Build Network in Docker
```sh
docker network create jenkins
```

## 2. Run Docker: dind Image
```sh
docker run --name jenkins-docker --rm --detach \
  --privileged --network jenkins --network-alias docker \
  --env DOCKER_TLS_CERTDIR=/certs \
  --volume jenkins-docker-certs:/certs/client \
  --volume jenkins-data:/var/jenkins_home \
  --publish 2376:2376 docker:dind
```

## 3. Create a Dockerfile to Customize the Official Jenkins Docker Image
```dockerfile
FROM jenkins/jenkins:2.479.1-jdk17
USER root
RUN apt-get update && apt-get install -y lsb-release
RUN curl -fsSLo /usr/share/keyrings/docker-archive-keyring.asc \
  https://download.docker.com/linux/debian/gpg
RUN echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/docker-archive-keyring.asc] \
  https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
RUN apt-get update && apt-get install -y docker-ce-cli
USER jenkins
RUN jenkins-plugin-cli --plugins "blueocean docker-workflow"
```

## 4. Build a New Docker Image from the Dockerfile
```sh
docker build -t myjenkins-blueocean:2.479.1-1 .
```

## 5. Run the Image as a Container in Docker
```sh
docker run --name jenkins-blueocean --restart=on-failure --detach \
  --network jenkins --env DOCKER_HOST=tcp://docker:2376 \
  --env DOCKER_CERT_PATH=/certs/client --env DOCKER_TLS_VERIFY=1 \
  --volume jenkins-data:/var/jenkins_home \
  --volume jenkins-docker-certs:/certs/client:ro \
  --publish 8080:8080 --publish 50000:50000 myjenkins-blueocean:2.479.1-1
```

## 6. Use a Browser to Connect to Jenkins
```sh
http://localhost:8080
```

## 7. Get the Initial Jenkins Login Password
```sh
docker exec -it jenkins-blueocean cat /var/jenkins_home/secrets/initialAdminPassword
```

## 8. Deploy Agent  
- **Create Dockerfile**
```dockerfile
FROM jenkins/inbound-agent
USER root
RUN apt-get update && \
    apt-get install -y docker.io
```
- **Build Image**
```sh
docker build -t jenkins/inbound-agent .
```
- **Mount the Docker Socket File When Starting the Jenkins Agent Container**
```sh
docker run --name <agent_name> \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --init jenkins/inbound-agent \
  -url http://<jenkins-server>:<port> \
  -workDir=/<path_to_workDir> <secret> <agent_name>
