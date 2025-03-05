## Getting Started

First, change the .env.example to .env and set the variables and then run the development server:

setup postgres in your machine and then

To connect to pg server or after any change in the prisma.schema file
```bash
npx prisma migrate dev --name init --skip-seed
npx prisma db push
```
To self host your IPFS node using kubo-
1. follow the instructions on this link to install (https://docs.ipfs.tech/install/command-line/#install-official-binary-distributions)
2. once installed, run 
```bash
ipfs daemon
```
the daemon should be running on your machine to access files. 

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:5000) with your browser to see the result.