# Sample Login Credentials for CryptPro Platform

## Admin Account
```
Email: admin@cryptopro.com
Password: Admin@123456
Role: ADMIN
```

## Regular User Accounts
```
Email: user1@example.com
Password: User1@123456
Role: USER

Email: user2@example.com
Password: User2@123456
Role: USER
```

## How to Create an Admin Account

To create an admin account, you need to modify the `role` field in the database after registration. Here's how:

1. Register a new account through the standard registration form
2. Use the Prisma CLI to update the user's role to ADMIN:

```bash
# Run this from your project root
npx prisma studio
```

This will open Prisma Studio at http://localhost:5555 where you can:
1. Navigate to the "User" table
2. Find the user you want to promote
3. Change their "role" field from "USER" to "ADMIN"
4. Click Save

Alternatively, you can run this Prisma script:

```javascript
// create-admin.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
  }
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    
    console.log(`User ${user.email} has been updated to ADMIN role`);
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

And then run:
```bash
node create-admin.js user@example.com
```

## Security Notice

Remember to change these passwords in production. These are only sample credentials for development purposes.
