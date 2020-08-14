docker stop db && docker rm db
docker run -d -e POSTGRES_PASSWORD=postgres --name db -p 5432:5432 --tmpfs /var/lib/postgresql/data:rw postgres:12
sleep 3
yarn typeorm migration:run --config ./src/lib/db.ts
 docker exec -it db psql -U postgres -c \
     "INSERT INTO \"user\"(email, \"phoneNumber\", \"givenName\", \"familyName\", locale, \"totpSecret\", \"totpRecovery\") VALUES 
         ('testing@kschoon.me', '+12148431643', 'Kevin', 'Schoonover', 'test', '1', '1'), 
         ('testing2@kschoon.me', '+18432341324', 'Kevin', 'Schoonover', 'test', '1', '1')"
 docker exec -it db psql -U postgres -c \
     "SELECT * FROM \"user\""
