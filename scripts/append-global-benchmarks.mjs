import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.resolve(__dirname, '..', 'eval-data', 'gold_rush_queensland_mines.jsonl');

const existing = fs.readFileSync(p, 'utf8').trim().split('\n');
console.log('Existing lines:', existing.length);

const globalEntries = [
  {
    prompt: "Investigate historical gold mining in Western Australia at the Kalgoorlie Super Pit (Fimiston Open Pit): Who discovered and consolidated the Golden Mile, how much total gold was produced, and what geological characteristics define the deposit according to Geological Survey of Western Australia (GSWA) records?",
    chosen: "HISTORICAL MINING INTELLIGENCE: Kalgoorlie Super Pit (Golden Mile / Fimiston Open Pit, Western Australia). Discovered in June 1893 by Patrick 'Paddy' Hannan, Tom Flanagan, and Dan O'Shea at Hannan's Find. Cumulative production exceeds 60 million ounces (over 1,800 tonnes of gold), making it one of the richest Archaean orogenic lode gold camps on Earth. Geology: Hosted within the Archaean Norseman-Wiluna greenstone belt, predominantly in differentiated dolerite (Golden Mile Dolerite) and Paringa Basalt, characterized by extensive telluride and gold-pyrite shear-vein systems. Consolidated by Kalgoorlie Consolidated Gold Mines (KCGM). Provenance: Geological Survey of Western Australia (GSWA) / Department of Mines, Industry Regulation and Safety (DMIRS).",
    rejected: "Kalgoorlie was discovered in 1950 by Rio Tinto and produced 5 million ounces from alluvial placer sands in New South Wales.",
    label_kind: "truth_source",
    provenance: {
      source_kind: "registry",
      source_url: "https://www.dmp.wa.gov.au/Geological-Survey/Geological-Survey-1376.aspx",
      authority: "Geological Survey of Western Australia (GSWA)"
    }
  },
  {
    prompt: "Investigate the Carlin Trend in Nevada, USA: Who discovered the primary disseminated deposit, what are the cumulative production metrics, and what geological characteristics define Carlin-type gold systems according to USGS and Nevada Bureau of Mines records?",
    chosen: "HISTORICAL MINING INTELLIGENCE: Carlin Trend (Eureka and Elko Counties, Nevada, USA). Discovered in 1961 by John Livermore and Alan Coope for Newmont Mining Corporation, beginning open-pit production in 1965. Cumulative production exceeds 90 million ounces of gold from over 40 open-pit and underground operations. Geology: Defines the archetype 'Carlin-type' sediment-hosted disseminated gold deposit. Sub-micron invisible gold resides in arsenic-rich rims of hydrothermal pyrite within silty carbonate rocks (Roberts Mountains and Popovich Formations), controlled by thrust faulted crustal windows through the Roberts Mountains Allochthon. Provenance: United States Geological Survey (USGS) / Nevada Bureau of Mines and Geology (NBMG).",
    rejected: "The Carlin Trend was discovered by BHP in 1985 in Queensland, Australia, yielding quartz reef vein gold.",
    label_kind: "truth_source",
    provenance: {
      source_kind: "registry",
      source_url: "https://www.usgs.gov/centers/geology-energy-and-minerals-science-center/science/carlin-type-gold-deposits",
      authority: "United States Geological Survey (USGS)"
    }
  },
  {
    prompt: "Investigate the Witwatersrand Basin in Gauteng, South Africa: What are the historical discovery details, cumulative production volumes, and geological host formations according to Council for Geoscience (CGS) records?",
    chosen: "HISTORICAL MINING INTELLIGENCE: Witwatersrand Basin (Gauteng and Free State, South Africa). Discovered in March 1886 by Australian prospector George Harrison on Langlaagte farm. Represents the largest known gold accumulation on Earth, yielding over 1.5 billion ounces (over 48,000 tonnes of gold, representing approximately 30-40% of all gold ever mined in human history). Reaches mining depths exceeding 4,000 meters (Mponeng, TauTona). Geology: Archaean quartz-pebble conglomerate paleoplacer reefs (Central Rand Group) metamorphosed at greenschist facies, with gold and uraninite concentrated along uncomformities and carbon seam pyritic matrices. Provenance: Council for Geoscience (CGS) South Africa.",
    rejected: "Witwatersrand was discovered in 1920 in British Columbia and produced 100 tonnes from Tertiary river gravels.",
    label_kind: "truth_source",
    provenance: {
      source_kind: "registry",
      source_url: "https://www.geoscience.org.za/",
      authority: "Council for Geoscience (CGS) South Africa"
    }
  },
  {
    prompt: "Investigate historical gold mining at the Kolar Gold Fields (KGF) in Karnataka, India: Who engineered deep reef mining, what was the cumulative gold yield, when did operations cease, and what geological reef structures define the lode according to Geological Survey of India (GSI) records?",
    chosen: "HISTORICAL MINING INTELLIGENCE: Kolar Gold Fields (KGF, Karnataka, India). Engineered commercially by British mining firm John Taylor & Sons from 1880 until nationalization in 1956 (Bharat Gold Mines Limited / BGML). Produced over 800 tonnes (approx 26 million ounces) of gold across 121 years of continuous operation, with shafts reaching depths of 3,200 meters (Champion Reef). Operations terminated on 28 February 2001 due to ore exhaustion at extreme depths and unviable extraction costs. Geology: Archaean Dharwar Craton greenstone belt orogenic quartz lodes, hosted in sheared tholeiitic amphibolites of the Kolar Schist Belt with high-grade free gold in quartz-carbonate-pyrite reefs. Provenance: Geological Survey of India (GSI).",
    rejected: "KGF is an active open-pit copper porphyry mine discovered in 1995 in Maharashtra.",
    label_kind: "truth_source",
    provenance: {
      source_kind: "registry",
      source_url: "https://www.gsi.gov.in/",
      authority: "Geological Survey of India (GSI)"
    }
  },
  {
    prompt: "Investigate the Klondike Gold Rush in Yukon, Canada: Who made the initial discovery on Bonanza Creek, what was the cumulative placer gold yield, and what geological host systems characterize the district according to Yukon Geological Survey and NRCan records?",
    chosen: "HISTORICAL MINING INTELLIGENCE: Klondike Gold District (Dawson City, Yukon Territory, Canada). Discovered on August 16, 1896 by Keish (Skookum Jim Mason), Dawson Charlie (Káa Goox), and George Carmack on Rabbit Creek (renamed Bonanza Creek), sparking the 1896-1899 Klondike Gold Rush. Cumulative placer gold production exceeds 12.5 million ounces (approx 390 tonnes), recovered from high-level White Channel gravel benches and modern creek bottoms. Geology: Placer deposits derived from erosion of orogenic quartz veins hosted in Permian-age Klondike Schist and metamorphic cataclasites, with bedrock hardrock mineralization associated with post-accretionary structural shear corridors. Provenance: Yukon Geological Survey (YGS) / Natural Resources Canada (NRCan).",
    rejected: "Klondike was an underground diamond kimberlite pipe discovered in 1970 in Ontario.",
    label_kind: "truth_source",
    provenance: {
      source_kind: "registry",
      source_url: "https://data.geology.gov.yk.ca/",
      authority: "Yukon Geological Survey (YGS) / NRCan"
    }
  }
];

if (existing.length === 6) {
  const appended = existing.concat(globalEntries.map(e => JSON.stringify(e))).join('\n') + '\n';
  fs.writeFileSync(p, appended, 'utf8');
  console.log('Appended 5 global benchmark entries. Total lines now:', appended.trim().split('\n').length);
} else {
  console.log('Dataset already has', existing.length, 'lines.');
}
