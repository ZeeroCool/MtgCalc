<<<<<<< HEAD
# MtgCalc
=======
# Mortgage Calculator

A comprehensive full-stack mortgage calculator application built with React frontend and Node.js backend. Calculate monthly mortgage payments, view detailed amortization schedules, and analyze loan options with an intuitive, responsive interface.

## 🚀 Features

### Frontend (React + Vite)
- **Interactive Mortgage Calculator**: Real-time calculation of monthly payments
- **Comprehensive Form**: Loan amount, interest rate, term, down payment, taxes, insurance, PMI
- **Payment Breakdown**: Detailed breakdown of principal, interest, taxes, and insurance
- **Amortization Schedule**: Complete payment schedule with principal/interest breakdown
- **Interactive Charts**: Visual representation of loan balance and payment distribution
- **Responsive Design**: Mobile-first design that works on all devices
- **Form Validation**: Real-time input validation with helpful error messages
- **Loading States**: User-friendly loading indicators during calculations

### Backend (Node.js + Express)
- **RESTful API**: Clean API endpoints for mortgage calculations
- **Advanced Calculations**: Precise mortgage algorithms with financial formulas
- **Input Validation**: Server-side validation using Joi schema validation
- **Error Handling**: Comprehensive error handling with detailed error responses
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Security**: Helmet.js, CORS, compression, and security best practices
- **Health Checks**: Built-in health check endpoints for monitoring
- **Mock Rate Data**: Current interest rates endpoint (ready for real API integration)

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Docker Setup](#docker-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Run Locally
```bash
# Clone the repository
git clone <repository-url>
cd mortgage-calculator

# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Health Check: http://localhost:8000/health

## 📦 Installation

### 1. Clone and Setup
```bash
git clone <repository-url>
cd mortgage-calculator
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm run install:frontend

# Install backend dependencies
npm run install:backend
```

### 3. Environment Configuration
```bash
# Backend environment
cp src/backend/.env.example src/backend/.env

# Frontend environment (optional)
cp frontend/.env.example frontend/.env
```

### 4. Start Development
```bash
# Start both services
npm run dev

# Or start individually
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:8000
```

## 🛠 Development

### Available Scripts

#### Root Level Scripts
```bash
npm run dev          # Start both frontend and backend in development
npm run build        # Build both applications
npm run test         # Run all tests
npm run lint         # Lint all code
npm start            # Start both applications in production mode
npm run clean        # Clean all node_modules and build files
```

#### Frontend Scripts
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # ESLint code checking
```

#### Backend Scripts
```bash
cd src/backend
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
npm test             # Run Jest tests
npm run lint         # ESLint code checking
```

### Development Workflow

1. **Frontend Development**:
   - React components in `/frontend/src/components/`
   - Styles in `/frontend/src/styles/`
   - API services in `/frontend/src/services/`

2. **Backend Development**:
   - API routes in `/src/backend/routes/`
   - Business logic in `/src/backend/services/`
   - Middleware in `/src/backend/middleware/`

3. **Hot Reloading**:
   - Frontend: Vite provides instant hot reload
   - Backend: Nodemon restarts server on changes

## 📚 API Documentation

### Base URL
- Development: `http://localhost:8000/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### POST /api/calculate
Calculate mortgage payment and basic loan information.

**Request Body:**
```json
{
  "loanAmount": 300000,
  "interestRate": 6.5,
  "loanTerm": 30,
  "downPayment": 60000,
  "propertyTax": 3000,
  "insurance": 1200,
  "pmi": 0
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "principalAndInterest": 1515.92,
    "monthlyPropertyTax": 250.00,
    "monthlyInsurance": 100.00,
    "monthlyPMI": 0.00,
    "totalMonthlyPayment": 1865.92,
    "loanAmount": 240000,
    "totalInterest": 305731.07,
    "totalPayments": 545731.07,
    "payoffDate": "October 2054"
  },
  "amortization": [...],
  "metadata": {
    "calculatedAt": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

#### POST /api/amortization
Get detailed amortization schedule.

#### GET /api/rates
Get current interest rates (mock data).

#### POST /api/validate
Validate loan parameters without calculation.

#### GET /health
Health check endpoint.

### Error Responses
```json
{
  "error": "Validation Error",
  "message": "Invalid input parameters",
  "details": [
    {
      "field": "loanAmount",
      "message": "Loan amount is required"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/calculate"
}
```

## 📁 Project Structure

```
mortgage-calculator/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── MortgageCalculator.jsx
│   │   │   ├── MortgageForm.jsx
│   │   │   ├── PaymentResults.jsx
│   │   │   ├── AmortizationTable.jsx
│   │   │   ├── PaymentChart.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── services/        # API service functions
│   │   │   └── mortgageApi.js
│   │   ├── styles/         # CSS styles
│   │   │   ├── App.css
│   │   │   ├── MortgageForm.css
│   │   │   ├── PaymentResults.css
│   │   │   └── AmortizationTable.css
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── public/             # Static assets
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   ├── package.json        # Frontend dependencies
│   └── Dockerfile          # Frontend Docker configuration
├── src/backend/             # Node.js backend application
│   ├── routes/             # API route handlers
│   │   ├── mortgage.js     # Mortgage calculation endpoints
│   │   └── rates.js        # Interest rates endpoints
│   ├── services/           # Business logic
│   │   └── MortgageCalculator.js
│   ├── middleware/         # Express middleware
│   │   ├── errorHandler.js # Global error handling
│   │   └── auth.js         # Authentication middleware
│   ├── tests/             # Backend tests
│   ├── server.js          # Express server setup
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables template
│   └── Dockerfile         # Backend Docker configuration
├── docs/                  # Additional documentation
├── docker-compose.yml     # Multi-service Docker setup
├── package.json          # Root package.json (workspace)
└── README.md             # This file
```

## 🐳 Docker Setup

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Individual Service Docker Commands
```bash
# Backend only
cd src/backend
docker build -t mortgage-backend .
docker run -p 8000:8000 mortgage-backend

# Frontend only
cd frontend
docker build -t mortgage-frontend .
docker run -p 3000:80 mortgage-frontend
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report
```

### Backend Testing
```bash
cd src/backend
npm test                   # Run Jest tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run with coverage report
```

### Integration Testing
```bash
npm run test              # Run all tests (frontend + backend)
```

### Manual Testing
1. Start the development environment: `npm run dev`
2. Test the mortgage calculator with various inputs
3. Verify API responses using the health check: `http://localhost:8000/health`
4. Test responsiveness on different screen sizes

## 🚀 Deployment

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-frontend-domain.com
API_KEYS=your-api-key-here
SESSION_SECRET=your-session-secret
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Production Build
```bash
# Build both applications
npm run build

# Test production build locally
npm start
```

### Deployment Options

#### Option 1: Vercel (Frontend) + Railway (Backend)
1. **Frontend (Vercel)**:
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Backend (Railway)**:
   ```bash
   cd src/backend
   # Connect to Railway and deploy
   ```

#### Option 2: Docker Deployment
```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 3: Traditional VPS
```bash
# Build applications
npm run build

# Copy files to server
# Configure nginx proxy
# Set up PM2 or similar process manager
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- **Frontend**: ESLint + React best practices
- **Backend**: ESLint + Node.js best practices
- **Commits**: Use conventional commit messages
- **Testing**: Maintain test coverage above 80%

### Pull Request Guidelines
- Include tests for new features
- Update documentation as needed
- Ensure all checks pass
- Add screenshots for UI changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠 Built With

- **Frontend**: React 18, Vite, Chart.js, React Hook Form, Axios
- **Backend**: Node.js, Express, Joi, Helmet, Morgan
- **Development**: ESLint, Jest, Nodemon, Concurrently
- **Deployment**: Docker, Docker Compose

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/mortgage-calculator/issues)
- **Documentation**: [Project Wiki](https://github.com/your-username/mortgage-calculator/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/mortgage-calculator/discussions)

## 🎯 Roadmap

- [ ] User authentication and saved calculations
- [ ] Real-time interest rate integration
- [ ] Advanced loan comparison tools
- [ ] Refinancing calculator
- [ ] Mobile app (React Native)
- [ ] Loan officer dashboard
- [ ] PDF report generation
- [ ] Email sharing capabilities

---

**Note**: This project is for educational and demonstration purposes. Always consult with qualified financial professionals for actual mortgage decisions.
>>>>>>> 1a4d76a (Initial project commit)
