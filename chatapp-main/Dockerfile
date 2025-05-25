# Dockerfile
FROM openjdk:17-jdk-alpine
MAINTAINER v1nf4k

# Copy the application JAR file to the container
COPY target/chatapp-0.0.1-SNAPSHOT.jar /chatapp.jar
# Copy keystore into container (giả sử bạn đặt keystore.p12 ở thư mục gốc cùng Dockerfile)
COPY ./src/main/resources/keystore.p12 /keystore.p12


# Define the entrypoint to run the JAR
ENTRYPOINT ["java", "-jar", "/chatapp.jar"]
