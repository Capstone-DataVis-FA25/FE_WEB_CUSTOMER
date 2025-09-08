import { Users, Trophy, Syringe, Beer, CloudRain, Bird, Wine } from 'lucide-react';

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  icon: typeof Users;
  source: string;
  sourceUrl: string;
  data?: string[][];
  fetchUrl?: string;
}

export const sampleDatasets: SampleDataset[] = [
  {
    id: 'lol_worlds_2021_playin',
    name: 'LoL Worlds 2021 Play-in',
    description: 'Performance stats for Worlds 2021 Play-in matches (for charts/EDA).',
    icon: Trophy,
    source: 'OpenDataBay',
    sourceUrl: 'https://www.opendatabay.com/data/dataset/654992ed-fdc5-44e6-a63e-eb81257a77ea',
    fetchUrl: '/samples/lol_worlds_2021_playin.csv',
  },
  {
    id: 'owid_vaccinations',
    name: 'COVID Vaccinations (OWID)',
    description: 'Global vaccinations over time by location for time-series charts.',
    icon: Syringe,
    source: 'Our World in Data',
    sourceUrl: 'https://ourworldindata.org/covid-vaccinations',
    fetchUrl: '/samples/owid_vaccinations.csv',
  },
  {
    id: 'fte_drinks',
    name: 'Alcohol Consumption by Country',
    description: 'Per-capita alcohol consumption (beer, wine, spirits) by country.',
    icon: Beer,
    source: 'FiveThirtyEight',
    sourceUrl: 'https://github.com/fivethirtyeight/data/tree/master/alcohol-consumption',
    fetchUrl: '/samples/fte_drinks.csv',
  },
  {
    id: 'seattle_weather',
    name: 'Seattle Weather',
    description: 'Daily precipitation, temp, and weather for Seattle (for line/bar charts).',
    icon: CloudRain,
    source: 'Vega Datasets',
    sourceUrl: 'https://github.com/vega/vega-datasets',
    fetchUrl: '/samples/seattle-weather.csv',
  },
  {
    id: 'palmer_penguins',
    name: 'Palmer Penguins',
    description: 'Body measurements and species for penguins (for scatter/EDA).',
    icon: Bird,
    source: 'Palmer Penguins',
    sourceUrl: 'https://allisonhorst.github.io/palmerpenguins/',
    fetchUrl: '/samples/palmer_penguins.csv',
  },
  {
    id: 'winequality_red',
    name: 'Wine Quality (Red)',
    description: 'Physicochemical properties and quality scores for red wines.',
    icon: Wine,
    source: 'UCI ML Repository',
    sourceUrl: 'https://archive.ics.uci.edu/dataset/186/wine+quality',
    fetchUrl: '/samples/winequality-red.csv',
  },
];
