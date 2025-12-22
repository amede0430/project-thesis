// Réseau de capteurs éparpillés sur Cotonou - Distribution réaliste
export const mapSensors = [
  // Capteurs critiques
  { id: 'AQ-N-047', position: [6.3703, 2.3912] as [number, number], status: 'critique' as const, location: 'Avenue Steinmetz', sector: 'Secteur Nord' },
  { id: 'AQ-S-023', position: [6.3298, 2.4187] as [number, number], status: 'critique' as const, location: 'Place des Martyrs', sector: 'Secteur Sud' },
  
  // Capteurs en alerte
  { id: 'AQ-E-091', position: [6.3754, 2.4356] as [number, number], status: 'alerte' as const, location: 'Boulevard Lagunaire', sector: 'Secteur Est' },
  { id: 'AQ-O-156', position: [6.3489, 2.3589] as [number, number], status: 'alerte' as const, location: 'Marché Dantokpa', sector: 'Secteur Ouest' },
  { id: 'AQ-C-078', position: [6.3612, 2.3998] as [number, number], status: 'alerte' as const, location: 'Avenue Clozel', sector: 'Secteur Centre' },
  
  // Capteurs attention
  { id: 'AQ-N-089', position: [6.3856, 2.3745] as [number, number], status: 'attention' as const, location: 'Quartier Akpakpa', sector: 'Secteur Nord' },
  { id: 'AQ-S-067', position: [6.3245, 2.4298] as [number, number], status: 'attention' as const, location: 'Rue Tokplegbe', sector: 'Secteur Sud' },
  { id: 'AQ-E-134', position: [6.3898, 2.4434] as [number, number], status: 'attention' as const, location: 'Quartier Fidjrossè', sector: 'Secteur Est' },
  
  // Capteurs hors ligne
  { id: 'AQ-C-012', position: [6.3578, 2.3956] as [number, number], status: 'offline' as const, location: 'Place de l\'Étoile Rouge', sector: 'Secteur Centre' },
  
  // Capteurs normaux - Distribution étendue
  { id: 'AQ-N-201', position: [6.3823, 2.3812] as [number, number], status: 'normal' as const, location: 'Avenue Pape Jean-Paul II', sector: 'Secteur Nord' },
  { id: 'AQ-N-202', position: [6.3789, 2.3634] as [number, number], status: 'normal' as const, location: 'Rue Gbèdjromèdé', sector: 'Secteur Nord' },
  { id: 'AQ-N-203', position: [6.3967, 2.3923] as [number, number], status: 'normal' as const, location: 'Carrefour Vèdoko', sector: 'Secteur Nord' },
  { id: 'AQ-N-204', position: [6.3734, 2.3567] as [number, number], status: 'normal' as const, location: 'Quartier Agla', sector: 'Secteur Nord' },
  
  { id: 'AQ-S-205', position: [6.3167, 2.4023] as [number, number], status: 'normal' as const, location: 'Boulevard de la Marina', sector: 'Secteur Sud' },
  { id: 'AQ-S-206', position: [6.3123, 2.4189] as [number, number], status: 'normal' as const, location: 'Quartier Ganhi', sector: 'Secteur Sud' },
  { id: 'AQ-S-207', position: [6.3356, 2.4456] as [number, number], status: 'normal' as const, location: 'Plage de Cotonou', sector: 'Secteur Sud' },
  
  { id: 'AQ-E-208', position: [6.3634, 2.4278] as [number, number], status: 'normal' as const, location: 'Rue Houéyiho', sector: 'Secteur Est' },
  { id: 'AQ-E-209', position: [6.3812, 2.4167] as [number, number], status: 'normal' as const, location: 'Carrefour PK3', sector: 'Secteur Est' },
  { id: 'AQ-E-210', position: [6.3945, 2.4289] as [number, number], status: 'normal' as const, location: 'Quartier Cadjehoun', sector: 'Secteur Est' },
  
  { id: 'AQ-O-211', position: [6.3434, 2.3656] as [number, number], status: 'normal' as const, location: 'Quartier Gbégamey', sector: 'Secteur Ouest' },
  { id: 'AQ-O-212', position: [6.3512, 2.3523] as [number, number], status: 'normal' as const, location: 'Rue Kérékou', sector: 'Secteur Ouest' },
  { id: 'AQ-O-213', position: [6.3389, 2.3789] as [number, number], status: 'normal' as const, location: 'Carrefour Haie Vive', sector: 'Secteur Ouest' },
  
  { id: 'AQ-C-214', position: [6.3556, 2.3889] as [number, number], status: 'normal' as const, location: 'Avenue Delorme', sector: 'Secteur Centre' },
  { id: 'AQ-C-215', position: [6.3698, 2.4012] as [number, number], status: 'normal' as const, location: 'Rue du Gouverneur Bayol', sector: 'Secteur Centre' },
  { id: 'AQ-C-216', position: [6.3645, 2.3845] as [number, number], status: 'normal' as const, location: 'Rond-point Ancien Pont', sector: 'Secteur Centre' },
];

// Connexions du réseau - Structure hiérarchique réaliste
export const networkConnections = [
  // Station centrale vers secteurs principaux
  { from: [6.3578, 2.3956], to: [6.3703, 2.3912], type: 'primary' }, // Centre → Nord
  { from: [6.3578, 2.3956], to: [6.3298, 2.4187], type: 'primary' }, // Centre → Sud  
  { from: [6.3578, 2.3956], to: [6.3754, 2.4356], type: 'primary' }, // Centre → Est
  { from: [6.3578, 2.3956], to: [6.3489, 2.3589], type: 'primary' }, // Centre → Ouest
  
  // Réseau Nord
  { from: [6.3703, 2.3912], to: [6.3823, 2.3812], type: 'secondary' },
  { from: [6.3823, 2.3812], to: [6.3789, 2.3634], type: 'secondary' },
  { from: [6.3789, 2.3634], to: [6.3734, 2.3567], type: 'secondary' },
  { from: [6.3703, 2.3912], to: [6.3856, 2.3745], type: 'secondary' },
  { from: [6.3856, 2.3745], to: [6.3967, 2.3923], type: 'secondary' },
  
  // Réseau Sud
  { from: [6.3298, 2.4187], to: [6.3167, 2.4023], type: 'secondary' },
  { from: [6.3167, 2.4023], to: [6.3123, 2.4189], type: 'secondary' },
  { from: [6.3298, 2.4187], to: [6.3245, 2.4298], type: 'secondary' },
  { from: [6.3245, 2.4298], to: [6.3356, 2.4456], type: 'secondary' },
  
  // Réseau Est
  { from: [6.3754, 2.4356], to: [6.3634, 2.4278], type: 'secondary' },
  { from: [6.3634, 2.4278], to: [6.3812, 2.4167], type: 'secondary' },
  { from: [6.3812, 2.4167], to: [6.3898, 2.4434], type: 'secondary' },
  { from: [6.3898, 2.4434], to: [6.3945, 2.4289], type: 'secondary' },
  
  // Réseau Ouest
  { from: [6.3489, 2.3589], to: [6.3434, 2.3656], type: 'secondary' },
  { from: [6.3434, 2.3656], to: [6.3512, 2.3523], type: 'secondary' },
  { from: [6.3489, 2.3589], to: [6.3389, 2.3789], type: 'secondary' },
  
  // Réseau Centre
  { from: [6.3578, 2.3956], to: [6.3556, 2.3889], type: 'secondary' },
  { from: [6.3556, 2.3889], to: [6.3698, 2.4012], type: 'secondary' },
  { from: [6.3698, 2.4012], to: [6.3645, 2.3845], type: 'secondary' },
  { from: [6.3612, 2.3998], to: [6.3645, 2.3845], type: 'secondary' },
  
  // Interconnexions entre secteurs
  { from: [6.3823, 2.3812], to: [6.3645, 2.3845], type: 'tertiary' }, // Nord-Centre
  { from: [6.3167, 2.4023], to: [6.3434, 2.3656], type: 'tertiary' }, // Sud-Ouest
  { from: [6.3634, 2.4278], to: [6.3245, 2.4298], type: 'tertiary' }, // Est-Sud
];