# Dockerfile
FROM openjdk:17-jdk-alpine
MAINTAINER v1nf4k

# Copy the application JAR file to the container
COPY target/chatapp-0.0.1-SNAPSHOT.jar /chatapp.jar

# Define the entrypoint to run the JAR
ENTRYPOINT ["java", "-jar", "/chatapp.jar"]
