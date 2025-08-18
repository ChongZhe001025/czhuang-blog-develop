This guide walks you through deploying a production-ready Jenkins environment using Docker, including best practices for security, agent setup, and troubleshooting.

---

## 1. Create a Dedicated Docker Network
Isolate Jenkins and its agents for better security and communication:
```sh
docker network create jenkins
```

## 2. Start Docker-in-Docker (DinD) Service Container
This container provides Docker CLI access for Jenkins jobs:
```sh
docker run --name jenkins-docker --rm --detach \
  --privileged --network jenkins --network-alias docker \
  --env DOCKER_TLS_CERTDIR=/certs \
  --volume jenkins-docker-certs:/certs/client \
  --volume jenkins-data:/var/jenkins_home \
  --publish 2376:2376 docker:dind
```
> **Note:** Use `--privileged` only if necessary. For most CI/CD use cases, mounting the host's Docker socket is safer and simpler.

## 3. Build a Custom Jenkins Image with Docker CLI Support
Create a `Dockerfile` to extend the official Jenkins image and add Docker CLI:
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

## 4. Build the Jenkins Image
```sh
docker build -t myjenkins-blueocean:2.479.1-1 .
```

## 5. Run Jenkins with Docker Integration
```sh
docker run --name jenkins-blueocean --restart=on-failure --detach \
  --network jenkins --env DOCKER_HOST=tcp://docker:2376 \
  --env DOCKER_CERT_PATH=/certs/client --env DOCKER_TLS_VERIFY=1 \
  --volume jenkins-data:/var/jenkins_home \
  --volume jenkins-docker-certs:/certs/client:ro \
  --publish 8080:8080 --publish 50000:50000 myjenkins-blueocean:2.479.1-1
```
- Access Jenkins at: [http://localhost:8080](http://localhost:8080)

## 6. Retrieve the Initial Jenkins Admin Password
```sh
docker exec -it jenkins-blueocean cat /var/jenkins_home/secrets/initialAdminPassword
```

## 7. Deploy a Jenkins Agent (for Docker builds)
- **Create a Dockerfile for the agent:**
```dockerfile
FROM jenkins/inbound-agent
USER root
RUN apt-get update && \
    apt-get install -y docker.io
```
- **Build the agent image:**
```sh
docker build -t jenkins/inbound-agent .
```
- **Run the agent container:**
```sh
docker run --name <agent_name> \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --init jenkins/inbound-agent \
  -url http://<jenkins-server>:<port> \
  -workDir=/<path_to_workDir> <secret> <agent_name>
```
> **Tip:** Mounting `/var/run/docker.sock` allows the agent to build and run Docker containers on the host.

---
By following this guide, you can set up a robust, scalable, and secure Jenkins environment on Docker for modern CI/CD workflows. 🚀