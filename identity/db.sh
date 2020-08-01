docker stop db && docker rm db
docker run -d -e POSTGRES_PASSWORD=postgres --name db -p 5432:5432 --tmpfs /var/lib/postgresql/data:rw postgres:12
sleep 3
yarn typeorm migration:run
 docker exec -it db psql -U postgres -c \
     "INSERT INTO \"user\"(email, \"phoneNumber\", \"givenName\", \"familyName\", locale, \"totpSecret\", \"totpRecovery\") VALUES 
         ('me@kschoon.me', '+12144497919', 'Kevin', 'Schoonover', 'test', '1', '1'), 
         ('me2@kschoon.me', '+12154497919', 'Kevin', 'Schoonover', 'test', '1', '1')"
 docker exec -it db psql -U postgres -c \
     "SELECT * FROM \"user\""
