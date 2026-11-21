FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /build/target/erevive-backend-1.0.0.jar /app/app.jar

# Render (and most hosts) inject PORT; DATABASE_URL and ALLOWED_ORIGINS
# are set as environment variables on the host.
ENV PORT=8080
EXPOSE 8080

# Keep memory within small (512 MB) free-tier instances.
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75 -Duser.timezone=UTC -jar /app/app.jar"]
