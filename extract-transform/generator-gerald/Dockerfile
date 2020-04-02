FROM openjdk:8-jre-alpine

# Defining the working directoy
WORKDIR /app

# Copying the .jar to the working directory
COPY generator-gerald.jar /app

# Starting the generator
CMD exec java -jar generator-gerald.jar "{"company": "AR", "plant": "77", "importCountry": "DE", "periodRangeStart": 201910,"periodRangeEnd": 201911}" "/data/"