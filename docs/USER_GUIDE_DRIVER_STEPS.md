# DataVis Web User Guide (Consolidated from Driver Steps)

This guide consolidates all onboarding/tour steps used across the DataVis web app. It is organized by page/feature and preserves element selectors and popover content for model training.

Note: Icon placeholders are preserved as text labels (e.g., Icons.Rocket) for clarity.

---

## Home Page Tour (`home-steps`)

1. Welcome

- Title: Icons.Rocket Welcome to DataVis
- Description: Create beautiful, responsive charts with no coding required. Let's explore what makes DataVis special.
- Align: center

1. Hero CTA: Build Chart

- Element: #hero-cta-build-chart
- Title: Icons.BarChart3 Build Your First Chart
- Description: Start here! Create custom charts from your data with our intuitive editor.
- Side: bottom
- Align: start

1. Chart Types Section

- Element: #chart-types-section
- Title: Icons.LayoutDashboard Explore Templates
- Description: Discover our collection of professional chart templates. Click to preview and learn more.
- Side: top
- Align: center

1. Features Section

- Element: #features-section
- Title: Icons.Sparkles Powerful Features
- Description: Everything you need: customization, collaboration, and export options in one platform.
- Side: top
- Align: center

---

## Dataset Page Tours (`dataset-steps`)

### A) Dataset List

1. Welcome

- Title: Icons.Database Welcome to Datasets
- Description: Manage your data efficiently. This is your central hub for all your datasets.
- Align: center

1. New Dataset Button

- Element: #btn-new-dataset
- Title: Icons.Upload Create New Dataset
- Description: Upload files, paste data, or use AI to clean messy data. Get started here.
- Side: bottom
- Align: end

1. Search Dataset

- Element: #search-dataset
- Title: Icons.Sparkles Find & Organize
- Description: Quickly search and sort your datasets to find exactly what you need.
- Side: bottom
- Align: start

1. Dataset Card Actions

- Element: #dataset-card-0
- Title: Icons.LayoutDashboard Dataset Actions
- Description: View details, edit, or create charts directly from your dataset card.
- Side: right
- Align: center

### B) Create Dataset

1. Import Your Data

- Title: Icons.Upload Import Your Data
- Description: Choose how you want to bring your data in. We support multiple formats and methods.
- Align: center

1. Upload Method Navigation

- Element: #upload-method-nav
- Title: Icons.Settings Choose Method
- Description: Upload files, paste text, use sample data, or let AI clean your data for you.
- Side: right
- Align: start

1. AI Data Cleaning

- Element: #nav-btn-cleanDataset
- Title: Icons.Wand2 AI Data Cleaning
- Description: Got messy data? Let our AI assistant clean and format it automatically.
- Side: right
- Align: center

---

## Charts Page Tour (`chart-steps`)

1. Welcome

- Title: Icons.BarChart3 Welcome to Charts
- Description: Manage and visualize your data. This is your personal dashboard for all your charts.
- Align: center

1. New Chart Button

- Element: #btn-new-chart
- Title: Icons.Rocket Create New Chart
- Description: Start visualizing! Create a new chart from your datasets with just one click.
- Side: bottom
- Align: end

1. Search & Filter

- Element: #search-chart
- Title: Icons.Sparkles Find & Filter
- Description: Use search and filters to quickly locate specific charts by name, type, or date.
- Side: bottom
- Align: start

1. Chart Card Actions

- Element: #chart-card-0
- Title: Icons.LayoutDashboard Chart Actions
- Description: View, edit, duplicate, or delete your charts directly from the card menu.
- Side: right
- Align: center

---

## Chart Gallery Tour (`chart-gallery-steps`)

1. Gallery Intro

- Title: Icons.Palette Chart Gallery
- Description: Choose from dozens of beautiful chart templates. Find the perfect one for your data.
- Align: center

1. Select Dataset

- Element: #dataset-section
- Title: Icons.Database Select Dataset
- Description: Choose a dataset to work with, or skip to use sample data.
- Side: right
- Align: start

1. Filter Options

- Element: #category-filter
- Title: Icons.Sliders Filter Options
- Description: Narrow down your choices by category, type, or purpose to find exactly what you need.
- Side: right
- Align: center

1. Template Grid

- Element: #templates-grid
- Title: Icons.LayoutDashboard Template Gallery
- Description: Browse our collection. Click any template to preview and start creating.
- Side: left
- Align: start

---

## Chart Editor Tour (`chart-editor-steps`)

1. Welcome

- Title: Icons.Rocket Welcome to Chart Editor
- Description: Create stunning visualizations with our powerful editor. Let's take a quick tour of the main features to get you started.
- Align: center

1. Chart Type Selector

- Element: #chart-type-selector
- Title: Icons.BarChart3 Choose Your Chart
- Description: Start by selecting the perfect chart type for your data. From simple lines to complex heatmaps, we have it all.
- Side: right
- Align: start

1. Series Management

- Element: #series-management-section
- Title: Icons.Database Manage Data Series
- Description: Add, remove, and customize your data series here. Control exactly what data appears on your chart.
- Side: right
- Align: start

1. Chart Settings

- Element: #chart-settings-section
- Title: Icons.Settings Customize Appearance
- Description: Fine-tune every detail. Adjust colors, axes, legends, and animations to match your style perfectly.
- Side: right
- Align: start

1. Save & Share

- Element: #save-chart-button
- Title: Icons.Save Save & Share
- Description: Ready to go? Save your masterpiece to your workspace or export it to share with your team.
- Side: bottom
- Align: end

---

## Pricing Page Tour (`pricing-steps`)

1. Pricing Plans

- Title: Icons.CreditCard Pricing Plans
- Description: Choose the perfect plan for your needs. Upgrade anytime as you grow.
- Align: center

1. Plans Grid

- Element: #pricing-plans-grid
- Title: Icons.LayoutDashboard Compare Options
- Description: Browse our tiers. From free starter plans to enterprise solutions, we have you covered.
- Side: top
- Align: center

1. Features List

- Element: .pricing-plan-features:first-child
- Title: Icons.Sparkles What's Included
- Description: Check the features list to see exactly what you get with each plan.
- Side: left
- Align: start

1. Subscribe Button

- Element: .pricing-subscribe-button:first-child
- Title: Icons.Rocket Get Started
- Description: Ready to upgrade? Click to subscribe and unlock premium features instantly.
- Side: top
- Align: center

---

## Element Selector Reference

- Home:
  - #hero-cta-build-chart → src/pages/home/HomePage.tsx:410
  - #chart-types-section → src/pages/home/HomePage.tsx:449
  - #features-section → src/pages/home/HomePage.tsx:575
- Datasets:
  - #btn-new-dataset → src/pages/dataset/DatasetListPage.tsx:310
  - #search-dataset → src/pages/dataset/DatasetListPage.tsx:337 (also src/pages/chart/DatasetListPage.tsx:309)
  - #dataset-card-0 → Not found in codebase (likely dynamic; generated per card)
  - #upload-method-nav → src/components/dataset/UploadMethodNavigation.tsx:44
  - #nav-btn-cleanDataset → Not found in codebase (check Create Dataset UI for actual button id/class)
- Charts:
  - #btn-new-chart → Not found in codebase (check ChartListPage for new chart trigger)
  - #search-chart → src/pages/chart/ChartListPage.tsx:434
  - #chart-card-0 → Not found in codebase (likely dynamic; generated per card)
- Gallery:
  - #dataset-section → src/pages/chart-gallery/ChooseTemplateTab.tsx:336
  - #category-filter → src/pages/chart-gallery/ChooseTemplateTab.tsx:407
  - #templates-grid → src/pages/chart-gallery/ChooseTemplateTab.tsx:673
- Editor:
  - #chart-type-selector → src/components/charts/UnifiedChartEditor.tsx:59
  - #series-management-section → src/components/charts/UnifiedChartEditor.tsx:87
  - #chart-settings-section → src/components/charts/UnifiedChartEditor.tsx:77
  - #save-chart-button → Not found in codebase (check editor actions/footer for save button)
- Pricing:
  - #pricing-plans-grid → src/pages/subscription/PricingPage.tsx:149
  - .pricing-plan-features:first-child → Not found in codebase (likely class not present or generated)
  - .pricing-subscribe-button:first-child → Not found in codebase (likely class not present or generated)

---

## Visible Text Labels for Selectors

- Home
  - #hero-cta-build-chart: Button text "Build Your Own Chart"
  - #chart-types-section: Heading t('home_chartTypes_title'), description t('home_chartTypes_desc')
  - #features-section: Section content with feature highlights (dynamic)
- Datasets
  - #btn-new-dataset: Button text "New Dataset"
  - #search-dataset: Input placeholder "Search datasets by name or description..."
  - #dataset-card-0: First dataset card (dynamic title/description)
  - #upload-method-nav → Panel title "Upload Method"; items:
    - #nav-btn-upload: "Upload your data"
    - #nav-btn-textUpload: "Paste your data"
    - #nav-btn-sampleData: "Try sample data"
    - #nav-btn-cleanDataset: "Clean with AI"
- Charts
  - #btn-new-chart: New chart trigger (label not found; likely "New Chart" or similar)
  - #search-chart: Input placeholder "Search charts by name or description..."
  - #chart-card-0: First chart card (dynamic title/type/date)
- Gallery
  - #dataset-section: Label "Dataset" with button text "Select"/"Change" and dataset name
  - #category-filter: Label t('chart_gallery_category'); select placeholder t('chart_gallery_select_category')
  - #templates-grid: Grid of template cards with names, type, category; action button "Continue"
- Editor
  - #chart-type-selector: Chart type picker component (no direct text)
  - #series-management-section: Series management section (component labels inside)
  - #chart-settings-section: Basic chart settings section
  - #save-chart-button: Save action (label not found; likely "Save" or "Save Chart")
- Pricing
  - #pricing-plans-grid: Cards showing plan.name, plan.description, price and feature list
  - .pricing-plan-features: List items are features from plan.features
  - .pricing-subscribe-button: Subscribe CTA on each plan (label not found; likely "Subscribe" or "Get Started")

---

## Notes for Training

- Each selector above includes its current file and line for easier DOM anchoring in training data.
- "Not found" entries indicate selectors/classes not present in the repository snapshot; they may be dynamic or outdated. Verify and update the selector to the actual element.
- Lines may shift; re-run a grep before training to refresh positions.
