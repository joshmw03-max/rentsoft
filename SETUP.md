# Quick Setup Guide for RentSoft

Follow these steps to get RentSoft running on your local machine.

## Step 1: Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from [PostgreSQL.org](https://www.postgresql.org/download/windows/)

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE rentsoft;
CREATE USER rentsoft_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE rentsoft TO rentsoft_user;

# Exit psql
\q
```

## Step 3: Configure Environment

Update the `.env` file in the project root:

```env
DATABASE_URL="postgresql://rentsoft_user:your_password_here@localhost:5432/rentsoft?schema=public"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Initialize Database

```bash
# Push schema to database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed with demo data
npm run db:seed
```

You should see output like:
```
🌱 Seeding database...
✅ Users created
✅ Properties created
✅ Amenities created
✅ Units created
✅ Lease created
✅ Payments created
✅ Application created
✅ Maintenance request created
🎉 Seeding completed successfully!
```

## Step 6: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 7: Login with Demo Accounts

### Admin Account
- Email: `admin@rentsoft.com`
- Password: `admin123`

### Property Manager Account
- Email: `manager@rentsoft.com`
- Password: `manager123`

### Tenant Account
- Email: `tenant1@example.com`
- Password: `tenant123`

## Troubleshooting

### Database Connection Issues

If you see `P1001: Can't reach database server`:

1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Verify credentials in `.env` match your PostgreSQL setup

3. Try connecting manually:
   ```bash
   psql -h localhost -U rentsoft_user -d rentsoft
   ```

### Port Already in Use

If port 3000 is busy:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Prisma Client Issues

If you see Prisma client errors:
```bash
# Regenerate Prisma Client
npm run db:generate

# Or delete and reinstall
rm -rf node_modules/.prisma
npm run db:generate
```

### Reset Database

To start fresh:
```bash
# Drop all tables
npx prisma migrate reset

# Or manually in psql
psql -U rentsoft_user -d rentsoft -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then reinitialize
npm run db:push
npm run db:seed
```

## Next Steps

1. Explore the dashboard at `/dashboard`
2. Try creating a new property
3. Submit a tenant application
4. Create a lease and payment
5. Submit a maintenance request

## Development Tools

### Prisma Studio
View and edit your database visually:
```bash
npx prisma studio
```

### Database Migrations
When you modify the schema:
```bash
npm run db:push
npm run db:generate
```

## Production Deployment

See the main README.md for production deployment instructions.

## Need Help?

- Check the main README.md for full documentation
- Review the API endpoints section
- Examine the database schema in `prisma/schema.prisma`
