# 🏥 Doctor Appointment System

A modern, responsive healthcare appointment management system built with Next.js 14, TypeScript, and Tailwind CSS. This application provides a comprehensive platform for patients to book appointments and doctors to manage their schedules.

## ✨ Features

### For Patients
- 👤 **User Registration & Authentication** - Secure account creation and login
- 📅 **Appointment Booking** - Easy-to-use appointment scheduling interface
- 🔍 **Doctor Search & Filter** - Find doctors by specialty, location, and availability
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop devices
- 📧 **Email Notifications** - Appointment confirmations and reminders
- 📋 **Appointment History** - View past and upcoming appointments

### For Doctors
- 🩺 **Professional Dashboard** - Comprehensive overview of appointments and schedule
- 📊 **Schedule Management** - Set availability and manage time slots
- 👥 **Patient Management** - View patient information and appointment history
- 📈 **Analytics** - Track appointment metrics and patient engagement

### System Features
- 🔐 **Secure Authentication** - JWT-based authentication system
- 🎨 **Modern UI/UX** - Clean, intuitive interface with healthcare-focused design
- ⚡ **Performance Optimized** - Fast loading times and smooth interactions
- 🌐 **API Integration** - RESTful API for seamless data management
- 📱 **Mobile-First** - Responsive design prioritizing mobile experience

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Heroicons](https://heroicons.com/)

### Backend Integration
- **API**: RESTful API integration
- **Base URL**: `https://appointment-manager-node.onrender.com/api/v1`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/doctor-appointment-system.git
   cd doctor-appointment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   
   The project includes a `.env.local` file with the following configuration:
   ```env
   NEXT_PUBLIC_API_URL=https://appointment-manager-node.onrender.com/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
doctor-appointment-system/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── patient/           # Patient-specific routes
│   │   │   ├── dashboard/     # Patient dashboard
│   │   │   └── appointments/  # Patient appointments
│   │   ├── doctor/            # Doctor-specific routes
│   │   │   └── dashboard/     # Doctor dashboard
│   │   ├── globals.css        # Global styles with custom design system
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx          # Home page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Basic UI components
│   │   ├── forms/            # Form components
│   │   ├── modals/           # Modal components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and configurations
│   ├── services/             # API service functions
│   ├── store/                # Zustand store definitions
│   └── types/                # TypeScript type definitions
├── public/
│   └── assets/               # Static assets
│       ├── images/           # General images
│       ├── icons/            # Icon assets
│       ├── hero/             # Hero section images
│       └── doctors/          # Doctor profile images
├── .env.local                # Environment variables
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies and scripts
```

## 🎨 Design System

The application uses a custom healthcare-focused design system built with Tailwind CSS:

### Color Palette
- **Primary**: Blue (`#2563eb`) - Trust and professionalism
- **Secondary**: Light gray (`#f1f5f9`) - Clean and minimal
- **Accent**: Green (`#10b981`) - Health and wellness
- **Destructive**: Red (`#ef4444`) - Alerts and errors

### Custom Components
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-destructive`
- **Cards**: `.card` - Consistent card styling
- **Inputs**: `.input` - Form input styling

## 📱 Responsive Design

The application follows a mobile-first approach with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Heroicons](https://heroicons.com/) for the beautiful icon set
- Healthcare professionals who inspired this project

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/YOUR_USERNAME/doctor-appointment-system/issues) page
2. Create a new issue if your question isn't already addressed
3. Reach out to the maintainers

---

**Built with ❤️ for better healthcare accessibility**
