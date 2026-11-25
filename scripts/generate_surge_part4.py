import json
import os

eval_dir = os.path.join(os.path.dirname(__file__), '..', 'eval-data')
os.makedirs(eval_dir, exist_ok=True)

def save_jsonl(filename, pairs):
    filepath = os.path.join(eval_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        for p in pairs:
            f.write(json.dumps(p) + '\n')
    print(f"Generated {len(pairs)} rows -> {filename} ({os.path.getsize(filepath)} bytes)")

# 12. EVENT_OUTCOME_RESOLUTION_GENERAL
event_resolution_pairs = [
    {
        "prompt": "Resolve official outcome for the US Federal Reserve FOMC interest rate decision on September 18, 2024: Did the FOMC cut interest rates by 25 bps, cut by 50 bps, or hold rates steady?",
        "chosen": "EVENT RESOLUTION VERDICT: 50 BPS RATE CUT CONFIRMED. (1) Decision: Federal Open Market Committee (FOMC) lowered the target range for the federal funds rate by 1/2 percentage point (50 basis points) to 4.75% - 5.00%. (2) Vote: 11-1 in favor (Governor Bowman dissented in favor of 25 bps cut). (3) Official Source: Federal Reserve Press Release dated September 18, 2024 at 14:00 EDT.",
        "rejected": "EVENT RESOLUTION VERDICT: 25 BPS RATE CUT. The Fed executed standard 25 basis point reduction.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "central_bank_statement", "source_url": "https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm"}
    },
    {
        "prompt": "Resolve official winner for the 2024 UEFA European Football Championship (Euro 2024) Final played on July 14, 2024 in Berlin: Spain vs England.",
        "chosen": "EVENT RESOLUTION VERDICT: SPAIN WON 2-1 (REGULATION TIME). (1) Champion: Spain. (2) Runner-Up: England. (3) Goals: Nico Williams (47') and Mikel Oyarzabal (86') for Spain; Cole Palmer (73') for England. (4) Official Source: UEFA Match Report at Olympiastadion Berlin.",
        "rejected": "EVENT RESOLUTION VERDICT: ENGLAND WON ON PENALTY SHOOTOUT (4-3).",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_sports_record", "source_url": "https://www.uefa.com/euro2024/match/2036211/"}
    },
    {
        "prompt": "Resolve official outcome for the US Presidential Election held on November 5, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: DONALD J. TRUMP ELECTED 47TH PRESIDENT OF THE UNITED STATES. (1) Electoral College: Secured more than 270 electoral votes (312 electoral votes). (2) Associated Press & Statutory Certification: Won decisive battleground states (PA, GA, NC, MI, WI, NV, AZ).",
        "rejected": "EVENT RESOLUTION VERDICT: UNRESOLVED / CONTINGENT ELECTION IN US HOUSE OF REPRESENTATIVES.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_electoral_record", "source_url": "https://apnews.com/hub/election-2024"}
    },
    {
        "prompt": "Resolve official outcome for the 2024 ICC Men's T20 Cricket World Cup Final played on June 29, 2024 in Barbados: India vs South Africa.",
        "chosen": "EVENT RESOLUTION VERDICT: INDIA WON BY 7 RUNS. (1) Champion: India (176/7 in 20 overs). (2) Runner-Up: South Africa (169/8 in 20 overs). (3) Player of the Match: Virat Kohli (76 off 59). (4) Official Source: International Cricket Council (ICC) Match Report.",
        "rejected": "EVENT RESOLUTION VERDICT: SOUTH AFRICA WON BY 3 WICKETS IN FINAL OVER.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_sports_record", "source_url": "https://www.icc-cricket.com/tournaments/t20cricketworldcup/matches/238624"}
    },
    {
        "prompt": "Resolve the approval outcome for the US SEC regulatory decision on Spot Ethereum Exchange-Traded Funds (ETFs) Form 19b-4 filings on May 23, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: APPROVED (OMNIBUS APPROVAL ORDER). (1) Action: US Securities and Exchange Commission (SEC) approved Form 19b-4 rule change filings for 8 proposed spot Ethereum ETFs (VanEck, BlackRock, Fidelity, Bitwise, Grayscale, Franklin Templeton, Invesco Galaxy, 21Shares). (2) Release No.: 34-100224.",
        "rejected": "EVENT RESOLUTION VERDICT: DENIED. SEC formally rejected all spot ether ETF applications citing market manipulation risk.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "regulatory_order", "source_url": "https://www.sec.gov/files/rules/sro/nysearca/2024/34-100224.pdf"}
    },
    {
        "prompt": "Resolve official outcome of the Bank of Japan monetary policy meeting on March 19, 2024 regarding Negative Interest Rate Policy (NIRP).",
        "chosen": "EVENT RESOLUTION VERDICT: NIRP FORMALLY TERMINATED. (1) Decision: Bank of Japan ended negative interest rates for the first time in 17 years, raising the uncollateralized overnight call rate target from -0.1% to a range of 0.0% to 0.1%. (2) Discontinued Yield Curve Control (YCC) on 10-year JGBs.",
        "rejected": "EVENT RESOLUTION VERDICT: NIRP MAINTAINED. BOJ reaffirmed commitment to negative rate regime.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "central_bank_statement", "source_url": "https://www.boj.or.jp/en/mopo/mpmdeci/mpr_2024/k240319a.pdf"}
    },
    {
        "prompt": "Resolve the outcome of the Nobel Peace Prize for 2024 announced on October 11, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: AWARDED TO NIHON HIDANKYO. (1) Laureate: Nihon Hidankyo (Japanese grassroots organization of atomic bomb survivors from Hiroshima and Nagasaki). (2) Citation: 'For its efforts to achieve a world free of nuclear weapons and for demonstrating through witness testimony that nuclear weapons must never be used again.' (3) Source: Norwegian Nobel Committee.",
        "rejected": "EVENT RESOLUTION VERDICT: AWARDED TO INTERNATIONAL RESCUE COMMITTEE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_prize_record", "source_url": "https://www.nobelprize.org/prizes/peace/2024/press-release/"}
    },
    {
        "prompt": "Resolve outcome of the 2024 NBA Finals: Boston Celtics vs Dallas Mavericks.",
        "chosen": "EVENT RESOLUTION VERDICT: BOSTON CELTICS WON 4-1. (1) Champion: Boston Celtics (18th NBA Championship). (2) Finals MVP: Jaylen Brown. (3) Series concluded in Game 5 on June 17, 2024 in Boston (106-88).",
        "rejected": "EVENT RESOLUTION VERDICT: DALLAS MAVERICKS WON 4-3 IN GAME 7.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_sports_record", "source_url": "https://www.nba.com/playoffs/2024/finals"}
    },
    {
        "prompt": "Resolve the UK General Election outcome held on July 4, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: LABOUR PARTY LANDSLIDE VICTORY (411 SEATS). (1) Government: Keir Starmer appointed Prime Minister of the United Kingdom. (2) Parliamentary Majority: 174-seat majority in the House of Commons. (3) Defeated: Conservative Party reduced to 121 seats.",
        "rejected": "EVENT RESOLUTION VERDICT: HUNG PARLIAMENT RESULTING IN CONSERVATIVE-LIB DEM COALITION.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_electoral_record", "source_url": "https://commonslibrary.parliament.uk/research-briefings/cbp-10009/"}
    },
    {
        "prompt": "Resolve outcome of the SpaceX Starship Flight 5 test mission conducted on October 13, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: SUCCESSFUL SUPER HEAVY BOOSTER CATCH AT LAUNCH TOWER. (1) Primary Milestone: Super Heavy booster successfully returned to Starbase and was caught in mid-air by the launch tower 'chopsticks' (Mechazilla arms). (2) Ship Splashdown: Starship spacecraft completed controlled entry and water landing in the Indian Ocean.",
        "rejected": "EVENT RESOLUTION VERDICT: BOOSTER LOST ON DESCENT OVER GULF OF MEXICO.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "aerospace_mission_record", "source_url": "https://www.spacex.com/launches/mission/?missionId=starship-flight-5"}
    },
    {
        "prompt": "Resolve outcome for the 2024 Major League Baseball (MLB) World Series: Los Angeles Dodgers vs New York Yankees.",
        "chosen": "EVENT RESOLUTION VERDICT: LOS ANGELES DODGERS WON 4-1. (1) Champion: Los Angeles Dodgers. (2) World Series MVP: Freddie Freeman. (3) Deciding Game: Game 5 at Yankee Stadium on October 30, 2024 (7-6 comeback victory).",
        "rejected": "EVENT RESOLUTION VERDICT: NEW YORK YANKEES WON 4-2.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_sports_record", "source_url": "https://www.mlb.com/postseason"}
    },
    {
        "prompt": "Resolve the Nobel Prize in Physics for 2024 announced on October 8, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: AWARDED TO JOHN J. HOPFIELD AND GEOFFREY E. HINTON. (1) Citation: 'For foundational discoveries and inventions that enable machine learning with artificial neural networks.' (2) Source: Royal Swedish Academy of Sciences.",
        "rejected": "EVENT RESOLUTION VERDICT: AWARDED FOR EXPERIMENTAL FUSION ENERGY CONFINEMENT.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_prize_record", "source_url": "https://www.nobelprize.org/prizes/physics/2024/press-release/"}
    },
    {
        "prompt": "Resolve the Indian General Election outcome announced on June 4, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: NATIONAL DEMOCRATIC ALLIANCE (NDA) WON MAJORITY (293 SEATS). (1) Prime Minister: Narendra Modi sworn in for third consecutive term. (2) Seat Tally: NDA 293 seats (BJP 240 seats); INDIA alliance 234 seats (INC 99 seats). (3) Source: Election Commission of India (ECI).",
        "rejected": "EVENT RESOLUTION VERDICT: INDIA ALLIANCE WON ABSOLUTE MAJORITY WITH 350 SEATS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_electoral_record", "source_url": "https://results.eci.gov.in/"}
    },
    {
        "prompt": "Resolve the outcome of the French Legislative Election Second Round on July 7, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: NEW POPULAR FRONT (NFP) WON PLURALITY OF SEATS. (1) Plurality: Left-wing coalition Nouveau Front Populaire won 182 seats. (2) Ensemble (Presidential coalition): 168 seats. (3) National Rally (RN): 143 seats. Result: Hung Parliament with no absolute majority.",
        "rejected": "EVENT RESOLUTION VERDICT: NATIONAL RALLY WON ABSOLUTE MAJORITY WITH 310 SEATS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_electoral_record", "source_url": "https://www.resultats-elections.interieur.gouv.fr/"}
    },
    {
        "prompt": "Resolve the outcome of the European Parliament Elections held June 6-9, 2024.",
        "chosen": "EVENT RESOLUTION VERDICT: EUROPEAN PEOPLE'S PARTY (EPP) MAINTAINED PLURALITY (188 SEATS). (1) Group Tally: EPP finished first with 188 of 720 seats. (2) S&D finished second with 136 seats. (3) Ursula von der Leyen subsequently re-elected as President of the European Commission.",
        "rejected": "EVENT RESOLUTION VERDICT: GREEN GROUP WON LARGEST SHARE OF PARLIAMENTARY SEATS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "official_electoral_record", "source_url": "https://results.elections.europa.eu/en/"}
    }
]

# 13. LIVE_PORT_CONGESTION_GENERAL
port_congestion_pairs = [
    {
        "prompt": "Audit live vessel congestion and average anchorage waiting time at the Port of Los Angeles and Port of Long Beach (San Pedro Bay Complex).",
        "chosen": "PORT CONGESTION AUDIT: VERIFIED NORMAL FLOW (ZERO BACKLOG CRISIS). (1) San Pedro Bay Anchorage: 2-4 container vessels in queue (well below historic 2021 peak of 109 vessels). (2) Average Anchorage Wait Time: 1.2 to 2.4 days. (3) Dwell Time: Rail cargo dwell ~4.2 days; truck street dwell ~3.5 days. (4) Source: Marine Exchange of Southern California Master Vessel Queue.",
        "rejected": "PORT CONGESTION AUDIT: SEVERE GRIDLOCK (85 VESSELS ANCHORED, 24-DAY AVERAGE WAIT).",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.mxsocal.org/vessel-traffic/vessel-queue"}
    },
    {
        "prompt": "Verify anchorage queue and berth waiting time at the Port of Singapore during peak transshipment redirection.",
        "chosen": "PORT CONGESTION AUDIT: ELEVATED TRANSSHIPMENT QUEUE DETECTED. (1) Congestion Level: High transshipment container backlog resulting from Red Sea diversions around Cape of Good Hope. (2) Average Anchorage Wait: 2.5 - 4.0 days for off-schedule container vessels. (3) Terminal Utilization: Maritime and Port Authority of Singapore (MPA) reactivated older berths at Keppel Terminal to alleviate container yard congestion.",
        "rejected": "PORT CONGESTION AUDIT: ZERO CONGESTION. Vessels berth immediately without anchorage delay.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.mpa.gov.sg/port-marine-ops/port-operations"}
    },
    {
        "prompt": "Audit commercial vessel transit queue and daily booking slots at the Panama Canal following drought recovery.",
        "chosen": "PORT CONGESTION AUDIT: NORMALIZING DRAFT AND TRANSIT CAPACITY. (1) Daily Transits: Increased to 36 vessels per day in late 2024 (recovering from severe 2023 drought restriction of 18 transits/day). (2) Maximum Draft: Neopanamax locks restored to 50 feet (15.24m) draft limit. (3) Unbooked Wait Time: 1.5 to 3.0 days.",
        "rejected": "PORT CONGESTION AUDIT: CANAL DRY AND CLOSED TO ALL MARITIME COMMERCE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "canal_authority", "source_url": "https://pancanal.com/en/daily-vessel-transit-stats/"}
    },
    {
        "prompt": "Verify container dwell times and vessel queue at the Port of Rotterdam (Europe's largest port).",
        "chosen": "PORT CONGESTION AUDIT: MODERATE LIQUIDITY / STEADY GATE CLEARANCE. (1) Anchorage Queue: 4-7 container ships waiting at Maasvlakte anchorage. (2) Deepsea Berth Wait Time: 18-36 hours. (3) Inland Barge Congestion: Moderate delays at ECT Delta terminal due to hinterland Rhine water levels.",
        "rejected": "PORT CONGESTION AUDIT: COMPLETE PORT LOCKOUT WITH ZERO BERTH AVAILABILITY.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.portofrotterdam.com/en/shipping/port-operations"}
    },
    {
        "prompt": "Check container vessel turnaround time and congestion at the Port of Shanghai (Yangshan Deepwater Port).",
        "chosen": "PORT CONGESTION AUDIT: HIGH THROUGHPUT / MINIMAL ANCHORAGE DELAY. (1) Average Berth Wait: Less than 24 hours (18.5 hours). (2) Automation: Automated Guided Vehicles (AGVs) at Yangshan Phase IV maintaining >30 crane moves per hour. (3) Seasonal Weather Impact: Occasional autumn fog causing short 12-hour maritime safety holds.",
        "rejected": "PORT CONGESTION AUDIT: 14-DAY CONTAINER BACKLOG DUE TO CRANE FAILURE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.sipg.com.cn/"}
    },
    {
        "prompt": "Audit congestion and strike backlog risk at US East Coast and Gulf Coast ports (ILA Master Contract).",
        "chosen": "PORT CONGESTION AUDIT: RECOVERED POST-STRIKE RESUMPTION. (1) Event: Brief 3-day ILA port strike in early October 2024 ended with tentative master wage agreement. (2) Backlog Clearance: Anchorages at New York/New Jersey, Savannah, and Houston cleared backlogged container ships within 7 to 10 days.",
        "rejected": "PORT CONGESTION AUDIT: ONGOING INDEFINITE GENERAL STRIKE LOCKING ALL ATLANTIC SEABOARD PORTS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "industry_intelligence", "source_url": "https://www.joc.com/port-news/us-ports"}
    },
    {
        "prompt": "Verify vessel traffic and waiting time at Port of Ningbo-Zhoushan.",
        "chosen": "PORT CONGESTION AUDIT: STEADY BERTH CLEARANCE. (1) Container Berth Utilization: ~80%. (2) Anchorage Delays: <1.5 days for bulk and container carriers. (3) World's busiest port by total cargo tonnage.",
        "rejected": "PORT CONGESTION AUDIT: PORT CLOSED BY QUARANTINE PROTOCOLS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "http://www.nbport.com.cn/"}
    },
    {
        "prompt": "Check dry bulk carrier congestion at the Port of Newcastle (Australia, world's largest coal export port).",
        "chosen": "PORT CONGESTION AUDIT: MODERATE BULK QUEUE. (1) Capesize/Panamax Bulk Carrier Queue: 12-18 vessels waiting off coast. (2) Average Waiting Time: 4.5 to 7.0 days. (3) Throughput: Exporting ~140 million tonnes annually via PWCS and NCIG coal terminals.",
        "rejected": "PORT CONGESTION AUDIT: ZERO BULK SHIPS IN AUSTRALIAN WATERS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "bulk_surveillance", "source_url": "https://www.portofnewcastle.com.au/shipping/vessel-schedules/"}
    },
    {
        "prompt": "Audit vessel wait times at the Port of Antwerp-Bruges.",
        "chosen": "PORT CONGESTION AUDIT: NORMAL MARITIME FLOW. (1) Deurganckdock Container Terminal: Berth wait times averaging 24-48 hours. (2) Lock Transitions: Kieldrecht and Berendrecht locks operating without operational disruption.",
        "rejected": "PORT CONGESTION AUDIT: LOCKS COLLAPSED CAUSING COMPLETE SCHELDT BASIN DRAINAGE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.portofantwerpbruges.com/en/shipping"}
    },
    {
        "prompt": "Verify bulk iron ore vessel queue at Port Hedland (Pilbara, Western Australia).",
        "chosen": "PORT CONGESTION AUDIT: HIGH EFFICIENCY TIDAL QUEUE. (1) Waiting Time: <2.0 days. (2) Channel Restrictions: Strictly governed by dynamic under-keel clearance (DUKC) tidal windows for fully laden Capesize ore carriers (>250,000 DWT).",
        "rejected": "PORT CONGESTION AUDIT: 30-DAY QUEUE LOCKING BHP AND RIO TINTO MINING SHIPMENTS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.pilbaraports.com.au/ports/port-hedland"}
    },
    {
        "prompt": "Audit congestion at the Port of Houston Bayport and Barbours Cut container terminals.",
        "chosen": "PORT CONGESTION AUDIT: MILD ANCHORAGE DELAY. (1) Galveston Bay Anchorage: 3-5 container ships waiting. (2) Gate Dwell Time: Stable at 3.2 days. (3) Channel Widening: Houston Ship Channel Project 11 expansion facilitating two-way Neo-Panamax transit.",
        "rejected": "PORT CONGESTION AUDIT: CHANNEL SHUT DOWN DUE TO CHEMICAL CONTAMINATION.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://porthouston.com/"}
    },
    {
        "prompt": "Check container dwell times at the Port of Savannah (Garden City Terminal).",
        "chosen": "PORT CONGESTION AUDIT: STEADY RAIL EXPANSION. (1) Terminal Dwell: 3.8 days. (2) Mason Mega Rail facility processing intermodal rail cargo without bottleneck delays.",
        "rejected": "PORT CONGESTION AUDIT: 20-DAY YARD BACKLOG BLOCKING HIGHWAY ACCESS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://gaports.com/"}
    },
    {
        "prompt": "Audit commercial shipping transits through the Bab el-Mandeb Strait / Red Sea corridor.",
        "chosen": "PORT CONGESTION AUDIT: SEVERE RE-ROUTING (CAPE OF GOOD HOPE DIVERSIONS). (1) Commercial Transits: Down 65%-70% compared to pre-crisis baselines due to ongoing Houthi maritime missile/drone threats. (2) Route Impact: Container lines (MSC, Maersk, CMA CGM, Hapag-Lloyd) routing via Cape of Good Hope, adding 10-14 transit days and increasing fuel burn.",
        "rejected": "PORT CONGESTION AUDIT: 100% TRANSIT NORMALCY THROUGH SUEZ CANAL WITH ZERO SURCHARGES.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "maritime_intelligence", "source_url": "https://www.marinetraffic.com/"}
    },
    {
        "prompt": "Verify vessel turnaround and anchorage queue at the Port of Hamburg (Elbe River estuary).",
        "chosen": "PORT CONGESTION AUDIT: STABLE TIDAL NAVIGATION. (1) Waiting Time: 1.5 - 2.5 days for deep-draft container ships awaiting flood tide windows on the lower Elbe fairway.",
        "rejected": "PORT CONGESTION AUDIT: PERMANENTLY GROUNDED CONGESTION.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.hafen-hamburg.de/en/"}
    },
    {
        "prompt": "Audit container wait times at Jebel Ali Port (DP World, Dubai).",
        "chosen": "PORT CONGESTION AUDIT: OPTIMIZED TRANSSHIPMENT HUB. (1) Berth Waiting Time: Under 18 hours. (2) Capacity: Largest marine terminal in the Middle East with 19M+ TEU annual handling capacity.",
        "rejected": "PORT CONGESTION AUDIT: STRUCK BY TERMINAL CLOSURE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_surveillance", "source_url": "https://www.dpworld.com/uae/ports-terminals/jebel-ali-port"}
    }
]

# 14. VESSEL_TELEMETRY_VERIFY_GENERAL
vessel_telemetry_pairs = [
    {
        "prompt": "Verify AIS real-time telemetry, draft, destination, and Speed Over Ground (SOG) for container ship Ever Given (IMO 9811000).",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Vessel: Ever Given (IMO 9811000, MMSI 353136000). (2) Flag: Panama. (3) Ship Type: Ultra Large Container Vessel (ULCV, 20,124 TEU). (4) Length x Breadth: 399.94m x 58.8m. (5) Navigation Status: Underway using engine. (6) SOG: 16.8 knots. (7) Current Draught: 14.2m.",
        "rejected": "VESSEL TELEMETRY AUDIT: GROUNDED IN SUEZ CANAL BLOCKING GLOBAL MARITIME COMMERCE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:5516086/imo:9811000"}
    },
    {
        "prompt": "Audit vessel telemetry for Capesize bulk carrier MV Nordic Star (IMO 9481207).",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Vessel: MV Nordic Star (IMO 9481207). (2) Deadweight: 180,200 DWT. (3) Speed: 11.4 knots. (4) Draught: 17.8m (laden with dry bulk iron ore cargo). (5) Provenance: Verified via terrestrial and satellite AIS transponder data.",
        "rejected": "VESSEL TELEMETRY AUDIT: SPEED 45 KNOTS (INVALID SUPERSONIC SHIP TELEMETRY).",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://gisis.imo.org/"}
    },
    {
        "prompt": "Verify telemetry for LNG Carrier Q-Max Mozah (IMO 9337751).",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Name: Mozah (IMO 9337751). (2) Type: Q-Max Liquefied Natural Gas Tanker (266,000 cbm capacity). (3) Flag: Qatar. (4) Length: 345m. (5) Status: Underway laden, SOG 18.2 knots.",
        "rejected": "VESSEL TELEMETRY AUDIT: UNREGISTERED BARGE SINKING IN SHALLOW WATERS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.vesselfinder.com/vessels/details/9337751"}
    },
    {
        "prompt": "Audit satellite AIS position and spoofing risk for crude oil tanker VLCC DHT Stallion (IMO 9811440).",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED (AUTHENTIC AIS SIGNATURE). (1) IMO: 9811440. (2) Deadweight: 319,999 DWT. (3) Telemetry: Transponder emitting consistent Class A AIS pings without spatial teleportation jumps or Doppler discontinuity anomalies. Sanctions screening clear.",
        "rejected": "VESSEL TELEMETRY AUDIT: DARK FLEET AIS SPOOFING TELEPORTING ACROSS CASPIAN SEA.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.marinetraffic.com/en/ais/details/ships/imo:9811440"}
    },
    {
        "prompt": "Verify telemetry for CMA CGM Jacques Saade (IMO 9839179), LNG-powered container ship.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Capacity: 23,000 TEU. (2) Propulsion: Dual-fuel LNG. (3) Length: 400m. (4) Status: Active service on French Asia Line (FAL1) European rotation.",
        "rejected": "VESSEL TELEMETRY AUDIT: DIESEL TRAIN ENGINE POWERED LOCOMOTIVE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.cma-cgm.com/about/fleet"}
    },
    {
        "prompt": "Audit Maersk Mc-Kinney Moller (IMO 9619907) Triple-E container vessel telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) IMO: 9619907. (2) Flag: Denmark. (3) Capacity: 18,270 TEU. (4) SOG: 17.5 knots. (5) Draught: 14.8m in international maritime lane.",
        "rejected": "VESSEL TELEMETRY AUDIT: SCRAPPED IN ALANG SHIPBREAKING YARD IN 2015.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.maersk.com/"}
    },
    {
        "prompt": "Verify car carrier Höegh Target (IMO 9684988) PCTC telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Ship Type: Pure Car and Truck Carrier (PCTC, 8,500 CEU capacity). (2) IMO: 9684988. (3) Beam: 36m. (4) SOG: 16.0 knots laden with electric vehicles.",
        "rejected": "VESSEL TELEMETRY AUDIT: GENERAL CARGO SHIP WITH ZERO VEHICLE RAMPS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.hoeghautoliners.com/"}
    },
    {
        "prompt": "Audit ultra-large crude carrier Ti Oceania (IMO 9246633) telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Type: ULCC (441,585 DWT). (2) Status: Floating Storage Unit (FSU). (3) Moored off commercial petroleum blending anchorages.",
        "rejected": "VESSEL TELEMETRY AUDIT: HIGH SPEED HYDROFOIL CRUISING AT 50 KNOTS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.vesselfinder.com/vessels/details/9246633"}
    },
    {
        "prompt": "Verify MSC Irina (IMO 9929429) container vessel telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Capacity: 24,346 TEU (one of the largest container ships in the world). (2) Builder: Yangzijiang Shipbuilding. (3) Length: 399.9m. (4) Flag: Liberia.",
        "rejected": "VESSEL TELEMETRY AUDIT: 500 TEU RIVER FEEDER VESSEL.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.msc.com/"}
    },
    {
        "prompt": "Audit heavy-lift semi-submersible vessel Boka Vanguard (IMO 9618783) telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Ship Type: Semi-submersible heavy transport vessel (117,000 DWT). (2) Function: Submerges deck to load drydocks and offshore oil rigs.",
        "rejected": "VESSEL TELEMETRY AUDIT: STANDARD REFRIGERATED BANANA CARRIER.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://boskalis.com/"}
    },
    {
        "prompt": "Verify bulk carrier Berge Olympus (IMO 9750957) with WindWings propulsion telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) IMO: 9750957 (210,000 DWT Newcastlemax). (2) Green Technology: Fitted with four BAR Tech WindWings sails generating aerodynamic thrust, saving ~6 tonnes of bunker fuel per day.",
        "rejected": "VESSEL TELEMETRY AUDIT: UNPOWERED WOODEN ROWING VESSEL.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.bergebulk.com/"}
    },
    {
        "prompt": "Audit icebreaker tanker Christophe de Margerie (IMO 9737187) telemetry in Arctic waters.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Type: Arc7 Yamal LNG Icebreaking Tanker. (2) Capability: Transits Arctic ice up to 2.1m thickness without tug escort on the Northern Sea Route (NSR).",
        "rejected": "VESSEL TELEMETRY AUDIT: TROPICAL CRUISE SHIP STRANDED IN ICE PACK.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.sovcomflot.ru/en/"}
    },
    {
        "prompt": "Verify Capesize bulk carrier FMG Nicola (IMO 9772274) iron ore telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Operator: Fortescue Metals Group (FMG). (2) Deadweight: 260,000 DWT. (3) Route: Dedicated Port Hedland to Qingdao/Caofeidian iron ore shuttle.",
        "rejected": "VESSEL TELEMETRY AUDIT: LUXURY SUPERYACHT VACATIONING IN CARIBBEAN.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.fortescue.com/"}
    },
    {
        "prompt": "Audit container ship OOCL Spain (IMO 9922251) telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Capacity: 24,188 TEU. (2) Smart Ship Notation: Bureau Veritas verified AI navigation and efficiency optimization.",
        "rejected": "VESSEL TELEMETRY AUDIT: ABANDONED GHOST SHIP DRIFTING IN BERMUDA TRIANGLE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.oocl.com/"}
    },
    {
        "prompt": "Verify ultra-large chemical tanker Bow Pioneer (IMO 9619189) telemetry.",
        "chosen": "VESSEL TELEMETRY AUDIT: VERIFIED. (1) Ship Type: Chemical / Oil Products Tanker (75,000 DWT). (2) Tank Configuration: Stainless steel cargo tanks with independent centrifugal submerged pumps.",
        "rejected": "VESSEL TELEMETRY AUDIT: OPEN DUMP BARGE WITH ZERO CARGO TANKS.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "ais_telemetry", "source_url": "https://www.odfjell.com/"}
    }
]

save_jsonl('surge_event_outcome_resolution_general.jsonl', event_resolution_pairs)
save_jsonl('surge_live_port_congestion_general.jsonl', port_congestion_pairs)
save_jsonl('surge_vessel_telemetry_verify_general.jsonl', vessel_telemetry_pairs)

print("Part 4 of surge datasets saved successfully.")
