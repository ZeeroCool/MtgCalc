# Mortgage Calculator Frontend

A modern, responsive React frontend for the mortgage calculator application built with Vite.

## Features

- **Responsive Design**: Mobile-first approach with clean, modern UI
- **Input Validation**: Real-time form validation with error messages
- **Mortgage Calculation**: Calculate monthly payments and total costs
- **Amortization Schedule**: View detailed payment breakdown by month or year
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during API calls
- **Accessibility**: Built with accessibility best practices

## Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **React Hook Form**: Form validation and management
- **Axios**: HTTP client for API communication
- **CSS3**: Custom responsive CSS with modern features

## Getting Started

### Prerequisites

- Node.js 16+ and npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend expects the backend API to be running on `http://localhost:8000` with the following endpoints:

- `POST /api/mortgage/calculate` - Calculate mortgage payments
- `POST /api/mortgage/amortization` - Get amortization schedule
- `POST /api/mortgage/validate` - Validate input parameters

## Component Structure

```
src/
├── components/
│   ├── AmortizationTable.jsx    # Amortization schedule display
│   ├── ErrorAlert.jsx           # Error message component
│   ├── ErrorBoundary.jsx        # React error boundary
│   ├── MortgageForm.jsx         # Input form with validation
│   └── MortgageSummary.jsx      # Results summary display
├── hooks/
│   └── useMortgage.js           # Custom hook for mortgage calculations
├── services/
│   └── api.js                   # API client configuration
├── styles/
│   └── index.css                # Global styles
├── App.jsx                      # Main application component
└── main.jsx                     # Application entry point
```

## Features

### Responsive Design
- Mobile-first CSS approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

### Form Validation
- Real-time input validation
- Clear error messages
- Proper input formatting
- Accessibility support

### Data Visualization
- Monthly payment breakdown
- Total cost analysis
- Interactive amortization table
- Yearly vs monthly view options

### Error Handling
- Network error handling
- Input validation errors
- Loading state management
- Error boundary for crashes

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Development

### Code Style
- Modern ES6+ JavaScript
- Functional components with hooks
- Custom hooks for business logic
- Clean, readable component structure

### Performance
- Lazy loading where appropriate
- Efficient re-renders
- Optimized bundle size
- Fast development server

## Deployment

Build the production version:

```bash
npm run build
```

The `dist` folder contains the built application ready for deployment to any static hosting service.

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure responsive design principles