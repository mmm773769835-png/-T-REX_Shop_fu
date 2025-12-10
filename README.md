# T-REX Shop - Amazon/Alibaba-like E-commerce App

A comprehensive e-commerce mobile application built with React Native and Expo, designed to resemble popular platforms like Amazon and Alibaba.

## Project Structure

```
src/
├── navigation/
│   └── Navigator.js          # Main navigation setup
├── screens/
│   ├── HomeV2.tsx            # Main home screen with product listings
│   ├── ProductDetails.tsx    # Product detail view
│   ├── CartScreen.tsx        # Shopping cart management
│   ├── OrderConfirm.tsx      # Order confirmation and checkout
│   ├── LoginScreen.tsx       # User authentication
│   ├── ProfileScreen.tsx     # User profile management
│   ├── AddProduct.tsx        # Admin product creation
│   └── components/
│       └── SidebarV2.tsx     # Navigation sidebar
├── shared/
│   ├── components/
│   │   ├── Button.tsx        # Custom button component
│   │   ├── Input.tsx         # Custom input component
│   │   └── Header.tsx        # Custom header component
│   ├── constants/
│   │   ├── colors.ts         # Color palette
│   │   └── categories.ts     # Product categories
│   └── models/
│       └── Product.ts        # Data models
├── features/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── profile/
│   ├── search/
│   └── categories/
└── assets/
    └── images/
```

## Key Features

### 1. User Authentication
- Login/Logout functionality
- User profile management

### 2. Product Management
- Browse products by categories
- Search functionality
- Product details view with images and descriptions
- Add to cart functionality

### 3. Shopping Cart
- Add/remove products
- Adjust quantities
- View order summary

### 4. Checkout Process
- Shipping information
- Payment method selection
- Order confirmation

### 5. Admin Features
- Add new products
- Manage inventory

## Technologies Used

- **React Native** - Mobile application framework
- **Expo** - Development platform
- **Firebase** - Backend services (Firestore, Storage)
- **React Navigation** - Navigation library
- **TypeScript** - Type safety

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on Android:
   ```bash
   npm run android
   ```

4. Run on iOS:
   ```bash
   npm run ios
   ```

## Screens

1. **Home Screen** - Product listings with category filtering
2. **Product Details** - Detailed view of individual products
3. **Cart Screen** - Shopping cart management
4. **Checkout** - Order confirmation and payment
5. **Profile** - User account management
6. **Login** - User authentication

## Custom Components

- **Button** - Reusable button with multiple variants
- **Input** - Form input fields
- **Header** - Navigation header with back button

## Constants

- **Colors** - Consistent color palette
- **Categories** - Product category definitions

## Data Models

- **Product** - Product information structure
- **User** - User profile data
- **Order** - Order information

## Firebase Integration

The app uses Firebase for:
- Firestore database for product and order storage
- Firebase Storage for image uploads
- Authentication (planned)

## Development Notes

- All screens are properly connected with navigation
- Duplicate key errors have been resolved
- ImagePicker deprecation warnings have been addressed
- UI has been optimized for better spacing and positioning
- Components are organized in a scalable structure

## Future Enhancements

- Implement full user authentication
- Add order history tracking
- Integrate payment gateways
- Add wishlist functionality
- Implement push notifications
- Add product reviews and ratings