## Getting Started

First, change the .env.example to .env and set the variables and then run the development server:

Using Docker
```bash
Docker compose up --build
```

OR

setup postgres in your machine and then

To connect to pg server or after any change in the prisma.schema file
```bash
npx prisma migrate dev --name init --skip-seed
npx prisma db push
```

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:5000) with your browser to see the result.