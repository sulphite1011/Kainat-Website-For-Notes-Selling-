import { NoteItem } from '../types';

export const initialNotesCatalog: NoteItem[] = [
  // --- MATRIC 9TH GRADE ---
  {
    id: 'mat9-phy-ch2',
    title: 'Kinematics & Equations of Motion (Topper Handwritten Notes)',
    classLevel: 'Matric-9th',
    subject: 'Physics',
    chapterNumber: 2,
    chapterTitle: 'Kinematics',
    description: 'Comprehensive handwritten & typed topper notes covering speed, velocity, acceleration, scalar vs vector, graphs of motion, and step-by-step graphical derivations of the 3 Equations of Motion with solved board numericals.',
    totalPages: 24,
    pricePKR: 199,
    rating: 4.9,
    reviewsCount: 142,
    topicsCovered: [
      'Scalars and Vectors with standard representations',
      'Distance, Displacement, Speed, Velocity & Uniform Acceleration',
      'Distance-Time and Speed-Time Graphs with area calculations',
      'Graphical Derivations of Equations of Motion (v = u + at, s = ut + 0.5at², 2as = v² - u²)',
      'Motion under Gravity (Free Fall)',
      '10 Past Paper Board Solved Numericals & Conceptual Qs'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/matric_notes_cover_1790249191068.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Fundamental Kinematic Quantities',
        section: 'Section 2.1: Types of Motion & Scalars vs Vectors',
        keyPoints: [
          'Translatory Motion: Linear, circular, and random motions where every particle moves uniformly.',
          'Scalar Quantities: Specified by magnitude only with appropriate unit (Mass, Time, Speed, Work).',
          'Vector Quantities: Specified completely by magnitude, direction, and unit (Displacement, Velocity, Force).'
        ],
        formulas: ['Speed: v = s / t', 'Velocity: v = d / t', 'Acceleration: a = (v_f - v_i) / t'],
        boardQuestions: [
          'Differentiate between distance and displacement with diagrammatic examples. (Lahore Board 2022, 2024)',
          'Prove that area under a speed-time graph represents distance traveled.'
        ],
        contentHtml: `<p><strong>1. Introduction to Motion:</strong> Motion is a relative state. An object is in motion if it changes its position with respect to its surroundings. If an observer on a moving train looks at a co-passenger, they appear at rest; to an observer on the platform, both are in motion.</p>
        <p><strong>2. Displacement Vector:</strong> Displacement is the shortest straight-line distance between the initial position and the final position of a moving body. Unlike distance, which is scalar, displacement is a vector directed from initial to final point.</p>`
      },
      {
        pageNumber: 2,
        title: 'Speed-Time Graphs & Acceleration Analysis',
        section: 'Section 2.2: Graphical Analysis of Motion',
        keyPoints: [
          'Slope of Distance-Time Graph = Speed of the object.',
          'Slope of Speed-Time Graph = Uniform Acceleration.',
          'Total Area under Speed-Time Graph = Total distance traveled by the body.'
        ],
        formulas: ['Slope = Rise / Run = (v2 - v1) / (t2 - t1) = a'],
        boardQuestions: [
          'Sketch speed-time graph for a car accelerating uniformly, moving at constant speed, and decelerating to stop.'
        ],
        contentHtml: `<p><strong>Graphical Representation:</strong> When an object moves with uniform acceleration, the speed-time graph is a straight inclined line. The gradient represents acceleration:</p>
        <p><em>Gradient = BC / AC = (v_f - v_i) / t = a</em></p>
        <p>When the slope is negative, it indicates uniform deceleration or retardation.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Fundamental Kinematic Quantities',
        section: 'Section 2.1: Types of Motion & Scalars vs Vectors',
        keyPoints: [
          'Translatory Motion: Linear, circular, and random motions where every particle moves uniformly.',
          'Scalar Quantities: Specified by magnitude only with appropriate unit (Mass, Time, Speed, Work).',
          'Vector Quantities: Specified completely by magnitude, direction, and unit (Displacement, Velocity, Force).'
        ],
        formulas: ['Speed: v = s / t', 'Velocity: v = d / t', 'Acceleration: a = (v_f - v_i) / t'],
        boardQuestions: ['Differentiate between distance and displacement with diagrammatic examples.'],
        contentHtml: `<p><strong>1. Introduction to Motion:</strong> Motion is a relative state. An object is in motion if it changes its position with respect to its surroundings.</p>`
      },
      {
        pageNumber: 2,
        title: 'Speed-Time Graphs & Acceleration Analysis',
        section: 'Section 2.2: Graphical Analysis of Motion',
        keyPoints: ['Slope of Speed-Time Graph = Uniform Acceleration.'],
        formulas: ['Slope = Rise / Run = (v2 - v1) / (t2 - t1) = a'],
        boardQuestions: ['Sketch speed-time graph for a car accelerating uniformly.'],
        contentHtml: `<p><strong>Graphical Representation:</strong> Area under speed-time curve gives the distance traveled.</p>`
      },
      {
        pageNumber: 3,
        title: 'Graphical Derivation of 1st & 2nd Equations of Motion',
        section: 'Section 2.3: Mathematical Derivations',
        keyPoints: [
          'First Equation: v_f = v_i + at',
          'Second Equation: s = v_i * t + 0.5 * a * t^2',
          'Geometric breakdown: Total area = Area of rectangle OACD + Area of triangle ABC'
        ],
        formulas: ['v_f = v_i + a*t', 's = v_i*t + (1/2)*a*t^2'],
        boardQuestions: ['Derive second equation of motion graphically with neat labeled sketch. (Guaranteed 5 marks)'],
        contentHtml: `<p><strong>Derivation of 1st Equation:</strong> Slope of speed-time line AB = a = BC / AC = (v_f - v_i) / t. Hence, v_f - v_i = at => <strong>v_f = v_i + at</strong>.</p>
        <p><strong>Derivation of 2nd Equation:</strong> Distance s = Total Area under line AB = Area(Rectangle OACD) + Area(Triangle ABC). Area(Rect) = OA * OD = v_i * t. Area(Tri) = 0.5 * AC * BC = 0.5 * t * (at) = 0.5 * a * t^2. Adding both gives: <strong>s = v_i t + 0.5 a t^2</strong>.</p>`
      },
      {
        pageNumber: 4,
        title: '3rd Equation of Motion & Free-Fall Gravitation',
        section: 'Section 2.4: Third Equation & Gravitational Motion',
        keyPoints: [
          'Third Equation: 2as = v_f^2 - v_i^2 (Eliminating time variable t).',
          'Trapezium formula for distance: s = [(OA + BD) / 2] * OD.',
          'Gravitational acceleration g = 9.8 m/s^2 (downwards). Replace a with g and s with h.'
        ],
        formulas: ['2*a*s = v_f^2 - v_i^2', 'v_f = v_i + g*t', 'h = v_i*t + 0.5*g*t^2', '2*g*h = v_f^2 - v_i^2'],
        boardQuestions: ['A stone is dropped from a cliff 80m high. Calculate velocity when striking ground.'],
        contentHtml: `<p><strong>Derivation of 3rd Equation:</strong> Distance s = Area of trapezium = [(OA + BD) / 2] * OD. Multiplying both sides by 2a / OD where a = BC/OD: 2as = (OA + BD) * BC = (v_i + v_f)(v_f - v_i) = <strong>v_f^2 - v_i^2</strong>.</p>`
      }
    ]
  },
  {
    id: 'mat9-chem-ch1',
    title: 'Fundamentals of Chemistry (Definitions, Mole Concept & Molar Mass)',
    classLevel: 'Matric-9th',
    subject: 'Chemistry',
    chapterNumber: 1,
    chapterTitle: 'Fundamentals of Chemistry',
    description: 'Detailed concept breakdown of atomic number, mass number, relative atomic mass, molecular and formula mass, mole calculations, and Avogadro number with 15 solved exercises.',
    totalPages: 22,
    pricePKR: 180,
    rating: 4.8,
    reviewsCount: 98,
    topicsCovered: [
      'Branches of Chemistry (Physical, Organic, Inorganic, Nuclear)',
      'Elements, Compounds and Mixtures Comparison Table',
      'Valency and Empirical vs Molecular Formula determination',
      'Avogadro’s Number (6.022 × 10²³) and The Mole Concept',
      'Step-by-step Mole-to-Mass and Mass-to-Particles conversions'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/matric_notes_cover_1790249191068.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Branches & Atomic Foundations',
        section: 'Section 1.1: Core Terminology',
        keyPoints: [
          'Chemistry is the study of matter, its structure, properties, and reactions.',
          'Atomic Number (Z): Number of protons in the nucleus of an atom.',
          'Mass Number (A): Total number of protons and neutrons in the nucleus (A = Z + N).'
        ],
        formulas: ['A = Z + N', 'Relative Atomic Mass = Mass of 1 atom / (1/12th mass of Carbon-12)'],
        boardQuestions: ['Differentiate between Compound and Mixture with 4 distinct points.'],
        contentHtml: `<p><strong>Empirical Formula:</strong> The simplest whole-number ratio of atoms present in a compound (e.g., CH for benzene C6H6, CH2O for glucose C6H12O6).</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Branches & Atomic Foundations',
        section: 'Section 1.1: Core Terminology',
        keyPoints: ['Atomic Number (Z) vs Mass Number (A)', 'Elements, Compounds, and Mixtures'],
        formulas: ['A = Z + N'],
        boardQuestions: ['Differentiate between Compound and Mixture with 4 distinct points.'],
        contentHtml: `<p>Comprehensive foundational breakdown of chemical species, ions, free radicals, and gram molecular weights.</p>`
      },
      {
        pageNumber: 2,
        title: 'The Mole Concept & Avogadro’s Calculations',
        section: 'Section 1.2: Quantitative Calculations',
        keyPoints: [
          '1 Mole = 6.022 x 10^23 entities.',
          'Molar mass in grams contains 1 mole of substance.'
        ],
        formulas: ['Number of moles = Mass in grams / Molar mass', 'Number of particles = Moles * 6.022e23'],
        boardQuestions: ['Calculate the number of molecules present in 9g of pure water H2O.'],
        contentHtml: `<p><strong>Example:</strong> Given mass of water = 9g. Molar mass of H2O = 2(1) + 16 = 18 g/mol. Moles = 9 / 18 = 0.5 mol. Molecules = 0.5 * 6.022 x 10^23 = 3.011 x 10^23 molecules.</p>`
      }
    ]
  },
  {
    id: 'mat10-phy-ch10',
    title: 'Simple Harmonic Motion & Waves (Diagrams & Derivations)',
    classLevel: 'Matric-10th',
    subject: 'Physics',
    chapterNumber: 10,
    chapterTitle: 'Simple Harmonic Motion and Waves',
    description: 'Topper handwritten notes with crystal-clear derivations for mass-spring system, simple pendulum, wave equation v = fλ, ripple tank experiments, and past paper MCQs.',
    totalPages: 28,
    pricePKR: 220,
    rating: 5.0,
    reviewsCount: 167,
    topicsCovered: [
      'Hooke’s Law and Mass attached to Spring (Restoring Force)',
      'Simple Pendulum Motion & Proof of SHM',
      'Characteristics of SHM: Amplitude, Time Period, Frequency',
      'Mechanical vs Electromagnetic Waves & Transverse vs Longitudinal Waves',
      'Derivation of Wave Equation v = f λ',
      'Ripple Tank: Reflection, Refraction, and Diffraction experiments'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/matric_notes_cover_1790249191068.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Simple Harmonic Motion Defined',
        section: 'Section 10.1: Mass-Spring System',
        keyPoints: [
          'SHM occurs when the net force is directly proportional to displacement from mean position and always directed toward mean position.',
          'Hooke’s Law: F = -k x (negative sign indicates restoring force opposes displacement).'
        ],
        formulas: ['F = -k*x', 'a ∝ -x', 'T = 2π √(m/k)'],
        boardQuestions: [
          'Prove that the motion of a mass attached to a spring is Simple Harmonic Motion.'
        ],
        contentHtml: `<p><strong>Proof of SHM for Mass-Spring:</strong> According to Hooke's Law: F = -kx. According to Newton's 2nd Law: F = ma. Equating both: ma = -kx => a = -(k/m)x. Since k and m are constants, <strong>a ∝ -x</strong>. This proves the motion is SHM.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Simple Harmonic Motion Defined',
        section: 'Section 10.1: Mass-Spring System',
        keyPoints: ['Hooke’s Law', 'Restoring force directed to mean position'],
        formulas: ['F = -kx', 'a = -(k/m)x', 'T = 2π √(m/k)'],
        boardQuestions: ['Prove that the motion of a mass attached to a spring is SHM.'],
        contentHtml: `<p>Full derivation and energy transformations at extreme versus mean positions.</p>`
      },
      {
        pageNumber: 2,
        title: 'Simple Pendulum & Wave Equation',
        section: 'Section 10.2: Pendulum & Wave Equation',
        keyPoints: [
          'Simple pendulum time period T = 2π √(l/g). It is independent of mass and amplitude for small angles.',
          'Wave Equation v = fλ relates wave speed, frequency, and wavelength.'
        ],
        formulas: ['T = 2π √(l/g)', 'v = f * λ', 'f = 1 / T'],
        boardQuestions: ['Derive relation v = fλ.', 'Calculate period of 1.0m simple pendulum on surface of Moon.'],
        contentHtml: `<p><strong>Derivation of v = fλ:</strong> Wave speed v = distance / time = d / t. For one complete cycle, distance traveled = λ (wavelength) and time taken = T (time period). Thus v = λ / T = (1/T) * λ. Since f = 1/T, we arrive at: <strong>v = fλ</strong>.</p>`
      }
    ]
  },

  // --- FSC 1ST YEAR (PART 1) ---
  {
    id: 'fsc1-phy-ch2',
    title: 'Vectors and Equilibrium (Analytical & Cross Product Masterclass)',
    classLevel: 'FSc-Part1',
    subject: 'Physics',
    chapterNumber: 2,
    chapterTitle: 'Vectors and Equilibrium',
    description: 'Gold-standard FSc Part-1 notes with resolution of vectors by rectangular components, scalar and vector products, first and second conditions of equilibrium, torque, and coupled forces.',
    totalPages: 32,
    pricePKR: 280,
    rating: 4.9,
    reviewsCount: 215,
    topicsCovered: [
      'Basic Vector Algebra, Unit Vectors (î, ĵ, k̂) and Null Vector',
      'Addition of Vectors by Rectangular Components (Rigorous Derivation)',
      'Dot (Scalar) Product & Physical Interpretations with 5 Properties',
      'Cross (Vector) Product & Right Hand Rule with 5 Properties',
      'Torque (Moment of Force) as Cross Product τ = r × F',
      'First & Second Conditions of Equilibrium with Ladder/Rod Numericals'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/fsc_notes_cover_1790249204208.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Addition of Vectors by Rectangular Components',
        section: 'Section 2.1: Analytical Vector Addition',
        keyPoints: [
          'Resolving two coplanar vectors A and B into Rx = Ax + Bx and Ry = Ay + By.',
          'Magnitude of Resultant: R = √(Rx² + Ry²).',
          'Direction Angle θ determined via reference angle φ = tan⁻¹(|Ry/Rx|) across 4 quadrants.'
        ],
        formulas: ['Rx = Ax + Bx', 'Ry = Ay + By', 'R = √(Rx² + Ry²)', 'θ = tan⁻¹(Ry/Rx)'],
        boardQuestions: [
          'Explain the addition of vectors by rectangular components method with labeled diagram. (Frequent Federal & Punjab Board 5-marker)'
        ],
        contentHtml: `<p><strong>Step-by-Step Analytical Formulation:</strong> Let two vectors <em>A</em> and <em>B</em> make angles θ1 and θ2 with the positive x-axis. Projecting onto axes: OM = Ax, MN = Bx, ON = Rx = Ax + Bx. Similarly for y-projections: Ry = Ay + By. Using Pythagoras theorem on right triangle ORP, Resultant magnitude is <strong>R = √(Rx² + Ry²)</strong>.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Addition of Vectors by Rectangular Components',
        section: 'Section 2.1: Analytical Vector Addition',
        keyPoints: ['Vector resolution', '4-quadrant angle analysis'],
        formulas: ['R = √(Rx² + Ry²)', 'φ = tan⁻¹(|Ry/Rx|)'],
        boardQuestions: ['Analytical Vector Addition step-by-step derivation.'],
        contentHtml: `<p>Full breakdown of 1st quadrant (θ = φ), 2nd quadrant (θ = 180° - φ), 3rd quadrant (θ = 180° + φ), and 4th quadrant (θ = 360° - φ).</p>`
      },
      {
        pageNumber: 2,
        title: 'Dot & Cross Products Comparison',
        section: 'Section 2.2: Vector Multiplications',
        keyPoints: [
          'Dot Product: A · B = AB cos θ (Scalar). Commutative: A · B = B · A.',
          'Cross Product: A × B = AB sin θ n̂ (Vector). Anti-commutative: A × B = -(B × A).'
        ],
        formulas: ['A · B = AxBx + AyBy + AzBz', 'A × B = | î  ĵ  k̂ ; Ax Ay Az ; Bx By Bz |', 'Torque τ = r × F'],
        boardQuestions: ['Show that scalar product of two perpendicular vectors is zero.'],
        contentHtml: `<p><strong>Properties of Vector Product:</strong> (1) A × B = -B × A. (2) For parallel vectors (θ = 0° or 180°), A × B = 0. Hence î × î = ĵ × ĵ = k̂ × k̂ = 0. (3) î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ.</p>`
      },
      {
        pageNumber: 3,
        title: 'Conditions of Equilibrium & Torque Analysis',
        section: 'Section 2.3: Static Equilibrium',
        keyPoints: [
          '1st Condition: Translational Equilibrium ΣF = 0 (ΣFx = 0, ΣFy = 0).',
          '2nd Condition: Rotational Equilibrium Στ = 0 (Clockwise torque = Counterclockwise torque).'
        ],
        formulas: ['ΣF = 0', 'Στ = 0', 'τ = r F sin θ = (Moment arm) * Force'],
        boardQuestions: ['A uniform 10m ladder weighing 400N rests against smooth wall. Find reaction forces.'],
        contentHtml: `<p>Standard solved numerical models for uniform beams, cranes, and ladders with complete free-body diagrams.</p>`
      }
    ]
  },
  {
    id: 'fsc1-chem-ch3',
    title: 'Gases & Kinetic Molecular Theory (Gas Laws, Van der Waals & Real Gases)',
    classLevel: 'FSc-Part1',
    subject: 'Chemistry',
    chapterNumber: 3,
    chapterTitle: 'Gases',
    description: 'Detailed FSc Chemistry notes: Boyle’s Law, Charles’s Law, Avogadro’s Law, Ideal Gas Equation (PV = nRT), Dalton’s Law of Partial Pressures, Graham’s Law, and Van der Waals Equation.',
    totalPages: 30,
    pricePKR: 260,
    rating: 4.8,
    reviewsCount: 139,
    topicsCovered: [
      'States of Matter & Gas Laws experimental setups',
      'Derivation of Ideal Gas Equation & Values of R in different units',
      'Dalton’s Law of Partial Pressures & Application to deep sea diving',
      'Graham’s Law of Diffusion and Effusion',
      'Kinetic Molecular Theory of Gases (8 Postulates)',
      'Causes of Deviation of Real Gases & Van der Waals Equation'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/fsc_notes_cover_1790249204208.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'The Ideal Gas Equation & Constant R',
        section: 'Section 3.1: Gas Laws Unified',
        keyPoints: [
          'Combining Boyle (V ∝ 1/P), Charles (V ∝ T), and Avogadro (V ∝ n) yields V ∝ nT/P.',
          'Ideal Gas Equation: PV = nRT.',
          'Value of R in dm³ atm K⁻¹ mol⁻¹ is 0.0821; in SI units (J K⁻¹ mol⁻¹) is 8.314.'
        ],
        formulas: ['PV = nRT', 'PM = dRT (Density relation)', 'P_total = P1 + P2 + P3 ...'],
        boardQuestions: ['Calculate the value of R in SI units and dm³·atm·K⁻¹·mol⁻¹ with dimensional verification.'],
        contentHtml: `<p><strong>Derivation of Gas Density Formula:</strong> From PV = nRT, since n = mass (m) / molar mass (M): PV = (m/M)RT => P*M = (m/V)RT. As m/V = density (d), we get <strong>PM = dRT</strong> or <strong>d = PM / RT</strong>.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'The Ideal Gas Equation & Constant R',
        section: 'Section 3.1: Gas Laws Unified',
        keyPoints: ['Boyle, Charles, Avogadro Laws combined', 'Ideal gas equation derivations'],
        formulas: ['PV = nRT', 'd = PM / RT'],
        boardQuestions: ['Calculate value of R in multiple units.'],
        contentHtml: `<p>Comprehensive proof and applications to industrial gas mixtures and pressure vessels.</p>`
      },
      {
        pageNumber: 2,
        title: 'Van der Waals Equation for Non-Ideal Real Gases',
        section: 'Section 3.2: Real Gas Deviations',
        keyPoints: [
          'Two faulty postulates of KMT: (1) Gas molecules possess zero actual volume; (2) No attractive forces exist.',
          'Volume correction: V_free = (V - nb).',
          'Pressure correction: P_ideal = P_observed + (n²a / V²).'
        ],
        formulas: ['[P + (n²a / V²)] * (V - nb) = nRT'],
        boardQuestions: ['Explain the causes of deviation of real gases from ideality at high pressure and low temperature.'],
        contentHtml: `<p>Van der Waals constants 'a' measures intermolecular attraction, while 'b' represents the effective co-volume (4 times actual molecular volume).</p>`
      }
    ]
  },

  // --- FSC 2ND YEAR (PART 2) ---
  {
    id: 'fsc2-phy-ch12',
    title: 'Electrostatics & Gauss’s Law Master Derivations',
    classLevel: 'FSc-Part2',
    subject: 'Physics',
    chapterNumber: 12,
    chapterTitle: 'Electrostatics',
    description: 'Premier 2nd year Physics notes for board exam toppers: Coulomb’s Law with dielectric effect, Electric field & lines, Gauss’s Law & its 3 applications, Electric potential, Millikan’s experiment, and Capacitors with dielectric charging.',
    totalPages: 36,
    pricePKR: 320,
    rating: 5.0,
    reviewsCount: 310,
    topicsCovered: [
      'Coulomb’s Law in Vector Form & Relative Permittivity (εr)',
      'Electric Field Intensity (E) & Electric Flux (Φ = E · A)',
      'Gauss’s Law Definition & Proof for Enclosed Charge',
      'Gauss Application 1: Infinite Sheet of Charge (E = σ / 2ε0)',
      'Gauss Application 2: Two Oppositely Charged Parallel Plates (E = σ / ε0)',
      'Millikan’s Oil Drop Experiment for Measurement of Charge on Electron',
      'Capacitors in Series and Parallel & Energy Stored (U = 0.5 C V²)'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/fsc_notes_cover_1790249204208.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Coulomb’s Law & Vector Formulation',
        section: 'Section 12.1: Electrostatic Force',
        keyPoints: [
          'Electrostatic force is proportional to product of charges and inversely proportional to square of distance.',
          'Constant k = 1 / (4πε0) ≈ 9 × 10⁹ N m² C⁻².',
          'In the presence of dielectric medium, force decreases by factor εr: F_med = F_vac / εr.'
        ],
        formulas: ['F = (1 / 4πε) * (q1*q2 / r²)', 'F_med = F_vac / εr', 'E = F / q0'],
        boardQuestions: [
          'State Coulomb’s Law. Write its vector form and prove that Newton’s third law holds in electrostatics.'
        ],
        contentHtml: `<p><strong>Vector Formulation:</strong> Force exerted by q1 on q2 is F21 = (k q1 q2 / r²) r̂21. Similarly, F12 = (k q1 q2 / r²) r̂12. Since unit vectors are anti-parallel (r̂21 = -r̂12), we have <strong>F21 = -F12</strong>, confirming Newton’s Third Law.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Coulomb’s Law & Vector Formulation',
        section: 'Section 12.1: Electrostatic Force',
        keyPoints: ['Vector form', 'Dielectric constant εr'],
        formulas: ['F21 = -F12', 'F_med = F_vac / εr'],
        boardQuestions: ['Prove that electrostatics obeys Newton’s third law.'],
        contentHtml: `<p>Detailed vector analysis, superposition principle, and continuous charge distributions.</p>`
      },
      {
        pageNumber: 2,
        title: 'Gauss’s Law & Infinite Sheet Application',
        section: 'Section 12.2: Electric Flux & Applications',
        keyPoints: [
          'Electric flux through any closed surface is 1/ε0 times total charge enclosed: Φ = Q / ε0.',
          'Application to infinite sheet of charge: Cylindrical Gaussian surface of cross-sectional area A.',
          'Resulting electric intensity: E = σ / (2ε0).'
        ],
        formulas: ['Φ = ∮ E · dA = Q / ε0', 'E = σ / (2ε0)', 'E = σ / ε0 (Parallel plates)'],
        boardQuestions: ['State Gauss’s Law. Apply it to find electric intensity due to an infinite plane sheet of charge.'],
        contentHtml: `<p>Flux through curved surface = 0 (E is parallel to surface). Flux through two flat end caps = 2 * E * A. By Gauss's Law: 2EA = Q / ε0 = (σ * A) / ε0. Solving gives: <strong>E = σ / (2ε0)</strong>.</p>`
      },
      {
        pageNumber: 3,
        title: 'Millikan’s Experiment & Capacitor Energy',
        section: 'Section 12.3: Experimental Electrostatics',
        keyPoints: [
          'Millikan balanced gravitational force with electric force: F_e = F_g => qE = mg.',
          'Calculated charge on electron e = 1.602 × 10⁻¹⁹ C.',
          'Energy stored in capacitor: U = 0.5 C V² = 0.5 ε0 εr E² (Ad).'
        ],
        formulas: ['q = (m * g * d) / V', 'C = ε0 * εr * A / d', 'Energy Density = 0.5 * ε0 * εr * E²'],
        boardQuestions: ['Describe Millikan’s oil drop method for determining electronic charge with neat diagram.'],
        contentHtml: `<p>Complete step-by-step description with Stokes’s law viscosity correction, terminal velocity derivation, and charge quantization.</p>`
      }
    ]
  },
  {
    id: 'fsc2-math-ch2',
    title: 'Differentiation & Calculus Rules (Derivatives from First Principles)',
    classLevel: 'FSc-Part2',
    subject: 'Mathematics',
    chapterNumber: 2,
    chapterTitle: 'Differentiation',
    description: 'Complete FSc Part-2 Mathematics Chapter 2 notes: Definition of derivative, First Principles (ab-initio), Power rule, Product rule, Quotient rule, Chain rule, Derivatives of Trigonometric, Inverse Trig, Exponential & Logarithmic functions, and Maxima/Minima optimization.',
    totalPages: 40,
    pricePKR: 350,
    rating: 5.0,
    reviewsCount: 289,
    topicsCovered: [
      'Derivative as instantaneous rate of change & limit definition',
      'Derivations of formulas from First Principle (ab-initio method)',
      'Product Rule, Quotient Rule and General Power Rule proofs',
      'Derivatives of sin x, cos x, tan x, sec x, csc x, cot x',
      'Inverse Trigonometric derivatives (sin⁻¹x, tan⁻¹x, sec⁻¹x)',
      'Implicit Differentiation and Parametric Equations (dy/dx = (dy/dt) / (dx/dt))',
      'Second Derivative Test for Local Maxima and Minima'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/fsc_notes_cover_1790249204208.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Definition of Derivative & First Principles',
        section: 'Section 2.1: The Limit Definition',
        keyPoints: [
          'Derivative f\'(x) = lim_{δx -> 0} [f(x + δx) - f(x)] / δx.',
          'The 4-step ab-initio method: (1) y + δy = f(x + δx); (2) Subtract y; (3) Divide by δx; (4) Take limit as δx -> 0.'
        ],
        formulas: ['dy/dx = lim_{δx -> 0} (δy / δx)', 'd/dx (x^n) = n * x^(n-1)'],
        boardQuestions: [
          'Differentiate (ax + b)^n from first principles. (Appeared in 8 out of 9 Punjab boards)'
        ],
        contentHtml: `<p><strong>Proof of Power Rule via Binomial Theorem:</strong> Let y = (ax + b)^n. Then y + δy = [a(x + δx) + b]^n = [(ax + b) + a δx]^n. Factor out (ax + b)^n: y + δy = (ax + b)^n [1 + (a δx)/(ax + b)]^n. Expanding by binomial theorem and dividing by δx yields: <strong>dy/dx = n a (ax + b)^(n-1)</strong>.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Definition of Derivative & First Principles',
        section: 'Section 2.1: The Limit Definition',
        keyPoints: ['Ab-initio 4-step method', 'Binomial expansion proof'],
        formulas: ['dy/dx = n a (ax + b)^(n-1)'],
        boardQuestions: ['Differentiate (ax + b)^n from first principles.'],
        contentHtml: `<p>Full rigorous proofs for algebraic, root, and reciprocal power functions.</p>`
      },
      {
        pageNumber: 2,
        title: 'Trigonometric & Exponential Derivatives',
        section: 'Section 2.2: Transcendental Functions',
        keyPoints: [
          'd/dx (sin x) = cos x, d/dx (cos x) = -sin x, d/dx (tan x) = sec²x.',
          'd/dx (e^x) = e^x, d/dx (a^x) = a^x ln a.',
          'd/dx (ln x) = 1/x.'
        ],
        formulas: ['d/dx [sin⁻¹(x/a)] = 1 / √(a² - x²)', 'd/dx [tan⁻¹(x/a)] = a / (a² + x²)'],
        boardQuestions: ['Differentiate y = (ln x)^x with respect to x using logarithmic differentiation.'],
        contentHtml: `<p>Complete derivations using trigonometric identity sin A - sin B = 2 cos((A+B)/2) sin((A-B)/2) and squeeze theorem limit sin θ / θ -> 1.</p>`
      },
      {
        pageNumber: 3,
        title: 'Optimization & Maxima / Minima Theorem',
        section: 'Section 2.3: Second Derivative Applications',
        keyPoints: [
          'Critical points: Set f\'(x) = 0.',
          'Second derivative test: If f\'\'(c) < 0, local MAXIMUM at x = c. If f\'\'(c) > 0, local MINIMUM at x = c.'
        ],
        formulas: ['f\'(c) = 0 (Stationary point)', 'f\'\'(c) < 0 => Maxima', 'f\'\'(c) > 0 => Minima'],
        boardQuestions: ['Find dimensions of a rectangular field of maximum area enclosed by 600m fencing.'],
        contentHtml: `<p>Solved past board word problems with geometric constraints, box volumes, and profit optimization models.</p>`
      }
    ]
  },

  // --- BSC / BS HIGHER SCIENCES ---
  {
    id: 'bsc-math-calc3',
    title: 'Advanced Calculus & Analytical Geometry (Multivariable & Vectors)',
    classLevel: 'BSc-Year1',
    subject: 'Mathematics',
    chapterNumber: 1,
    chapterTitle: 'Multivariable Calculus and Vector Analysis',
    description: 'University-level BSc source notes: Partial derivatives, Euler’s theorem on homogeneous functions, Tangent planes, Gradient, Divergence, Curl, and Green’s / Stokes’s / Divergence Theorems with proof demonstrations.',
    totalPages: 48,
    pricePKR: 450,
    rating: 4.9,
    reviewsCount: 182,
    topicsCovered: [
      'Functions of Several Variables, Limits and Continuity in R²',
      'Partial Differentiation & Clairaut’s Theorem (f_xy = f_yx)',
      'Euler’s Theorem for Homogeneous Functions of Degree n',
      'Directional Derivatives & Gradient Vector Operator (∇)',
      'Divergence and Curl of Vector Fields with physical interpretations',
      'Line Integrals, Conservative Vector Fields and Potential Functions',
      'Green’s Theorem in the Plane & Stokes’s Theorem proofs'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/bsc_notes_cover_1790249216045.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Euler’s Theorem on Homogeneous Functions',
        section: 'Section 1.1: Homogeneous Functions & PDE',
        keyPoints: [
          'A function f(x, y) is homogeneous of degree n if f(tx, ty) = t^n f(x, y).',
          'Euler’s Statement: x (∂f/∂x) + y (∂f/∂y) = n f(x, y).',
          'Second order extension: x² (∂²f/∂x²) + 2xy (∂²f/∂x∂y) + y² (∂²f/∂y²) = n(n-1) f(x, y).'
        ],
        formulas: ['x ∂u/∂x + y ∂u/∂y = n u', 'x² ∂²u/∂x² + 2xy ∂²u/∂x∂y + y² ∂²u/∂y² = n(n-1)u'],
        boardQuestions: [
          'If u = sin⁻¹[(x² + y²) / (x + y)], prove that x ∂u/∂x + y ∂u/∂y = tan u. (Punjab Univ & Karachi Univ Annual Exam favorite)'
        ],
        contentHtml: `<p><strong>Proof Strategy for u = sin⁻¹(z):</strong> Let z = sin u = (x² + y²)/(x + y). Since z is homogeneous of degree 1 (numerator degree 2, denominator degree 1), by Euler's Theorem: x ∂z/∂x + y ∂z/∂y = 1 * z. Now ∂z/∂x = cos u (∂u/∂x). Substituting: x cos u ∂u/∂x + y cos u ∂u/∂y = sin u. Dividing through by cos u yields: <strong>x ∂u/∂x + y ∂u/∂y = tan u</strong>.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Euler’s Theorem on Homogeneous Functions',
        section: 'Section 1.1: Homogeneous Functions & PDE',
        keyPoints: ['Homogeneity test', 'Euler’s 1st and 2nd theorems'],
        formulas: ['x ∂u/∂x + y ∂u/∂y = n u'],
        boardQuestions: ['u = sin⁻¹[(x²+y²)/(x+y)] proof of tan u.'],
        contentHtml: `<p>Full formal proofs and 12 university solved examination problems.</p>`
      },
      {
        pageNumber: 2,
        title: 'Vector Differential Calculus: Gradient, Divergence & Curl',
        section: 'Section 1.2: Del Operator Operations',
        keyPoints: [
          'Gradient: ∇φ = (∂φ/∂x)î + (∂φ/∂y)ĵ + (∂φ/∂z)k̂ (Points in direction of maximum increase).',
          'Divergence: ∇ · V = ∂V1/∂x + ∂V2/∂y + ∂V3/∂z (Solenoidal field if ∇ · V = 0).',
          'Curl: ∇ × V (Irrotational field if ∇ × V = 0 => V = ∇φ).'
        ],
        formulas: ['∇ · (∇ × V) = 0 (Div of Curl is zero)', '∇ × (∇φ) = 0 (Curl of Grad is zero)'],
        boardQuestions: ['Show that vector field V = (2xy + z³)î + x²ĵ + 3xz²k̂ is irrotational and find its scalar potential.'],
        contentHtml: `<p>Detailed evaluation of line integrals along closed contours, conservative fields, and work done calculations.</p>`
      },
      {
        pageNumber: 3,
        title: 'Stokes’s Theorem & Divergence Theorem',
        section: 'Section 1.3: Integral Theorems of Vector Analysis',
        keyPoints: [
          'Stokes’s Theorem: ∮_C F · dr = ∬_S (∇ × F) · n̂ dS.',
          'Gauss’s Divergence Theorem: ∬_S F · n̂ dS = ∭_V (∇ · F) dV.'
        ],
        formulas: ['∮ F · dr = ∬ (curl F) · dS', '∬ F · dS = ∭ (div F) dV'],
        boardQuestions: ['Verify Stokes’s Theorem for F = yî + zj + xk around the boundary of triangle x+y+z=1.'],
        contentHtml: `<p>Complete analytical and geometrical verification across hemispheres, cylinders, and polyhedra.</p>`
      }
    ]
  },
  {
    id: 'bsc-phy-mech',
    title: 'Mechanics & Special Theory of Relativity',
    classLevel: 'BSc-Year1',
    subject: 'Physics',
    chapterNumber: 2,
    chapterTitle: 'Relativistic Mechanics and Rotational Dynamics',
    description: 'Advanced university physics notes: Michelson-Morley experiment, Postulates of Special Relativity, Lorentz Transformations, Length Contraction, Time Dilation, Relativistic Mass & E = mc², and Rigid Body Moments of Inertia.',
    totalPages: 52,
    pricePKR: 420,
    rating: 4.9,
    reviewsCount: 154,
    topicsCovered: [
      'Inertial vs Non-Inertial frames & Galilean Transformations breakdown',
      'Michelson-Morley Experiment null result and ether hypothesis failure',
      'Einstein’s Postulates of Special Relativity',
      'Derivation of Lorentz Transformation equations for space-time coordinates',
      'Time Dilation (t = γ t0) and Muon decay experimental validation',
      'Lorentz-FitzGerald Length Contraction (L = L0 / γ)',
      'Relativistic Mass variation & Proof of Mass-Energy Equivalence E = mc²'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/bsc_notes_cover_1790249216045.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Postulates & Lorentz Transformation Matrix',
        section: 'Section 2.1: Foundations of Relativity',
        keyPoints: [
          'Postulate 1 (Principle of Relativity): The laws of physics are identical in all inertial frames.',
          'Postulate 2 (Constancy of Speed of Light): The speed of light in vacuum c = 3 × 10⁸ m/s is independent of the motion of the source or observer.',
          'Lorentz Factor: γ = 1 / √(1 - v²/c²).'
        ],
        formulas: ['x\' = γ (x - vt)', 'y\' = y', 'z\' = z', 't\' = γ (t - vx/c²)', 'γ = 1 / √(1 - v²/c²)'],
        boardQuestions: [
          'Derive Lorentz coordinate and time transformation equations between two inertial frames in relative motion along x-axis.'
        ],
        contentHtml: `<p><strong>Derivation Overview:</strong> For a spherical light wavefront expanding in frame S: x² + y² + z² - c²t² = 0. In frame S\': x\'² + y\'² + z\'² - c²t\'² = 0. Using linear transformations x\' = k(x - vt) and assuming symmetry in y and z, imposing invariance of light speed c leads directly to <strong>k = γ = 1 / √(1 - v²/c²)</strong>.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Postulates & Lorentz Transformation Matrix',
        section: 'Section 2.1: Foundations of Relativity',
        keyPoints: ['Einstein’s two postulates', 'Lorentz factor γ derivation'],
        formulas: ['x\' = γ(x - vt)', 't\' = γ(t - vx/c²)'],
        boardQuestions: ['Derive Lorentz Transformations.'],
        contentHtml: `<p>Complete step-by-step space-time interval invariance proof.</p>`
      },
      {
        pageNumber: 2,
        title: 'Time Dilation & Length Contraction',
        section: 'Section 2.2: Kinematic Consequences of Relativity',
        keyPoints: [
          'Time Dilation: Moving clocks run slow: Δt = γ Δt0 (where Δt0 is proper time).',
          'Length Contraction: An object moves past at velocity v appears contracted along direction of motion: L = L0 √(1 - v²/c²).'
        ],
        formulas: ['Δt = Δt0 / √(1 - v²/c²)', 'L = L0 * √(1 - v²/c²)'],
        boardQuestions: ['A spacecraft moves at speed 0.8c. To an observer on Earth, its journey takes 10 hours. How much time elapsed on board?'],
        contentHtml: `<p>Light clock thought experiment and calculations for atmospheric muon longevity.</p>`
      },
      {
        pageNumber: 3,
        title: 'Relativistic Dynamics: Derivation of E = mc²',
        section: 'Section 2.3: Relativistic Energy and Momentum',
        keyPoints: [
          'Relativistic Mass: m = m0 / √(1 - v²/c²).',
          'Work-Energy Theorem in relativistic regime: W = ∫ F dx = ∫ (dp/dt) dx = (m - m0) c².',
          'Total Energy: E = mc² = m0 c² + K.E.',
          'Energy-Momentum Relation: E² = p²c² + m0²c⁴.'
        ],
        formulas: ['E = m c²', 'K = (m - m0)c²', 'E² = p²c² + m0²c⁴'],
        boardQuestions: ['Derive Einstein’s mass-energy equation E = mc² using relativistic momentum definition.'],
        contentHtml: `<p>Integration of dK = v dp where p = γ m0 v yields K = γ m0 c² - m0 c² = mc² - m0 c². Adding rest energy E0 = m0 c² yields <strong>E = mc²</strong>.</p>`
      }
    ]
  },
  {
    id: 'bundle-fsc2-complete',
    title: 'FSc Part 2 Complete Master Science Bundle (All Subjects)',
    classLevel: 'FSc-Part2',
    subject: 'Physics',
    chapterNumber: 0,
    chapterTitle: 'Complete Board Examination Master Bundle',
    description: 'Comprehensive bundle including all chapters of FSc Part 2 Physics, Chemistry, and Mathematics (or Biology). Includes full chapter notes, solved 10-year past papers, and formula quick sheets.',
    totalPages: 380,
    pricePKR: 1199,
    isBundle: true,
    bundleNoteIds: ['fsc2-phy-ch12', 'fsc2-math-ch2'],
    rating: 5.0,
    reviewsCount: 420,
    topicsCovered: [
      'Physics: Electrostatics, Current Electricity, Electromagnetism, Modern Physics (Chapters 12-21)',
      'Chemistry: Periodic Trends, Organic Reaction Mechanisms, Macromolecules (Chapters 1-16)',
      'Math: Functions & Limits, Differentiation, Integration, Conic Sections (Chapters 1-7)',
      'Solved numericals and long questions for all 9 Educational Boards of Pakistan'
    ],
    googleDriveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    googleDriveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    coverImage: '/images/fsc_notes_cover_1790249204208.jpg',
    previewPages: [
      {
        pageNumber: 1,
        title: 'Master Bundle Index & Board Syllabus Blueprint',
        section: 'Bundle Overview',
        keyPoints: [
          'Full coverage of all 21 Punjab & Federal Textbook Board Units.',
          'Highlighted 5-star questions marked by 20+ year senior examiners.'
        ],
        boardQuestions: ['Covers all previous board exam questions from 2014 to 2024.'],
        contentHtml: `<p>Welcome to the FSc Part-2 Complete Master Bundle. This comprehensive compilation grants permanent digital access to every unit of 2nd year Physics, Chemistry, and Mathematics/Biology with our high-security reader.</p>`
      }
    ],
    fullContentPages: [
      {
        pageNumber: 1,
        title: 'Master Bundle Index & Board Syllabus Blueprint',
        section: 'Bundle Overview',
        keyPoints: ['Comprehensive syllabus mapping across all board papers'],
        contentHtml: `<p>Complete master access to all bundled files.</p>`
      }
    ]
  }
];
