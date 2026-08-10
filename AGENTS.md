# SchoolMate - School Management System

## Project Overview

SchoolMate is a comprehensive school management system built with React, designed to streamline school administration, communication, and financial management. The application provides a unified platform for managing students, teachers, communication, transportation, assets, and financial operations.

## Tech Stack

### Core Technologies
- **React** 18.3.1 - Frontend library
- **React Router DOM** 6.27.0 - Client-side routing
- **Redux Toolkit** 2.3.0 - State management
- **Redux Persist** 6.0.0 - State persistence

### UI Framework & Components
- **Material-UI (MUI)** 7.3.2 - Component library
  - @mui/material
  - @mui/icons-material
  - @mui/x-charts
  - @mui/x-date-pickers
- **Emotion** - CSS-in-JS styling
- **Framer Motion** 12.5.0 - Animations

### Data Visualization
- **Recharts** 2.13.0 - Chart library for dashboards
- **Chart.js** 4.4.5 - Additional charting library
- **@mui/x-charts** - MUI chart components

### Forms & Editors
- **Jodit React** 4.1.2 - Rich text editor
- **Draft.js** - Text editor framework
- **React Draft WYSIWYG** - WYSIWYG editor
- **Emoji Picker React** 4.12.0 - Emoji selection

### Utilities
- **Axios** 1.7.7 - HTTP client
- **Firebase** 11.1.0 - Backend services
- **Day.js** & **Moment.js** - Date manipulation
- **Lodash** 4.17.21 - Utility functions
- **React Hot Toast** 2.5.1 - Toast notifications
- **html2pdf.js** 0.12.1 - PDF generation
- **xlsx** 0.18.5 - Excel file handling

## Project Structure

```
schoolmate_dev/
├── src/
│   ├── Components/
│   │   ├── DashBoard/           # Dashboard layout and components
│   │   ├── CommunicationComps/  # News, Messages, Circulars, etc.
│   │   ├── StudentComps/        # Student management features
│   │   │   └── FeeFinanceComps/ # Fee & Finance module
│   │   │       ├── FeeFinancePage.jsx
│   │   │       └── FinanceDashboardComps/
│   │   │           └── FinanceDashboard.jsx
│   │   ├── TransportComps/      # Transport management
│   │   └── AssetsComps/         # Asset management
│   ├── Pages/                   # Main page components
│   ├── Redux/                   # Redux slices and store
│   │   └── Slices/
│   ├── Api/                     # API integration
│   └── Router.js                # Application routing
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

## Key Features

### 1. Communication Module
- **News Management** - Create, edit, and publish school news
- **Messaging System** - Internal messaging platform
- **Circulars** - Distribute official circulars
- **Consent Forms** - Digital consent form management with responses
- **Feedback System** - Collect and manage feedback
- **Announcements** - Important events and notifications

### 2. Academic Management
- **Time Tables** - Class and teacher timetable management
- **Homework** - Assignment creation and tracking
- **Exam Schedules** - Exam timetable management
- **Study Materials** - Resource distribution
- **Marks & Results** - Grade management and result publication
- **Attendance** - Daily attendance tracking and irregular attendee reports

### 3. Student Management
- Student profiles and records
- Grade and section organization
- Student search and filtering
- Academic performance tracking

### 4. Fee & Finance Module
- **Finance Dashboard** - Comprehensive financial overview with:
  - Revenue and expense tracking
  - Real-time statistics (Total Revenue, Collected Today, Pending Fees)
  - Interactive charts (Area charts, Pie charts, Progress bars)
  - Grade-wise fee collection monitoring
  - Recent transaction history
  - Time-based filtering (Week/Month/Year)
  - Export functionality
- **Billing Screen** - Student fee payment processing
- **Reports** - Financial reports and analytics
- **ECA Management** - Extra-curricular activity fee management
- **Additional Fee Management** - Miscellaneous fee handling
- **Concession Management** - Fee concession creation and assignment
- **Fee Structure Creation** - Multiple fee types:
  - School Fee
  - Transport Fee
  - Extra-curricular Activities Fees
  - Additional Fee

### 5. Transport Management
- Vehicle management
- Route planning and management
- Student-route mapping
- Driver and staff assignment
- Vehicle safety tracking

### 6. Asset Management
- School asset inventory
- Asset tracking and maintenance
- Resource allocation

### 7. School Calendar
- Event scheduling
- Academic calendar management
- Holiday planning

## Recent Updates

### Finance Dashboard (Latest)
A modern, professional finance dashboard has been implemented with:
- **4 KPI Cards** displaying key metrics with trend indicators
- **Revenue & Expenses Trend Chart** - Area chart showing financial trends over time
- **Fee Distribution Chart** - Pie chart breaking down fee categories
- **Grade-wise Collection Progress** - Visual progress bars for each grade
- **Recent Transactions Table** - Latest payment activities with status indicators
- **Interactive Controls** - Time range filters and export functionality
- **Responsive Design** - Mobile-friendly layout with hover effects
- **Color-coded Status** - Visual indicators for completed, pending, and failed transactions

### Transport Module Updates
- Vehicle creation and management completed
- Vehicle safety tracking implemented
- Route management system added
- Student mapping to routes and vehicles

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd schoolmate_dev
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Build for production:
```bash
npm build
```

### Environment Setup
Ensure you have the following configured:
- Firebase credentials (for backend services)
- API endpoints (in `src/Api/Api.jsx`)
- Redux store configuration

## Development Guidelines

### Code Organization
- **Components**: Reusable UI components in `src/Components/`
- **Pages**: Top-level page components in `src/Pages/`
- **Redux**: State management in `src/Redux/Slices/`
- **Routing**: All routes defined in `src/Router.js`

### State Management
- Redux Toolkit for global state
- Redux Persist for state persistence
- Separate slices for different features (sidebar, grades, website settings)

### Styling Approach
- Material-UI component library
- Emotion for CSS-in-JS
- Custom theme configuration
- Responsive design using MUI Grid system

### API Integration
- Axios for HTTP requests
- Centralized API configuration in `src/Api/Api.jsx`
- Error handling with toast notifications

### Component Patterns
- Functional components with hooks
- Custom hooks for reusable logic
- Controlled form inputs
- Lazy loading for route-based code splitting

## Developer Preferences & Coding Standards

### MUI Grid System - REQUIRED SPECIFICATIONS

**ALWAYS specify grid sizes with explicit breakpoints:**

```jsx
// ✅ CORRECT - Always use this pattern
<Grid
  size={{
    xs: 12,    // Mobile
    sm: 6,     // Small tablets
    md: 4,     // Medium screens
    lg: 3      // Large screens
  }}>
  {/* Content */}
</Grid>

// ❌ INCORRECT - Never use default or implicit sizing
<Grid item xs={12}>  // Don't use old MUI syntax
<Grid>               // Don't omit size prop
```

**Grid Container Pattern:**
```jsx
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    {/* Item 1 */}
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    {/* Item 2 */}
  </Grid>
</Grid>
```

### MUI TextField - REQUIRED SPECIFICATIONS

**ALWAYS use `slotProps` instead of the legacy `InputProps`:**

```jsx
// ✅ CORRECT - Always use slotProps (Modern MUI API)
<TextField
  slotProps={{
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <Typography>₹</Typography>
        </InputAdornment>
      ),
      endAdornment: (
        <InputAdornment position="end">
          <IconButton>
            <SearchIcon />
          </IconButton>
        </InputAdornment>
      ),
    }
  }}
/>

// ❌ INCORRECT - Don't use legacy InputProps
<TextField
  InputProps={{
    startAdornment: <InputAdornment position="start">₹</InputAdornment>
  }}
/>
```

**Common slotProps usage:**
```jsx
// For input adornments
slotProps={{
  input: {
    startAdornment: <InputAdornment position="start">Icon</InputAdornment>,
    endAdornment: <InputAdornment position="end">Icon</InputAdornment>,
  }
}}

// For input label
slotProps={{
  inputLabel: {
    shrink: true,
  }
}}

// For helper text
slotProps={{
  formHelperText: {
    sx: { color: 'error.main' }
  }
}}
```

### Color Coding Standards

**Component Colors:**
- Use distinct colors for different features/sections
- Include matching background colors and icon backgrounds
- Always provide 3 color variations:
  - Main color: `#HEX` (e.g., `#FF6B35`)
  - Background: `#HEX` (lighter shade, e.g., `#FFF5F2`)
  - Icon background: `#HEX + 1A` (with transparency, e.g., `#FF6B351A`)

**Example Color Object:**
```jsx
{
  color: "#FF6B35",           // Main color
  bgColor: "#FFF5F2",         // Light background
  iconBgColor: "#FF6B351A",   // Transparent icon bg
}
```

**Existing Color Scheme:**
- Pink/Red: `#E30053` - Used for Billing, primary actions
- Orange: `#FF6B35` - Used for Finance Dashboard
- Purple: `#8600BB` - Used for Reports
- Blue: `#3457D5` - Used for ECA Management
- Green: `#7DC353` - Used for Additional Fees, success states
- Teal: `#00ACC1` - Used for financial metrics
- Warning: `#FF9800` - Used for pending states
- Error: `#f44336` - Used for failed states

### Component Structure Standards

**Page Layout Pattern:**
```jsx
<Box sx={{
  border: '1px solid #ccc',
  borderRadius: '20px',
  p: 2,
  height: '86vh'
}}>
  {/* Header with back button */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Box sx={{ display: 'flex' }}>
      <IconButton onClick={() => navigate(-1)}>
        <ArrowBackIcon />
      </IconButton>
      <Typography>{/* Title */}</Typography>
    </Box>
    {/* Actions */}
  </Box>

  <Divider sx={{ pt: 2 }} />

  {/* Main content */}
</Box>
```

**Card-based UI Pattern:**
```jsx
<Card sx={{
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  borderRadius: '12px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  }
}}>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

### Icon Usage Standards

**Import Pattern:**
```jsx
import IconName from '@mui/icons-material/IconName';
```

**Icon Component Pattern:**
```jsx
<IconComponent sx={{
  color: item.color,
  fontSize: '23px'
}} />
```

**Common Icons:**
- `PaymentIcon` - Payment/billing features
- `DashboardIcon` - Dashboard views
- `ReceiptLongIcon` - Reports
- `SportsSoccerIcon` - ECA activities
- `AddBoxIcon` - Additional features
- `ArrowBackIcon` - Navigation back
- `ArrowForwardIcon` - Navigation forward
- `TrendingUpIcon` / `TrendingDownIcon` - Trends
- `CheckCircleIcon` - Success/completed
- `PendingActionsIcon` - Pending states

### Navigation Pattern

**Route Structure:**
```jsx
// In parent component
<Link to="dashboard" state={{ value: 'Y' }}>
  {/* Navigation content */}
</Link>

// In Router.js
<Route path="dashboard" element={<DashboardComponent />} />
```

**Navigation Hook:**
```jsx
const navigate = useNavigate();
// Navigate back
onClick={() => navigate(-1)}
// Navigate to route
onClick={() => navigate('route-path')}
```

### Button Standards

**Primary Action Button:**
```jsx
<Button sx={{
  border: '1px solid #000',
  textTransform: 'none',
  borderRadius: '50px',
  color: '#000',
  width: '100%'
}}>
  <IconComponent style={{ paddingRight: '10px', paddingLeft: '5px' }} />
  Button Text
</Button>
```

**Contained Button:**
```jsx
<Button
  variant="contained"
  startIcon={<IconComponent />}
  sx={{
    textTransform: 'none',
    bgcolor: '#1976d2',
    '&:hover': { bgcolor: '#1565c0' }
  }}>
  Button Text
</Button>
```

### Typography Standards

**Headings:**
- Page Title: `fontSize: '24px', fontWeight: '700'`
- Section Title: `fontSize: '20px', fontWeight: '600'`
- Card Title: `fontSize: '18px', fontWeight: '600'`
- Subsection: `fontSize: '14px', fontWeight: '600'`

**Body Text:**
- Regular: `fontSize: '14px'`
- Small: `fontSize: '13px'`
- Extra Small: `fontSize: '12px'`
- Tiny: `fontSize: '11px'`

### Data Visualization Standards

**Chart Library:** Recharts 2.13.0

**Common Charts:**
1. **Area Chart** - For trends over time
2. **Pie Chart** - For distribution/breakdown
3. **Bar Chart** - For comparisons
4. **Linear Progress** - For percentage completion

**Chart Dimensions:**
```jsx
<ResponsiveContainer width="100%" height={320}>
  {/* Chart component */}
</ResponsiveContainer>
```

**Color Gradients for Charts:**
```jsx
<defs>
  <linearGradient id="colorName" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#HEX" stopOpacity={0.8} />
    <stop offset="95%" stopColor="#HEX" stopOpacity={0.1} />
  </linearGradient>
</defs>
```

### Status Chip Standards

**Status Colors:**
```jsx
<Chip
  label={status}
  size="small"
  sx={{
    bgcolor:
      status === 'Completed' ? '#E8F5E9' :
      status === 'Pending' ? '#FFF3E0' :
      '#FFEBEE',
    color:
      status === 'Completed' ? '#7DC353' :
      status === 'Pending' ? '#FF9800' :
      '#f44336',
    fontWeight: '600',
    fontSize: '11px'
  }}
/>
```

### Responsive Design Requirements

**Always provide responsive breakpoints:**
- `xs` (0px+) - Mobile phones
- `sm` (600px+) - Tablets
- `md` (900px+) - Small laptops
- `lg` (1200px+) - Desktops
- `xl` (1536px+) - Large screens (optional)

**Example:**
```jsx
sx={{
  display: 'flex',
  justifyContent: {
    lg: 'end',
    xs: 'center'
  }
}}
```

### Animation & Transition Standards

**Hover Effects:**
```jsx
sx={{
  transition: '0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  }
}}
```

**Opacity Transitions:**
```jsx
sx={{
  opacity: 0,
  transition: 'opacity 0.3s ease',
  '&:hover': {
    opacity: 1
  }
}}
```

### File Naming Conventions

**Components:**
- PascalCase with descriptive names
- Example: `FinanceDashboard.jsx`, `FeeFinancePage.jsx`

**Folders:**
- PascalCase ending with "Comps"
- Example: `FinanceDashboardComps/`, `FeeFinanceComps/`

### Import Order

1. React and React-related imports
2. Material-UI components
3. Material-UI icons
4. Third-party libraries
5. Internal components
6. Redux/State management
7. Routing
8. Utilities and helpers

### Mock Data Patterns

**Always structure mock data clearly:**
```jsx
// Mock data for [purpose]
const dataName = [
  { key1: value1, key2: value2 },
  // ...
];
```

**Include comments indicating:**
- Purpose of the data
- Expected structure from API
- Any transformations needed

### Professional UI Requirements

**Dashboard Requirements:**
- KPI cards with trend indicators
- Interactive charts with tooltips
- Color-coded status indicators
- Hover effects and animations
- Export functionality
- Time range filters
- Responsive layout
- Loading states
- Error handling with toast notifications

### Code Comments

**When to comment:**
- Complex logic or algorithms
- Mock data sections
- TODO items for future implementation
- API integration points
- Workarounds or special handling

**Comment Style:**
```jsx
// Single-line comment for brief notes

/* Multi-line comment for
   detailed explanations or
   complex logic descriptions */

{/* JSX comment for UI notes */}
```

### Performance Considerations

- Use `React.memo()` for expensive components
- Implement lazy loading for routes
- Optimize re-renders with `useMemo` and `useCallback`
- Debounce search inputs
- Paginate large data sets
- Use virtual scrolling for long lists

### Testing Standards (Future)

- Unit tests for utility functions
- Integration tests for API calls
- Component tests for user interactions
- E2E tests for critical user flows
- Aim for 80%+ code coverage

---

**Remember:** These standards ensure consistency across the codebase and make collaboration easier. Always follow these patterns when creating new components or features.

## API Integration Notes

### Finance Dashboard
Currently using mock data. To integrate with backend:

1. Create API endpoints for:
   - `GET /api/finance/statistics` - Summary statistics
   - `GET /api/finance/revenue-trends` - Revenue data by time range
   - `GET /api/finance/fee-distribution` - Fee breakdown by type
   - `GET /api/finance/grade-collection` - Grade-wise collection data
   - `GET /api/finance/transactions` - Recent transaction history

2. Replace mock data with API calls:
```javascript
// Example
useEffect(() => {
  axios.get('/api/finance/statistics')
    .then(response => setStats(response.data))
    .catch(error => toast.error('Failed to load statistics'));
}, [timeRange]);
```

## Available Scripts

- `npm start` - Run development server (port 3000)
- `npm build` - Create production build
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App (one-way operation)

## Browser Support

### Production
- \>0.2% market share
- Not dead browsers
- Not Opera Mini

### Development
- Latest Chrome
- Latest Firefox
- Latest Safari

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request with detailed description

## Git Status

Current branch: `main`

### Modified Files
- `src/Api/Api.jsx`
- `src/Components/AssetsComps/TransportAssetComps/` (Route & Vehicle Management)
- `src/Components/StudentComps/FeeFinanceComps/FeeFinancePage.jsx`
- `src/Redux/Slices/sidebarSlice.js`
- `src/Router.js`

### Untracked Files
- `src/Components/AssetsComps/TransportAssetComps/StudentMappingComps/`

### Recent Commits
1. Vehicle safety creation completed
2. Vehicle creation completed
3. Initial commits

## Future Enhancements

### Planned Features
- Advanced analytics and reporting
- Mobile application (React Native)
- Parent portal integration
- SMS/Email notification system
- Biometric attendance integration
- Online fee payment gateway
- Report card generation
- Student performance analytics
- Library management system
- Canteen management

### Technical Improvements
- Unit test coverage
- E2E testing with Cypress
- Performance optimization
- PWA capabilities
- Offline mode support
- Real-time notifications with WebSockets
- API documentation with Swagger
- Code splitting optimization

## Support & Documentation

For issues, questions, or contributions:
- Review existing documentation in `/docs` (if available)
- Check component-level comments
- Contact development team

## License

Private project - All rights reserved

---

**Last Updated**: 2026-01-23
**Version**: 0.1.0
**Status**: Active Development
