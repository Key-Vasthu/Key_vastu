# KeyVasthu 🕉️

A modern, responsive web platform for Vasthu Shastra and Astrology consultation services, integrated with civil engineering expertise.

![KeyVasthu](https://img.shields.io/badge/KeyVasthu-Vasthu%20%26%20Astrology-saffron)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-teal)

## ✨ Features

### 🏠 Core Pages
- **Home** - Hero branding, key features, book showcase, testimonials
- **Login/Register** - Secure authentication with email verification (stubbed)
- **User Dashboard** - Profile management, active chats, file uploads, notifications
- **Admin Dashboard** - User CRUD, file reviews, order management, analytics
- **Chat Interface** - Real-time messaging, file uploads, drawing board integration
- **Drawing Board** - Full canvas with shape tools, colors, export/share functionality
- **Book Store** - Grid/list views, filtering, search, cart, checkout flow
- **About** - Consultant biography, expertise, timeline, project gallery

### 🎨 Design System
- Traditional Indian aesthetics with warm earth tones
- Saffron, deep blue (astral), and gold color palette
- Mandala patterns and astrological motifs
- Custom typography with Cinzel, Cormorant Garamond, and Nunito Sans
- Responsive design for desktop, tablet, and mobile

### ⚡ Technical Features
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Lucide Icons** for consistent iconography
- Lazy loading for optimized performance
- Context API for state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/keyvasthu.git

# Navigate to project directory
cd keyvasthu

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/
│   └── common/          # Reusable UI components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       ├── Loading.tsx
│       └── NotificationToast.tsx
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── NotificationContext.tsx
├── pages/               # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── Chat.tsx
│   ├── DrawingBoard.tsx
│   ├── BookStore.tsx
│   ├── BookDetail.tsx
│   ├── Cart.tsx
│   └── About.tsx
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── api.ts           # API stubs
│   ├── validation.ts    # Form validation
│   └── helpers.ts       # Helper functions
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🎯 Demo Credentials

The application runs in demo mode with simulated API responses:

- **Regular User**: Any email (e.g., `user@example.com`)
- **Admin User**: Any email containing "admin" (e.g., `admin@keyvasthu.com`)
- **Guest Mode**: Click "Continue as Guest" for limited access

## 🔧 API Integration

All API calls are currently stubbed in `src/utils/api.ts`. To integrate with a real backend:

1. Replace stub functions with actual API calls
2. Update response types as needed
3. Add authentication token handling
4. Configure environment variables for API endpoints

### Sample Coupon Codes (Demo)
- `VASTHU10` - 10% off
- `FIRST50` - ₹50 off

## 🎨 Customization

### Theme Colors
Colors are defined in `tailwind.config.js`:
- **Saffron** - Primary accent (#f97316)
- **Astral** - Secondary/Dark blue (#1e3a5f)
- **Gold** - Highlights (#d4a418)
- **Earth** - Neutrals
- **Cream** - Backgrounds

### Typography
- **Display**: Cinzel (headings)
- **Body**: Nunito Sans (body text)
- **Accent**: Cormorant Garamond (quotes, special text)

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## ♿ Accessibility

- WCAG AA compliant color contrast
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Alt text for images

## 🔒 Security Notes

- Form validation on client-side
- Password requirements enforced
- Protected routes with authentication checks
- Ready for backend integration with proper auth

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- Design inspired by traditional Indian Vasthu and architectural principles
- Icons from [Lucide Icons](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

Made with ❤️ for the KeyVasthu project

