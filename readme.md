For primsa 

0 --> put your pgsql url into the .env file

1 --> npm i -D prisma @types/pg


2 --> npm install @prisma/client@7.10.0 @prisma/adapter-pg pg


3 --> npx prisma init --datasource-provider postgresql --output ../generated/prisma run this command 


4 --> npx prisma generate 


5 --> make db.ts file connect your prisma client to your db


6 --> make tables and migrate to it and generate client for that

