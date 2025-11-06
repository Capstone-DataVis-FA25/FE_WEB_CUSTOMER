import { ChartType } from '@/features/charts';

// Helper: month labels starting from Jan 2022
const monthLabel = (offset: number) => {
  const start = new Date(2022, 0, 1);
  const d = new Date(start.getFullYear(), start.getMonth() + offset, 1);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}`;
};

// Generate a CSV string with 30-40 rows appropriate for each chart type
// Each dataset has a coherent story and >5 columns
export function getSampleCSVForChartType(type: ChartType, rows: number = 36): string {
  const n = Math.max(30, Math.min(rows, 40));

  switch (type) {
    case ChartType.Line:
    case ChartType.Area: {
      // Story: Monthly sales by region (36 months)
      // Columns: Month, North, South, East, West, Central, Total
      const header = 'Month,North,South,East,West,Central,Total';
      const body: string[] = [];
      for (let i = 0; i < n; i++) {
        const season = 1 + 0.15 * Math.sin((2 * Math.PI * i) / 12);
        const north = Math.round(120 + 20 * season + Math.random() * 10);
        const south = Math.round(100 + 15 * season + Math.random() * 10);
        const east = Math.round(110 + 18 * season + Math.random() * 10);
        const west = Math.round(95 + 12 * season + Math.random() * 10);
        const central = Math.round(105 + 16 * season + Math.random() * 10);
        const total = north + south + east + west + central;
        body.push(`${monthLabel(i)},${north},${south},${east},${west},${central},${total}`);
      }
      return [header, ...body].join('\n');
    }

    case ChartType.Bar: {
      // Story: Product channel performance (SKU-level)
      // Columns: SKU, Region, Online, Retail, Wholesale, Returns, Net
      const header = 'SKU,Region,Online,Retail,Wholesale,Returns,Net';
      const regions = ['North', 'South', 'East', 'West', 'Central'];
      const body: string[] = [];
      for (let i = 1; i <= n; i++) {
        const sku = `SKU-${String(1000 + i)}`;
        const region = regions[i % regions.length];
        const online = Math.round(60 + Math.random() * 80);
        const retail = Math.round(40 + Math.random() * 70);
        const wholesale = Math.round(30 + Math.random() * 60);
        const returns = Math.round((online + retail + wholesale) * (0.03 + Math.random() * 0.05));
        const net = online + retail + wholesale - returns;
        body.push(`${sku},${region},${online},${retail},${wholesale},${returns},${net}`);
      }
      return [header, ...body].join('\n');
    }

    case ChartType.Scatter: {
      // Story: Housing listings features vs price
      // Columns: ListingId,City,SqFt,Bedrooms,Bathrooms,YearBuilt,Price
      const header = 'ListingId,City,SqFt,Bedrooms,Bathrooms,YearBuilt,Price';
      const cities = ['Seattle', 'Austin', 'Denver', 'Phoenix', 'Atlanta', 'Boston'];
      const body: string[] = [];
      for (let i = 1; i <= n; i++) {
        const id = 5000 + i;
        const city = cities[i % cities.length];
        const sqft = Math.round(900 + Math.random() * 2200);
        const beds = Math.max(1, Math.min(6, Math.round(1 + sqft / 600 + (Math.random() * 2 - 1))));
        const baths = Math.max(1, Math.min(4, Math.round(beds - 0.5 + Math.random())));
        const year = Math.round(1975 + Math.random() * 45);
        // Price correlates with sqft and city baseline
        const cityFactor =
          1 +
          (['Seattle', 'Boston'].includes(city)
            ? 0.25
            : ['Austin', 'Denver'].includes(city)
              ? 0.15
              : 0.05);
        const price = Math.round(
          (180 * sqft + baths * 15000 + beds * 20000) * cityFactor * (0.9 + Math.random() * 0.2)
        );
        body.push(`${id},${city},${sqft},${beds},${baths},${year},${price}`);
      }
      return [header, ...body].join('\n');
    }

    case ChartType.Pie:
    case ChartType.Donut: {
      // Story: Marketing mix by channel with extra metrics
      // Columns: Channel,Spend,Impressions,Clicks,Conversions,CPA,ROI
      // Generate ~30 rows (lots of channels/segments)
      const k = n; // 30-40
      const header = 'Channel,Spend,Impressions,Clicks,Conversions,CPA,ROI';
      const base = [
        'Search',
        'Display',
        'Social - FB',
        'Social - IG',
        'Social - TikTok',
        'Video - YT',
        'Affiliate',
        'Email',
        'Influencer',
        'Podcast',
      ];
      const body: string[] = [];
      for (let i = 0; i < k; i++) {
        const name = `${base[i % base.length]} ${Math.floor(i / base.length) + 1}`;
        const spend = Math.round(2000 + Math.random() * 15000);
        const impressions = Math.round(spend * (50 + Math.random() * 120));
        const clicks = Math.round(impressions * (0.005 + Math.random() * 0.015));
        const conversions = Math.max(0, Math.round(clicks * (0.02 + Math.random() * 0.06)));
        const cpa = conversions > 0 ? Math.round(spend / Math.max(1, conversions)) : spend;
        const roi = conversions > 0 ? +(Math.random() * 3 + 0.5).toFixed(2) : 0;
        body.push(`${name},${spend},${impressions},${clicks},${conversions},${cpa},${roi}`);
      }
      return [header, ...body].join('\n');
    }

    default: {
      // Fallback: Inventory snapshot with >5 cols
      // Columns: Item, Category, InStock, Reserved, OnOrder, Backorder, Available
      const header = 'Item,Category,InStock,Reserved,OnOrder,Backorder,Available';
      const cats = ['A', 'B', 'C', 'D', 'E'];
      const body: string[] = [];
      for (let i = 1; i <= n; i++) {
        const item = `Item ${i}`;
        const cat = cats[i % cats.length];
        const inStock = Math.round(50 + Math.random() * 300);
        const reserved = Math.round(inStock * (0.05 + Math.random() * 0.2));
        const onOrder = Math.round(20 + Math.random() * 80);
        const backorder = Math.round(Math.max(0, (reserved - inStock * 0.8) * Math.random()));
        const available = inStock + onOrder - reserved - backorder;
        body.push(`${item},${cat},${inStock},${reserved},${onOrder},${backorder},${available}`);
      }
      return [header, ...body].join('\n');
    }
  }
}
