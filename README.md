# Invoice Form Application

A React application that provides a login system and a functional invoice form with PDF upload capabilities. The application uses Formik for form handling and local storage for data persistence.

## Features

- Login system with session management
- Protected routes
- Invoice form with validation
- PDF upload and preview
- Data persistence using local storage
- Responsive design using Material-UI
- Form validation using Formik and Yup

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd invoiceform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Usage

1. Login:
   - Use any username and password for demo purposes
   - The session will be stored in local storage

2. Invoice Form:
   - Fill in the invoice details
   - Upload a PDF file
   - Click "Save Invoice" to store the data
   - The form data and PDF will persist across page reloads

3. Logout:
   - Click the "Logout" button to clear the session
   - You will be redirected to the login page

## Technology Stack

- React
- TypeScript
- Material-UI
- Formik
- Yup
- react-pdf
- react-router-dom

## Project Structure

```
src/
  ├── components/
  │   ├── auth/
  │   │   ├── Login.tsx
  │   │   └── ProtectedRoute.tsx
  │   └── form/
  │       └── InvoiceForm.tsx
  ├── context/
  │   └── AuthContext.tsx
  ├── App.tsx
  └── index.tsx
```

## Development

To start development:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Testing

Run the test suite:
```bash
npm test
```

## License

This project is licensed under the MIT License.
