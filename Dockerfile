FROM ibm-semeru-runtimes:open-17-jre-focal

ENV PORT 8080
EXPOSE 8080

ADD target/secret-hitler-online.jar /secret-hitler-online.jar

CMD java -XX:MaxRAM=70m -jar /secret-hitler-online.jar