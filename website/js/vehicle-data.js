/* Scher Rodriguez Motorgroup — vehicle suggestion dictionaries for the valuation intake form.
   Suggestions only: the form always accepts custom makes / models / transmissions. */
window.SM_VEHICLES = {
  /* Marques (canonical capitalization). Matching is case-insensitive and ignores spaces / hyphens / dots. */
  makes: [
    "Porsche", "BMW", "Ferrari", "Dodge", "Mercedes-Benz", "Lamborghini", "Audi", "Aston Martin", "McLaren", "Lotus",
    "Alfa Romeo", "Ford", "Chevrolet", "Shelby", "Nissan", "Toyota", "Acura", "Honda", "Mazda", "Subaru", "Mitsubishi",
    "Volkswagen", "Jaguar", "Land Rover", "Bentley", "Rolls-Royce", "Maserati", "Bugatti", "Pagani", "Koenigsegg",
    "DeTomaso", "Morgan", "Caterham", "Noble", "Ruf", "Singer", "Lexus", "Infiniti", "Datsun", "Saab", "Volvo", "MINI",
    "Lancia", "Fiat", "Abarth", "Alpine", "TVR", "MG", "Triumph", "Austin-Healey", "AC", "Maybach", "Pontiac", "Plymouth",
    "Oldsmobile", "Buick", "Cadillac", "Lincoln", "Mercury", "Jeep", "Saleen", "Hennessey", "Panoz", "Vector", "Spyker",
    "Renault", "Peugeot", "Opel", "Lola", "Radical", "Ariel", "Tesla", "Rimac", "Polestar", "Genesis", "Kia", "Hyundai"
  ],

  /* Models keyed by canonical make. */
  models: {
    "Porsche": [
      "911 Carrera", "911 Carrera S", "911 Carrera 4", "911 Carrera 4S", "911 Carrera GTS", "911 Carrera T", "911 Carrera RS",
      "911 Carrera M491 Turbo-Look", "911 Carrera Targa", "911 Carrera Cabriolet", "911 SC", "911 Turbo", "911 Turbo S", "911 GT3",
      "911 GT3 RS", "911 GT3 Touring", "911 GT2 RS", "911 Targa", "911 Speedster", "911 R", "911 Sport Classic", "911 S/T",
      "Carrera GT", "918 Spyder", "959", "930 Turbo", "964", "993", "996", "997", "991", "992",
      "718 Cayman GT4", "718 Cayman GT4 RS", "718 Cayman S", "718 Boxster Spyder", "Boxster Spyder", "Boxster S", "Boxster",
      "Cayman S", "Cayman GT4", "Cayman R", "914", "914-6", "924", "924 Carrera GT", "928", "928 GTS", "944", "944 Turbo",
      "944 S2", "968", "968 Club Sport", "356", "356 Speedster", "550 Spyder", "Cayenne", "Cayenne S", "Cayenne GTS", "Cayenne Turbo", "Cayenne Turbo S E-Hybrid", "Cayenne Turbo GT", "Macan", "Macan S", "Macan GTS", "Macan Turbo", "Macan Electric",
      "Panamera", "Panamera 4S", "Panamera GTS", "Panamera Turbo", "Panamera Turbo S", "Taycan", "Taycan 4S", "Taycan Turbo", "Taycan Turbo S", "718 Cayman", "718 Boxster", "718 Spyder RS", "911 Dakar", "911 Targa 4S", "911 Turbo (930)"
    ],
    "BMW": [
      "M3", "M3 Coupe (E46)", "M3 Convertible (E46)", "M3 (E30)", "M3 (E36)", "M3 (E90)", "M3 (E92)", "M3 (E93)", "M3 (F80)", "M3 (G80)", "M3 CS", "M3 CSL",
      "M5", "M5 (E39)", "M5 (E28)", "M5 (E34)", "M5 (E60)", "M5 (F10)", "M5 (F90)", "M5 (G90)", "M5 Touring", "M4", "M4 CSL", "M2", "M2 CS", "M2 Competition", "1M Coupe",
      "Z8", "Z4 M Coupe", "Z4 M Roadster", "Z3 M Coupe", "Z3 M Roadster", "M6", "M635CSi", "M1", "850CSi", "840Ci",
      "535i xDrive Sports Wagon", "335i", "335i Sedan", "335is", "330i ZHP", "330i", "328d xDrive Wagon", "328i", "325is", "2002tii",
      "2002", "3.0 CSL", "E30 325i", "E36 328i", "540i 6-Speed", "550i", "750iL", "i8", "X5 M", "X6 M"
    ],
    "Dodge": [
      "Viper RT/10", "Viper GTS", "Viper ACR", "Viper SRT-10", "Viper SRT-10 ACR", "Viper GTS-R", "Challenger SRT Hellcat",
      "Challenger SRT Demon", "Challenger R/T Scat Pack", "Challenger T/A", "Charger", "Charger R/T", "Charger Daytona",
      "Charger SRT Hellcat", "Charger Super Bee", "Coronet R/T", "Dart GTS", "Stealth R/T Turbo", "Neon SRT-4", "Ram SRT-10", "Durango SRT"
    ],
    "Ferrari": [
      "F430", "F430 Scuderia", "F430 Spider", "360 Modena", "360 Challenge Stradale", "360 Spider", "355", "355 Spider",
      "348", "328 GTS", "308 GTS", "Testarossa", "512 TR", "F512 M", "550 Maranello", "575M Maranello", "599 GTB Fiorano", "612 Scaglietti",
      "456 GT", "458 Italia", "458 Speciale", "488 GTB", "488 Pista", "F8 Tributo", "F8 Spider", "812 Superfast", "812 GTS", "SF90 Stradale", "296 GTB", "Purosangue", "GTC4Lusso", "FF", "F12berlinetta", "12Cilindri", "Daytona SP3", "Portofino M", "California", "California T",
      "Enzo", "F40", "F50", "LaFerrari", "Dino 246 GT", "365 GTB/4 Daytona", "250 GTO", "Mondial", "Portofino", "Roma"
    ],
    "Mercedes-Benz": [
      "SLS AMG", "SLS AMG Black Series", "SLR McLaren", "AMG GT", "AMG GT R", "AMG GT S", "C63 AMG", "C63 AMG Black Series", "E63 AMG",
      "E55 AMG", "CLK63 AMG Black Series", "CLK GTR", "SL55 AMG", "SL65 AMG Black Series", "SL 63 AMG", "300SL Gullwing", "300SL Roadster",
      "190E 2.5-16 Evolution II", "190E 2.3-16", "500E", "E500", "280SL Pagoda", "450SEL 6.9", "G63 AMG", "G500", "S600", "SLK55 AMG", "Unimog"
    ],
    "Lamborghini": [
      "Countach", "Countach LP400", "Countach 25th Anniversary", "Diablo", "Diablo VT", "Diablo SV", "Diablo GT", "Murcielago", "Murcielago LP640",
      "Murcielago LP670-4 SV", "Gallardo", "Gallardo LP560-4", "Gallardo Superleggera", "Gallardo Spyder", "Huracan", "Huracan Performante",
      "Huracan STO", "Huracan EVO", "Huracan Tecnica", "Revuelto", "Aventador", "Aventador SVJ", "Urus", "Miura", "Jalpa", "Espada", "Jarama", "LM002", "Reventon", "Sesto Elemento"
    ],
    "Ford": [
      "Ford GT", "Ford GT40", "Mustang Shelby GT350", "Mustang Shelby GT500", "Mustang Shelby GT350R", "Mustang Boss 302", "Mustang Boss 429",
      "Mustang Mach 1", "Mustang SVT Cobra", "Mustang SVT Cobra R", "Mustang GT", "Mustang Bullitt", "Focus RS", "Focus ST", "Fiesta ST",
      "Escort Cosworth", "Sierra RS Cosworth", "F-150 SVT Lightning", "F-150 Raptor", "Bronco", "Thunderbird", "Falcon GT"
    ],
    "Chevrolet": [
      "Corvette Z06", "Corvette ZR1", "Corvette Grand Sport", "Corvette Stingray", "Corvette C4 ZR-1", "Corvette C5 Z06", "Corvette C6 Z06",
      "Corvette C7 Z06", "Corvette C8 Z06", "Corvette 427", "Corvette L88", "Camaro Z/28", "Camaro ZL1", "Camaro SS", "Camaro IROC-Z",
      "Chevelle SS", "Impala SS", "Nova SS", "Monte Carlo SS", "El Camino SS", "SSR", "Silverado SS", "Bel Air"
    ],
    "Toyota": [
      "Supra Turbo", "Supra Turbo (A80)", "Supra (A90)", "Supra (A70)", "Supra Mk3 Turbo", "MR2 Turbo", "MR2 Spyder", "GR86", "86", "GR Corolla",
      "AE86", "Celica GT-Four", "Celica Supra", "Land Cruiser FJ40", "Land Cruiser 80 Series", "Land Cruiser 100 Series", "4Runner", "Tacoma", "Lexus LFA"
    ],
    "Acura": ["NSX", "NSX-R", "NSX-T", "NSX Type S", "Integra Type R", "Integra GS-R", "RSX Type-S", "TL Type-S", "RDX", "Legend Coupe"],
    "Nissan": [
      "GT-R", "GT-R Nismo", "GT-R (R32)", "GT-R (R33)", "GT-R (R34)", "GT-R (R35)", "Skyline GT-R", "300ZX Twin Turbo", "300ZX", "350Z", "370Z",
      "370Z Nismo", "Z", "240Z", "260Z", "280Z", "280ZX Turbo", "Silvia S15", "180SX", "Patrol", "Pathfinder"
    ],
    "Audi": [
      "R8", "R8 V10 Plus", "RS6 Avant", "RS4", "RS4 Avant", "RS3", "RS2 Avant", "RS5", "RS7", "TT RS", "TTS", "S4", "S5", "S6", "S8", "Quattro",
      "Sport Quattro", "Ur-Quattro", "90 Quattro", "V8 Quattro", "A4 Quattro", "e-tron GT"
    ],
    "Aston Martin": ["DB5", "DB6", "DB7", "DB9", "DB11", "DBS", "DBS Superleggera", "Vantage V8", "Vantage V12", "V8 Vantage", "V12 Vantage", "Vanquish", "Vanquish S", "One-77", "Valkyrie", "Rapide S", "Virage", "Lagonda"],
    "McLaren": ["F1", "MP4-12C", "540C", "570S", "600LT", "650S", "675LT", "720S", "765LT", "P1", "Senna", "Elva", "Artura", "GT", "Speedtail", "750S"],
    "Lotus": ["Elise", "Elise S1", "Exige", "Exige S", "Exige Cup 430", "Evora", "Evora GT430", "Esprit", "Esprit V8", "Esprit Turbo", "Europa", "Elan", "Seven", "Emira", "Eletre", "340R"],
    "Alfa Romeo": ["4C", "8C Competizione", "Giulia Quadrifoglio", "Giulia Sprint Veloce", "GTV6", "Spider", "Spider Veloce", "Montreal", "Stelvio Quadrifoglio", "156 GTA", "147 GTA", "Brera", "33 Stradale"],
    "Shelby": ["Cobra 427", "Cobra 289", "GT350", "GT500", "GT500KR", "Series 1", "Daytona Coupe", "Super Snake", "Dodge Omni GLH"],
    "Honda": ["S2000", "S2000 CR", "Civic Type R", "Civic Si", "Integra Type R", "NSX", "CRX Si", "Prelude", "Accord Euro R", "S800", "Beat", "Element"],
    "Mazda": ["RX-7", "RX-7 Turbo II", "RX-7 FD", "RX-7 FC", "RX-8", "MX-5 Miata", "MX-5 Miata Club Sport", "Miata MSM", "Mazdaspeed3", "Mazdaspeed Miata", "Cosmo", "323 GTR", "Mazdaspeed6"],
    "Subaru": ["WRX STI", "WRX", "Impreza WRX STI", "Impreza 22B", "Impreza 2.5RS", "BRZ", "Legacy GT Spec B", "SVX", "Forester XT", "Baja", "BRAT"],
    "Mitsubishi": ["Lancer Evolution", "Lancer Evolution VIII", "Lancer Evolution IX", "Lancer Evolution X", "3000GT VR-4", "Eclipse GSX", "GTO", "Starion ESI-R", "Delica"],
    "Volkswagen": ["Golf R", "Golf R32", "Golf GTI", "Golf GTI Mk1", "Corrado VR6", "Corrado G60", "Scirocco", "Beetle", "Karmann Ghia", "Type 2 Bus", "Touareg", "Phaeton W12", "Passat W8"],
    "Jaguar": ["E-Type", "E-Type Series 1", "XJ220", "XJR-15", "XK120", "XK140", "XK150", "XKR", "XKR-S", "F-Type R", "F-Type SVR", "XJ-S", "XJR", "XFR-S", "Mark 2", "D-Type"],
    "Land Rover": ["Defender 90", "Defender 110", "Defender 130", "Series IIA", "Series III", "Range Rover Classic", "Range Rover", "Discovery", "Discovery 1", "Range Rover Sport SVR"],
    "Bentley": ["Continental GT", "Continental GT Speed", "Continental R", "Continental SC", "Azure", "Arnage", "Mulsanne", "Turbo R", "Speed Six", "Blower", "R-Type Continental", "Bentayga"],
    "Rolls-Royce": ["Phantom", "Ghost", "Wraith", "Dawn", "Cullinan", "Silver Shadow", "Silver Cloud", "Silver Spur", "Silver Spirit", "Corniche", "Camargue", "Spectre"],
    "Maserati": ["MC12", "MC20", "GranTurismo", "GranTurismo MC Stradale", "Quattroporte", "Quattroporte V", "Coupe", "3200 GT", "Spyder", "Bora", "Merak", "Ghibli", "Biturbo", "Khamsin", "Indy"],
    "Bugatti": ["Veyron", "Veyron Grand Sport Vitesse", "Chiron", "Chiron Super Sport", "EB110", "Divo", "Type 57", "Type 35"],
    "Pagani": ["Zonda", "Zonda F", "Zonda Cinque", "Huayra", "Huayra BC", "Utopia"],
    "Koenigsegg": ["CCX", "CCXR", "CCR", "Agera", "Agera R", "Agera RS", "One:1", "Regera", "Jesko", "Gemera"],
    "DeTomaso": ["Pantera", "Pantera GT5-S", "Mangusta", "Longchamp", "Guara", "Deauville"],
    "Morgan": ["Plus 4", "Plus 8", "4/4", "Aero 8", "Aero SuperSports", "Plus Six", "3 Wheeler", "Roadster"],
    "Caterham": ["Seven", "Seven 620R", "Seven CSR", "Seven 270", "Seven 310", "Seven 360", "Seven 420", "Seven 485", "Seven 600", "Super Seven"],
    "Noble": ["M12 GTO", "M400", "M600", "M10", "M15"],
    "Ruf": ["CTR", "CTR Yellowbird", "CTR2", "CTR3", "R Turbo", "Rt 12", "RGT", "Rt 35", "SCR"],
    "Singer": ["911 DLS", "911 Classic Study", "911 Turbo Study", "911 Reimagined", "911 ACS"],
    "Lexus": ["LFA", "LC 500", "IS F", "RC F", "GS F", "SC 430", "IS 300", "LS 400", "GX 470"],
    "Infiniti": ["G35", "G37", "Q60", "Q50 Red Sport", "FX50", "M45"],
    "Datsun": ["240Z", "260Z", "280Z", "510", "620", "Fairlady", "1600 Roadster", "2000 Roadster"],
    "MINI": ["Cooper S", "John Cooper Works", "John Cooper Works GP", "Cooper S Works", "Clubman", "Mini Cooper (Classic)"],
    "Lancia": ["Delta Integrale", "Delta HF Integrale Evo", "Stratos", "037", "Fulvia HF", "Aurelia B24", "Flaminia"],
    "TVR": ["Griffith", "Chimaera", "Cerbera", "Tuscan", "Tuscan S", "Sagaris", "Tamora", "T350", "Cerbera Speed 12"],
    "Triumph": ["TR6", "TR4", "TR3", "TR7", "Spitfire", "GT6", "Stag", "TR8", "Dolomite Sprint"],
    "Austin-Healey": ["3000", "3000 Mk III", "100-4", "100-6", "100S", "Sprite"],
    "Pontiac": ["GTO", "Firebird Trans Am", "Firebird Formula", "Fiero GT", "Grand National", "Solstice GXP", "G8 GXP", "Trans Am WS6"],
    "Plymouth": ["Barracuda", "Road Runner", "Superbird", "GTX", "Hemi Cuda", "Prowler"],
    "Buick": ["Grand National", "GNX", "Regal T-Type", "Riviera", "Roadmaster", "Skylark GS"],
    "Cadillac": ["CTS-V", "CTS-V Wagon", "ATS-V", "CT5-V Blackwing", "XLR-V", "Eldorado", "Allante"],
    "Saleen": ["S281", "S302", "S7", "S7 Twin Turbo", "Mustang S281 Extreme"],
    "Renault": ["Alpine A110", "R5 Turbo", "Clio V6", "Megane R.S.", "Sport Spider"],
    "Alpine": ["A110", "A110 S", "A310", "A610"],
    "Tesla": ["Roadster", "Model S Plaid", "Model 3 Performance"]
  },

  /* Transmission option sets. 6-Speed Manual is always first so it stays the default. */
  universalTransmissions: ["6-Speed Manual", "5-Speed Manual", "7-Speed Manual", "Automated Manual (PDK / DCT / F1 / SMG)", "Automatic", "Other / Custom Specification"]
};
