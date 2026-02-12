FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/Backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-Dserver.port=${PORT:8080}", "-jar", "app.jar"]
