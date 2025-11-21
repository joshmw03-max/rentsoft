# RentSoft - Property Management Platform

A comprehensive property management platform built with Next.js, TypeScript, PostgreSQL, and Prisma. Inspired by AppFolio, RentSoft provides all the tools needed to manage properties, tenants, leases, payments, and maintenance requests.

## Features

### Core Modules

- **Property & Unit Management** - Manage multiple properties with detailed unit information
- **Tenant Management** - Handle tenant applications, screening, and profiles
- **Lease Management** - Create and manage digital lease agreements
- **Payment Processing** - Track rent payments, late fees, and payment history
- **Maintenance Requests** - Work order system with priority and status tracking
- **User Portals** - Separate interfaces for admins, property managers, and tenants
- **Role-Based Access Control** - Secure access with ADMIN, PROPERTY_MANAGER, and TENANT roles
- **Dashboard & Analytics** - Real-time insights into portfolio performance

### Key Capabilities

- Multi-property portfolio management
- Online tenant applications with document upload
- Automated lease creation and tracking
- Payment history and revenue reporting
- Maintenance request tracking with priority levels
- Unit availability tracking
- Property amenity management
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credential-based auth
- **Payment Processing**: Stripe integration ready
- **Email**: Nodemailer integration ready

## Database Schema

The platform includes comprehensive models for:

- Users (with role-based access)
- Properties & Units
- Amenities
- Tenant Applications
- Leases
- Payments
- Maintenance Requests
- Documents
- Notifications

See `prisma/schema.prisma` for the complete schema.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and navigate to the project:**

```bash
cd rentsoft
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up your database:**

Edit the `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rentsoft?schema=public"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Initialize the database:**

```bash
# Push the schema to your database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed with demo data
npm run db:seed
```

5. **Start the development server:**

```bash
npm run dev
```

6. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Credentials

After running the seed script, you can log in with these accounts:

### Admin
- **Email**: admin@rentsoft.com
- **Password**: admin123
- Full access to all features

### Property Manager
- **Email**: manager@rentsoft.com
- **Password**: manager123
- Manage properties, units, leases, and tenants

### Tenant
- **Email**: tenant1@example.com
- **Password**: tenant123
- View lease, pay rent, submit maintenance requests

## Project Structure

```
rentsoft/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth authentication
│   │   ├── properties/        # Property CRUD
│   │   ├── units/             # Unit management
│   │   ├── applications/      # Tenant applications
│   │   ├── leases/            # Lease management
│   │   ├── payments/          # Payment processing
│   │   ├── maintenance/       # Maintenance requests
│   │   └── dashboard/         # Dashboard stats
│   ├── dashboard/             # Admin/Manager dashboard
│   ├── login/                 # Login page
│   └── page.tsx               # Home (redirects to login)
├── components/
│   └── Navbar.tsx             # Navigation component
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   └── prisma.ts              # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
└── types/
    └── next-auth.d.ts         # NextAuth type extensions
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property
- `GET /api/properties/[id]` - Get property details
- `PATCH /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property (admin only)

### Units
- `GET /api/units?propertyId=xyz` - List units
- `POST /api/units` - Create unit

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Submit application

### Leases
- `GET /api/leases` - List leases
- `POST /api/leases` - Create lease

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

### Maintenance
- `GET /api/maintenance` - List maintenance requests
- `POST /api/maintenance` - Create maintenance request

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Development Roadmap

### Completed
- ✅ Database schema and migrations
- ✅ Authentication and role-based access
- ✅ Property and unit management
- ✅ Tenant application system
- ✅ Lease management
- ✅ Payment tracking
- ✅ Maintenance request system
- ✅ Admin dashboard

### Next Steps
- 📋 Complete property management UI pages
- 📋 Build tenant portal pages
- 📋 Implement Stripe payment processing
- 📋 Add email notifications
- 📋 File upload for documents and images
- 📋 Advanced reporting and analytics
- 📋 Calendar integration for showings
- 📋 Automated rent collection reminders
- 📋 Lease renewal workflow
- 📋 Vendor management system

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rentsoft?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"

# Email (for notifications)
EMAIL_SERVER="smtp://user:password@smtp.example.com:587"
EMAIL_FROM="noreply@rentsoft.com"
```

## Database Commands

```bash
# Push schema changes to database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed database with demo data
npm run db:seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deployment Platforms

This app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Railway** (with PostgreSQL)
- **Heroku**
- **AWS/Google Cloud/Azure**

Make sure to:
1. Set up a production PostgreSQL database
2. Configure all environment variables
3. Run database migrations
4. Change default passwords

## Security Considerations

- All passwords are hashed with bcrypt
- NextAuth.js handles session management
- Role-based access control on all API routes
- Input validation with Zod (ready to implement)
- SQL injection protection via Prisma ORM

## Contributing

This is a demonstration project. For production use:
1. Implement comprehensive error handling
2. Add input validation on all forms
3. Set up proper logging and monitoring
4. Implement rate limiting
5. Add comprehensive testing
6. Set up CI/CD pipelines

## License

MIT License - feel free to use this project as a starting point for your own property management platform.

## Support

For issues and questions, please open an issue on the project repository.

---

Built with ❤️ using Next.js, TypeScript, and Prisma
