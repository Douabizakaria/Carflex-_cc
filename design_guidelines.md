# Carflex Automobile Subscription Platform - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based Design drawing from premium automotive subscription services and luxury lifestyle platforms

**Key References:**
- **Airbnb** - Trust elements, booking flow clarity, premium card designs
- **Tesla** - Minimalist automotive aesthetic, bold typography, product-focused layouts
- **Porsche/BMW Digital Services** - Luxury feel, sophisticated imagery, premium materials
- **Stripe** - Clean pricing tables, professional dashboard layouts

**Core Design Principles:**
1. **Premium Sophistication** - Elevate beyond generic SaaS, match the luxury of the product
2. **Trust & Transparency** - Clear pricing, professional presentation, security indicators
3. **Aspirational Imagery** - Showcase lifestyle and freedom, not just cars
4. **Effortless Elegance** - Sophisticated but never complicated

## Typography

**Font System:**
- **Primary (Headings):** Inter or Poppins (600-700 weight) - Modern, geometric, premium feel
- **Secondary (Body):** Inter or System UI (400-500 weight) - Readable, professional
- **Accent (Pricing/Numbers):** SF Mono or JetBrains Mono - Precise, technical confidence

**Hierarchy:**
- Hero Headlines: text-5xl md:text-7xl, font-bold, tracking-tight
- Section Titles: text-3xl md:text-4xl, font-semibold
- Card Titles: text-xl md:text-2xl, font-semibold
- Body Text: text-base md:text-lg, leading-relaxed
- Small Print/Labels: text-sm, font-medium, uppercase tracking-wide
- Pricing: text-4xl md:text-6xl, font-bold, tabular-nums

## Layout System

**Spacing Primitives:** Tailwind units 4, 6, 8, 12, 16, 24, 32
- Micro spacing (component internals): 4, 6
- Component padding: 8, 12
- Section padding: 16, 24, 32
- Generous whitespace between major sections: 24, 32

**Grid System:**
- Container: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Section padding: py-16 md:py-24 lg:py-32
- Cards/Features: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8

## Component Library

### Navigation
**Desktop Header:**
- Full-width, backdrop-blur-lg with semi-transparent background
- Logo left, navigation center (Home, Packs, About, Contact)
- CTA button right (Sign In / Dashboard)
- Height: h-20, sticky top-0 with shadow on scroll

**Mobile:**
- Hamburger menu with smooth slide-in panel
- Full-screen overlay navigation

### Hero Section (HomePage)
**Layout:** Full viewport height (min-h-screen), split design
- Left 50%: Large headline, subheadline, dual CTAs (primary "View Packs" + secondary "Learn More")
- Right 50%: Large hero image of luxury car in elegant setting
- Subtle gradient overlay on image for text readability
- Trust indicators below CTAs: "No long-term commitment • Cancel anytime • 5-star rated"

### Pack Cards (PacksPage)
**3-Column Grid (Desktop), Stacked (Mobile):**
- Card design: Large image top (car representative of tier), content below
- Hover: Subtle lift (transform scale-105) with shadow increase
- Badge for "Most Popular" on Midrange pack
- Structure per card:
  - Pack name (Budget/Midrange/Luxury)
  - Car category subtitle (e.g., "Economy & Compact")
  - Price: Large monthly price, small annual price
  - Feature list: Checkmarks with concise benefits (8-10 items)
  - Prominent CTA button
- Visual differentiation: Midrange pack elevated with border accent

### Comparison Table (Below pack cards)
- Sticky header row on scroll
- 4 columns: Feature name + 3 pack columns
- Visual hierarchy: Icons for features, checkmarks/X for availability
- Premium tier highlighted with subtle background

### About Page
**Multi-Section Layout:**
1. Hero with mission statement and team image
2. Story section: 2-column (text + timeline/milestones)
3. Values grid: 3-column with icons and descriptions
4. Team section: Grid of team member cards with photos

### Contact Page
**Split Layout:**
- Left: Contact form (Name, Email, Phone, Message, Pack Interest dropdown)
- Right: Office information, map embed, alternative contact methods
- Form styling: Generous padding, clear labels, floating label style

### Authentication Pages
**Centered Card Layout:**
- max-w-md card, elevated with shadow
- Tabs for Sign In / Sign Up
- Social auth buttons top (optional)
- Email/Password fields with validation states
- "Forgot Password" link
- Trust message below form

### User Dashboard
**Sidebar + Main Content Layout:**
- Left sidebar (w-64): Navigation, user profile summary, quick actions
- Main area: 
  - Welcome header with user name
  - Grid of info cards (Active Subscription, Next Payment, Usage Stats)
  - Subscription details card: Current pack, upgrade/downgrade CTAs
  - Payment history table
  - Quick actions section

### Admin Panel
**Data Table Focus:**
- Similar sidebar navigation
- Main content: Tabs (Users, Subscriptions, Packs, Analytics)
- Tables with search, filters, pagination
- Action buttons per row
- Stats cards at top showing key metrics

### Footer
**Multi-Column Layout:**
- 4 columns: Company (About, Contact, Careers) | Packs (Links to each) | Legal (Terms, Privacy, Security) | Newsletter signup
- Social media icons
- Trust badges (Secure payments, SSL certified)
- Copyright and payment method logos

### Buttons & CTAs
**Primary CTA:**
- Large (px-8 py-4), bold text
- Rounded (rounded-lg or rounded-full for modern feel)
- When on images: backdrop-blur-md with semi-transparent background

**Secondary:**
- Outline style or ghost style
- Same sizing as primary for consistency

**Hover States:** Subtle scale (scale-105) and shadow increase

### Form Inputs
- Generous height (h-12 to h-14)
- Border on neutral state, accent on focus
- Label above or floating label animation
- Error states: Red border, error message below
- Success states: Green checkmark icon

### Cards
**General Card Pattern:**
- Border or subtle shadow (not both)
- Rounded corners (rounded-xl)
- Padding: p-6 to p-8
- Hover: Shadow elevation increase

## Images

**Hero Section (Homepage):**
- Large hero image: Luxury car in aspirational setting (modern architecture, scenic overlook, or premium garage)
- Dimensions: 1920x1080 minimum
- Placement: Right 50% of hero split layout
- Treatment: Subtle gradient overlay for text contrast

**Pack Cards:**
- Each tier needs representative car image
- Budget: Modern compact or economy car
- Midrange: Premium sedan or SUV
- Luxury: High-end sports car or luxury vehicle
- Dimensions: 800x500, consistent aspect ratio
- Placement: Top of each pack card, full width

**About Page:**
- Team/office photo: Professional setting, authentic
- Mission section: Lifestyle imagery showing car freedom/flexibility
- 2-3 supporting images throughout page

**Trust Indicators:**
- Customer testimonial photos (headshots)
- Partner logos if applicable
- Payment security badges (actual logos via CDN)

**General Image Strategy:**
- Professional automotive photography throughout
- Consistent color grading (slight cool tone for premium feel)
- High-quality, optimized for web
- Never use placeholder images in production

## Animations & Interactions

**Minimal but Purposeful:**
- Page transitions: Fade in on mount
- Scroll reveals: Subtle fade-up for sections (once only, no repeated triggers)
- Hover states: Scale transforms, shadow changes (200ms ease)
- Card interactions: Smooth elevation changes
- Navigation: Smooth scroll to sections
- **Avoid:** Complex scroll-based animations, parallax effects, continuous motion

## Accessibility

- Maintain WCAG AA contrast ratios throughout
- All interactive elements keyboard accessible
- Form inputs with proper labels and ARIA attributes
- Focus indicators visible and clear (ring-2 ring-offset-2)
- Alt text for all images
- Semantic HTML structure (header, nav, main, section, footer)

## Responsive Breakpoints

- Mobile: Base styles, single column layouts
- Tablet (md: 768px): 2-column grids, expanded navigation
- Desktop (lg: 1024px): Full multi-column layouts, expanded features
- Large (xl: 1280px): Maximum content width, optimized spacing