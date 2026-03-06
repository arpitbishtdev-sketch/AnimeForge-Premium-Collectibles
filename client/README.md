# AnimeForge Premium Collectibles — Project Context

This document provides the **complete development context** for the AnimeForge Premium Collectibles project so that any developer or AI assistant can immediately understand the architecture, purpose, and current progress of the system.

---

# 1. Project Overview

**AnimeForge Premium Collectibles** is a modern **anime figurine e-commerce storefront** designed with a **cinematic hero section** where the entire homepage theme changes based on the currently active character.

The system is designed to feel like a **high-end product showcase website**, similar to premium landing pages used by companies like Nike or Apple.

The homepage hero dynamically updates based on a **theme stored in MongoDB** and controlled through an **admin panel**.

Core concept:

```
Admin selects theme
      ↓
Theme stored in MongoDB
      ↓
Frontend fetches active theme
      ↓
Hero UI updates automatically
```

The hero includes:

- Character showcase
- Dynamic gradient background
- Infinite scrolling carousel
- Animated UI
- Character-specific theme colors
- Dynamic pricing and descriptions

---

# 2. Tech Stack

## Frontend

- React
- Vite
- Framer Motion (UI animations)
- GSAP (carousel animation + parallax)
- Custom CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

## Image Storage

- Cloudinary

## Deployment

- Render

---

# 3. Project Folder Structure

## Root

```
AnimeForge/
│
├ client/
└ server/
```

---

# 4. Frontend Architecture

Frontend lives inside:

```
client/src
```

### Structure

```
client/src
│
├ components
│   Hero.jsx
│
├ context
│   ThemeContext.jsx
│
├ admin
│   pages
│      ThemeSettings.jsx
│
├ styles
│   hero.css
│
└ App.jsx
```

---

# 5. Backend Architecture

Backend lives inside:

```
server/
```

### Structure

```
server
│
├ controllers
│   themeController.js
│
├ models
│   Theme.js
│
├ routes
│   themeRoutes.js
│   uploadRoutes.js
│
├ middleware
│   uploadMiddleware.js
│
├ config
│   cloudinary.js
│
├ app.js
└ server.js
```

---

# 6. Theme System

The **theme system controls the hero section**.

Each theme represents a **character presentation**.

Themes are stored in MongoDB and include both **content and styling**.

Example fields:

```
name
slug
status
edition
subtitle
description
price
image
carouselImages[]
accent
glow
particle
radialGradient
linearGradient
active
createdAt
```

Only **one theme can be active at a time**.

When a theme is activated, all other themes are automatically deactivated.

---

# 7. Theme API Endpoints

Themes are managed through REST endpoints.

```
GET    /api/themes
GET    /api/themes/active
POST   /api/themes
PUT    /api/themes/:id
DELETE /api/themes/:id
PATCH  /api/themes/:id/activate
```

Controller:

```
server/controllers/themeController.js
```

---

# 8. Hero System

The **Hero component is fully data-driven**.

Data flow:

```
MongoDB Theme
      ↓
GET /api/themes/active
      ↓
ThemeContext
      ↓
Hero.jsx
```

ThemeContext converts the theme into a **character object**.

Example structure:

```
{
id
name
status
edition
subtitle
description
price
mainImage
carouselImages
gradient
}
```

Hero.jsx then renders the UI using this object.

---

# 9. Hero Features

The hero section includes:

### Character Display

Large 3D-style character image with parallax.

### Dynamic Background

Radial + linear gradients based on theme colors.

### Infinite Carousel

Scrolling background layer using GSAP.

### Animated UI

Framer Motion animations for text and layout.

### Dynamic Content

Fields controlled by theme:

- name
- subtitle
- description
- price
- edition
- status badge

---

# 10. Admin Panel System

Admin panel allows management of themes.

Admin features:

- Create theme
- Edit theme
- Delete theme
- Activate theme

Admin page:

```
client/src/admin/pages/ThemeSettings.jsx
```

Admin form fields:

```
Theme name
Status badge
Edition
Subtitle
Description
Price
Accent color
Glow color
Particle color
Radial gradient
Linear gradient
Character image
Hero carousel images
```

---

# 11. Image Upload System

Images are uploaded through the admin panel.

Upload flow:

```
Admin device
      ↓
POST /api/upload
      ↓
Cloudinary
      ↓
Cloudinary URL returned
      ↓
Saved in MongoDB
```

### Character Image

Single image used in hero.

```
theme.image
```

### Carousel Images

Multiple images used for the infinite hero carousel.

```
theme.carouselImages[]
```

Upload route:

```
server/routes/uploadRoutes.js
```

Cloudinary config:

```
server/config/cloudinary.js
```

---

# 12. Current Project Progress

Major systems already implemented:

Hero UI
Dynamic theme system
Theme CRUD API
Admin theme editor
Cloudinary image upload
Infinite carousel animation
Gradient animation system

---

# 13. Features Completed

Frontend

- Hero component
- Theme switching
- Framer Motion animations
- GSAP carousel
- Responsive hero layout

Backend

- Theme model
- Theme controller
- Theme activation system
- MongoDB storage
- Cloudinary upload API

Admin Panel

- Theme creation
- Theme editing
- Theme deletion
- Theme activation
- Image uploads

---

# 14. Features Currently In Progress

Remaining store functionality:

- Product system
- Shop page
- Collections page
- Cart system
- Wishlist system
- Checkout
- User authentication
- Admin product manager

---

# 15. Known Issues

### Hero Image Missing

If Cloudinary URL is not saved correctly, hero image may not render.

Cause:

```
theme.image is empty
```

### Carousel Images Missing

Occurs when:

```
theme.carouselImages = []
```

### Preview vs Production Image

Admin preview uses local file preview while hero uses stored Cloudinary URL.

---

# 16. Critical Files

Hero component

```
client/src/components/Hero.jsx
```

Theme context

```
client/src/context/ThemeContext.jsx
```

Admin theme editor

```
client/src/admin/pages/ThemeSettings.jsx
```

Theme model

```
server/models/Theme.js
```

Theme controller

```
server/controllers/themeController.js
```

Theme routes

```
server/routes/themeRoutes.js
```

Upload system

```
server/routes/uploadRoutes.js
```

Cloudinary configuration

```
server/config/cloudinary.js
```

---

# 17. Project Vision

AnimeForge aims to become a **high-end anime collectible storefront** with:

- Cinematic hero presentation
- Character-based themes
- Smooth animations
- Premium UI
- Admin-controlled content

The design philosophy prioritizes **visual impact, motion design, and premium product presentation**.

---

End of context document.
