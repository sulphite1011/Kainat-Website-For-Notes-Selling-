import { NoteItem, Order, OrderNotificationAlert, SiteSettings } from '../types';

export const seedNotes: NoteItem[] = [
  {
    "id": "note-1790251691494-1kal",
    "title": "Thermodynamics & Heat Engines",
    "classLevel": "BSc-Year2",
    "subject": "Physics",
    "chapterNumber": 4,
    "chapterTitle": "Heat & Thermodynamics",
    "description": "Comprehensive BSc notes by Kainat",
    "totalPages": 20,
    "pricePKR": 250,
    "rating": 5,
    "reviewsCount": 1,
    "topicsCovered": [
      "Carnot Cycle",
      "Entropy",
      "Laws of Thermodynamics"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/demo/preview",
    "coverImage": "",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Heat & Thermodynamics - Unit Overview & Core Concepts",
        "section": "Section 1.1 - Definition & Board Derivations",
        "keyPoints": [
          "Carnot Cycle",
          "Entropy",
          "Laws of Thermodynamics"
        ],
        "formulas": [
          "\\text{Unit: } Heat & Thermodynamics",
          "\\text{Class: } BSc-Year2"
        ],
        "boardQuestions": [
          "Important 5-mark derivation from Unit 4"
        ],
        "contentHtml": "<p><strong>Thermodynamics & Heat Engines</strong></p><p>Curated by Kainat. Includes detailed formulas, derivations, and board examination solutions for BSc-Year2.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Heat & Thermodynamics - Unit Overview & Core Concepts",
        "section": "Section 1.1 - Definition & Board Derivations",
        "keyPoints": [
          "Carnot Cycle",
          "Entropy",
          "Laws of Thermodynamics"
        ],
        "formulas": [
          "\\text{Unit: } Heat & Thermodynamics",
          "\\text{Class: } BSc-Year2"
        ],
        "boardQuestions": [
          "Important 5-mark derivation from Unit 4"
        ],
        "contentHtml": "<p><strong>Thermodynamics & Heat Engines</strong></p><p>Curated by Kainat. Includes detailed formulas, derivations, and board examination solutions for BSc-Year2.</p>"
      }
    ]
  },
  {
    "id": "mat9-phy-ch2",
    "title": "Kinematics & Equations of Motion (Topper Handwritten Notes)",
    "classLevel": "Matric-9th",
    "subject": "Physics",
    "chapterNumber": 2,
    "chapterTitle": "Kinematics",
    "description": "Comprehensive handwritten & typed topper notes covering speed, velocity, acceleration, scalar vs vector, graphs of motion, and step-by-step graphical derivations of the 3 Equations of Motion with solved board numericals.",
    "totalPages": 24,
    "pricePKR": 199,
    "rating": 4.9,
    "reviewsCount": 142,
    "topicsCovered": [
      "Scalars and Vectors with standard representations",
      "Distance, Displacement, Speed, Velocity & Uniform Acceleration",
      "Distance-Time and Speed-Time Graphs with area calculations",
      "Graphical Derivations of Equations of Motion (v = u + at, s = ut + 0.5at², 2as = v² - u²)",
      "Motion under Gravity (Free Fall)",
      "10 Past Paper Board Solved Numericals & Conceptual Qs"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/matric_notes_cover_1790249191068.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Fundamental Kinematic Quantities",
        "section": "Section 2.1: Types of Motion & Scalars vs Vectors",
        "keyPoints": [
          "Translatory Motion: Linear, circular, and random motions where every particle moves uniformly.",
          "Scalar Quantities: Specified by magnitude only with appropriate unit (Mass, Time, Speed, Work).",
          "Vector Quantities: Specified completely by magnitude, direction, and unit (Displacement, Velocity, Force)."
        ],
        "formulas": [
          "Speed: v = s / t",
          "Velocity: v = d / t",
          "Acceleration: a = (v_f - v_i) / t"
        ],
        "boardQuestions": [
          "Differentiate between distance and displacement with diagrammatic examples. (Lahore Board 2022, 2024)",
          "Prove that area under a speed-time graph represents distance traveled."
        ],
        "contentHtml": "<p><strong>1. Introduction to Motion:</strong> Motion is a relative state. An object is in motion if it changes its position with respect to its surroundings. If an observer on a moving train looks at a co-passenger, they appear at rest; to an observer on the platform, both are in motion.</p>\n        <p><strong>2. Displacement Vector:</strong> Displacement is the shortest straight-line distance between the initial position and the final position of a moving body. Unlike distance, which is scalar, displacement is a vector directed from initial to final point.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Speed-Time Graphs & Acceleration Analysis",
        "section": "Section 2.2: Graphical Analysis of Motion",
        "keyPoints": [
          "Slope of Distance-Time Graph = Speed of the object.",
          "Slope of Speed-Time Graph = Uniform Acceleration.",
          "Total Area under Speed-Time Graph = Total distance traveled by the body."
        ],
        "formulas": [
          "Slope = Rise / Run = (v2 - v1) / (t2 - t1) = a"
        ],
        "boardQuestions": [
          "Sketch speed-time graph for a car accelerating uniformly, moving at constant speed, and decelerating to stop."
        ],
        "contentHtml": "<p><strong>Graphical Representation:</strong> When an object moves with uniform acceleration, the speed-time graph is a straight inclined line. The gradient represents acceleration:</p>\n        <p><em>Gradient = BC / AC = (v_f - v_i) / t = a</em></p>\n        <p>When the slope is negative, it indicates uniform deceleration or retardation.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Fundamental Kinematic Quantities",
        "section": "Section 2.1: Types of Motion & Scalars vs Vectors",
        "keyPoints": [
          "Translatory Motion: Linear, circular, and random motions where every particle moves uniformly.",
          "Scalar Quantities: Specified by magnitude only with appropriate unit (Mass, Time, Speed, Work).",
          "Vector Quantities: Specified completely by magnitude, direction, and unit (Displacement, Velocity, Force)."
        ],
        "formulas": [
          "Speed: v = s / t",
          "Velocity: v = d / t",
          "Acceleration: a = (v_f - v_i) / t"
        ],
        "boardQuestions": [
          "Differentiate between distance and displacement with diagrammatic examples."
        ],
        "contentHtml": "<p><strong>1. Introduction to Motion:</strong> Motion is a relative state. An object is in motion if it changes its position with respect to its surroundings.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Speed-Time Graphs & Acceleration Analysis",
        "section": "Section 2.2: Graphical Analysis of Motion",
        "keyPoints": [
          "Slope of Speed-Time Graph = Uniform Acceleration."
        ],
        "formulas": [
          "Slope = Rise / Run = (v2 - v1) / (t2 - t1) = a"
        ],
        "boardQuestions": [
          "Sketch speed-time graph for a car accelerating uniformly."
        ],
        "contentHtml": "<p><strong>Graphical Representation:</strong> Area under speed-time curve gives the distance traveled.</p>"
      },
      {
        "pageNumber": 3,
        "title": "Graphical Derivation of 1st & 2nd Equations of Motion",
        "section": "Section 2.3: Mathematical Derivations",
        "keyPoints": [
          "First Equation: v_f = v_i + at",
          "Second Equation: s = v_i * t + 0.5 * a * t^2",
          "Geometric breakdown: Total area = Area of rectangle OACD + Area of triangle ABC"
        ],
        "formulas": [
          "v_f = v_i + a*t",
          "s = v_i*t + (1/2)*a*t^2"
        ],
        "boardQuestions": [
          "Derive second equation of motion graphically with neat labeled sketch. (Guaranteed 5 marks)"
        ],
        "contentHtml": "<p><strong>Derivation of 1st Equation:</strong> Slope of speed-time line AB = a = BC / AC = (v_f - v_i) / t. Hence, v_f - v_i = at => <strong>v_f = v_i + at</strong>.</p>\n        <p><strong>Derivation of 2nd Equation:</strong> Distance s = Total Area under line AB = Area(Rectangle OACD) + Area(Triangle ABC). Area(Rect) = OA * OD = v_i * t. Area(Tri) = 0.5 * AC * BC = 0.5 * t * (at) = 0.5 * a * t^2. Adding both gives: <strong>s = v_i t + 0.5 a t^2</strong>.</p>"
      },
      {
        "pageNumber": 4,
        "title": "3rd Equation of Motion & Free-Fall Gravitation",
        "section": "Section 2.4: Third Equation & Gravitational Motion",
        "keyPoints": [
          "Third Equation: 2as = v_f^2 - v_i^2 (Eliminating time variable t).",
          "Trapezium formula for distance: s = [(OA + BD) / 2] * OD.",
          "Gravitational acceleration g = 9.8 m/s^2 (downwards). Replace a with g and s with h."
        ],
        "formulas": [
          "2*a*s = v_f^2 - v_i^2",
          "v_f = v_i + g*t",
          "h = v_i*t + 0.5*g*t^2",
          "2*g*h = v_f^2 - v_i^2"
        ],
        "boardQuestions": [
          "A stone is dropped from a cliff 80m high. Calculate velocity when striking ground."
        ],
        "contentHtml": "<p><strong>Derivation of 3rd Equation:</strong> Distance s = Area of trapezium = [(OA + BD) / 2] * OD. Multiplying both sides by 2a / OD where a = BC/OD: 2as = (OA + BD) * BC = (v_i + v_f)(v_f - v_i) = <strong>v_f^2 - v_i^2</strong>.</p>"
      }
    ]
  },
  {
    "id": "mat9-chem-ch1",
    "title": "Fundamentals of Chemistry (Definitions, Mole Concept & Molar Mass)",
    "classLevel": "Matric-9th",
    "subject": "Chemistry",
    "chapterNumber": 1,
    "chapterTitle": "Fundamentals of Chemistry",
    "description": "Detailed concept breakdown of atomic number, mass number, relative atomic mass, molecular and formula mass, mole calculations, and Avogadro number with 15 solved exercises.",
    "totalPages": 22,
    "pricePKR": 180,
    "rating": 4.8,
    "reviewsCount": 98,
    "topicsCovered": [
      "Branches of Chemistry (Physical, Organic, Inorganic, Nuclear)",
      "Elements, Compounds and Mixtures Comparison Table",
      "Valency and Empirical vs Molecular Formula determination",
      "Avogadro’s Number (6.022 × 10²³) and The Mole Concept",
      "Step-by-step Mole-to-Mass and Mass-to-Particles conversions"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/matric_notes_cover_1790249191068.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Branches & Atomic Foundations",
        "section": "Section 1.1: Core Terminology",
        "keyPoints": [
          "Chemistry is the study of matter, its structure, properties, and reactions.",
          "Atomic Number (Z): Number of protons in the nucleus of an atom.",
          "Mass Number (A): Total number of protons and neutrons in the nucleus (A = Z + N)."
        ],
        "formulas": [
          "A = Z + N",
          "Relative Atomic Mass = Mass of 1 atom / (1/12th mass of Carbon-12)"
        ],
        "boardQuestions": [
          "Differentiate between Compound and Mixture with 4 distinct points."
        ],
        "contentHtml": "<p><strong>Empirical Formula:</strong> The simplest whole-number ratio of atoms present in a compound (e.g., CH for benzene C6H6, CH2O for glucose C6H12O6).</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Branches & Atomic Foundations",
        "section": "Section 1.1: Core Terminology",
        "keyPoints": [
          "Atomic Number (Z) vs Mass Number (A)",
          "Elements, Compounds, and Mixtures"
        ],
        "formulas": [
          "A = Z + N"
        ],
        "boardQuestions": [
          "Differentiate between Compound and Mixture with 4 distinct points."
        ],
        "contentHtml": "<p>Comprehensive foundational breakdown of chemical species, ions, free radicals, and gram molecular weights.</p>"
      },
      {
        "pageNumber": 2,
        "title": "The Mole Concept & Avogadro’s Calculations",
        "section": "Section 1.2: Quantitative Calculations",
        "keyPoints": [
          "1 Mole = 6.022 x 10^23 entities.",
          "Molar mass in grams contains 1 mole of substance."
        ],
        "formulas": [
          "Number of moles = Mass in grams / Molar mass",
          "Number of particles = Moles * 6.022e23"
        ],
        "boardQuestions": [
          "Calculate the number of molecules present in 9g of pure water H2O."
        ],
        "contentHtml": "<p><strong>Example:</strong> Given mass of water = 9g. Molar mass of H2O = 2(1) + 16 = 18 g/mol. Moles = 9 / 18 = 0.5 mol. Molecules = 0.5 * 6.022 x 10^23 = 3.011 x 10^23 molecules.</p>"
      }
    ]
  },
  {
    "id": "mat10-phy-ch10",
    "title": "Simple Harmonic Motion & Waves (Diagrams & Derivations)",
    "classLevel": "Matric-10th",
    "subject": "Physics",
    "chapterNumber": 10,
    "chapterTitle": "Simple Harmonic Motion and Waves",
    "description": "Topper handwritten notes with crystal-clear derivations for mass-spring system, simple pendulum, wave equation v = fλ, ripple tank experiments, and past paper MCQs.",
    "totalPages": 28,
    "pricePKR": 220,
    "rating": 5,
    "reviewsCount": 167,
    "topicsCovered": [
      "Hooke’s Law and Mass attached to Spring (Restoring Force)",
      "Simple Pendulum Motion & Proof of SHM",
      "Characteristics of SHM: Amplitude, Time Period, Frequency",
      "Mechanical vs Electromagnetic Waves & Transverse vs Longitudinal Waves",
      "Derivation of Wave Equation v = f λ",
      "Ripple Tank: Reflection, Refraction, and Diffraction experiments"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/matric_notes_cover_1790249191068.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Simple Harmonic Motion Defined",
        "section": "Section 10.1: Mass-Spring System",
        "keyPoints": [
          "SHM occurs when the net force is directly proportional to displacement from mean position and always directed toward mean position.",
          "Hooke’s Law: F = -k x (negative sign indicates restoring force opposes displacement)."
        ],
        "formulas": [
          "F = -k*x",
          "a ∝ -x",
          "T = 2π √(m/k)"
        ],
        "boardQuestions": [
          "Prove that the motion of a mass attached to a spring is Simple Harmonic Motion."
        ],
        "contentHtml": "<p><strong>Proof of SHM for Mass-Spring:</strong> According to Hooke's Law: F = -kx. According to Newton's 2nd Law: F = ma. Equating both: ma = -kx => a = -(k/m)x. Since k and m are constants, <strong>a ∝ -x</strong>. This proves the motion is SHM.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Simple Harmonic Motion Defined",
        "section": "Section 10.1: Mass-Spring System",
        "keyPoints": [
          "Hooke’s Law",
          "Restoring force directed to mean position"
        ],
        "formulas": [
          "F = -kx",
          "a = -(k/m)x",
          "T = 2π √(m/k)"
        ],
        "boardQuestions": [
          "Prove that the motion of a mass attached to a spring is SHM."
        ],
        "contentHtml": "<p>Full derivation and energy transformations at extreme versus mean positions.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Simple Pendulum & Wave Equation",
        "section": "Section 10.2: Pendulum & Wave Equation",
        "keyPoints": [
          "Simple pendulum time period T = 2π √(l/g). It is independent of mass and amplitude for small angles.",
          "Wave Equation v = fλ relates wave speed, frequency, and wavelength."
        ],
        "formulas": [
          "T = 2π √(l/g)",
          "v = f * λ",
          "f = 1 / T"
        ],
        "boardQuestions": [
          "Derive relation v = fλ.",
          "Calculate period of 1.0m simple pendulum on surface of Moon."
        ],
        "contentHtml": "<p><strong>Derivation of v = fλ:</strong> Wave speed v = distance / time = d / t. For one complete cycle, distance traveled = λ (wavelength) and time taken = T (time period). Thus v = λ / T = (1/T) * λ. Since f = 1/T, we arrive at: <strong>v = fλ</strong>.</p>"
      }
    ]
  },
  {
    "id": "fsc1-phy-ch2",
    "title": "Vectors and Equilibrium (Analytical & Cross Product Masterclass)",
    "classLevel": "FSc-Part1",
    "subject": "Physics",
    "chapterNumber": 2,
    "chapterTitle": "Vectors and Equilibrium",
    "description": "Gold-standard FSc Part-1 notes with resolution of vectors by rectangular components, scalar and vector products, first and second conditions of equilibrium, torque, and coupled forces.",
    "totalPages": 32,
    "pricePKR": 280,
    "rating": 4.9,
    "reviewsCount": 215,
    "topicsCovered": [
      "Basic Vector Algebra, Unit Vectors (î, ĵ, k̂) and Null Vector",
      "Addition of Vectors by Rectangular Components (Rigorous Derivation)",
      "Dot (Scalar) Product & Physical Interpretations with 5 Properties",
      "Cross (Vector) Product & Right Hand Rule with 5 Properties",
      "Torque (Moment of Force) as Cross Product τ = r × F",
      "First & Second Conditions of Equilibrium with Ladder/Rod Numericals"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/fsc_notes_cover_1790249204208.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Addition of Vectors by Rectangular Components",
        "section": "Section 2.1: Analytical Vector Addition",
        "keyPoints": [
          "Resolving two coplanar vectors A and B into Rx = Ax + Bx and Ry = Ay + By.",
          "Magnitude of Resultant: R = √(Rx² + Ry²).",
          "Direction Angle θ determined via reference angle φ = tan⁻¹(|Ry/Rx|) across 4 quadrants."
        ],
        "formulas": [
          "Rx = Ax + Bx",
          "Ry = Ay + By",
          "R = √(Rx² + Ry²)",
          "θ = tan⁻¹(Ry/Rx)"
        ],
        "boardQuestions": [
          "Explain the addition of vectors by rectangular components method with labeled diagram. (Frequent Federal & Punjab Board 5-marker)"
        ],
        "contentHtml": "<p><strong>Step-by-Step Analytical Formulation:</strong> Let two vectors <em>A</em> and <em>B</em> make angles θ1 and θ2 with the positive x-axis. Projecting onto axes: OM = Ax, MN = Bx, ON = Rx = Ax + Bx. Similarly for y-projections: Ry = Ay + By. Using Pythagoras theorem on right triangle ORP, Resultant magnitude is <strong>R = √(Rx² + Ry²)</strong>.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Addition of Vectors by Rectangular Components",
        "section": "Section 2.1: Analytical Vector Addition",
        "keyPoints": [
          "Vector resolution",
          "4-quadrant angle analysis"
        ],
        "formulas": [
          "R = √(Rx² + Ry²)",
          "φ = tan⁻¹(|Ry/Rx|)"
        ],
        "boardQuestions": [
          "Analytical Vector Addition step-by-step derivation."
        ],
        "contentHtml": "<p>Full breakdown of 1st quadrant (θ = φ), 2nd quadrant (θ = 180° - φ), 3rd quadrant (θ = 180° + φ), and 4th quadrant (θ = 360° - φ).</p>"
      },
      {
        "pageNumber": 2,
        "title": "Dot & Cross Products Comparison",
        "section": "Section 2.2: Vector Multiplications",
        "keyPoints": [
          "Dot Product: A · B = AB cos θ (Scalar). Commutative: A · B = B · A.",
          "Cross Product: A × B = AB sin θ n̂ (Vector). Anti-commutative: A × B = -(B × A)."
        ],
        "formulas": [
          "A · B = AxBx + AyBy + AzBz",
          "A × B = | î  ĵ  k̂ ; Ax Ay Az ; Bx By Bz |",
          "Torque τ = r × F"
        ],
        "boardQuestions": [
          "Show that scalar product of two perpendicular vectors is zero."
        ],
        "contentHtml": "<p><strong>Properties of Vector Product:</strong> (1) A × B = -B × A. (2) For parallel vectors (θ = 0° or 180°), A × B = 0. Hence î × î = ĵ × ĵ = k̂ × k̂ = 0. (3) î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ.</p>"
      },
      {
        "pageNumber": 3,
        "title": "Conditions of Equilibrium & Torque Analysis",
        "section": "Section 2.3: Static Equilibrium",
        "keyPoints": [
          "1st Condition: Translational Equilibrium ΣF = 0 (ΣFx = 0, ΣFy = 0).",
          "2nd Condition: Rotational Equilibrium Στ = 0 (Clockwise torque = Counterclockwise torque)."
        ],
        "formulas": [
          "ΣF = 0",
          "Στ = 0",
          "τ = r F sin θ = (Moment arm) * Force"
        ],
        "boardQuestions": [
          "A uniform 10m ladder weighing 400N rests against smooth wall. Find reaction forces."
        ],
        "contentHtml": "<p>Standard solved numerical models for uniform beams, cranes, and ladders with complete free-body diagrams.</p>"
      }
    ]
  },
  {
    "id": "fsc1-chem-ch3",
    "title": "Gases & Kinetic Molecular Theory (Gas Laws, Van der Waals & Real Gases)",
    "classLevel": "FSc-Part1",
    "subject": "Chemistry",
    "chapterNumber": 3,
    "chapterTitle": "Gases",
    "description": "Detailed FSc Chemistry notes: Boyle’s Law, Charles’s Law, Avogadro’s Law, Ideal Gas Equation (PV = nRT), Dalton’s Law of Partial Pressures, Graham’s Law, and Van der Waals Equation.",
    "totalPages": 30,
    "pricePKR": 260,
    "rating": 4.8,
    "reviewsCount": 139,
    "topicsCovered": [
      "States of Matter & Gas Laws experimental setups",
      "Derivation of Ideal Gas Equation & Values of R in different units",
      "Dalton’s Law of Partial Pressures & Application to deep sea diving",
      "Graham’s Law of Diffusion and Effusion",
      "Kinetic Molecular Theory of Gases (8 Postulates)",
      "Causes of Deviation of Real Gases & Van der Waals Equation"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/fsc_notes_cover_1790249204208.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "The Ideal Gas Equation & Constant R",
        "section": "Section 3.1: Gas Laws Unified",
        "keyPoints": [
          "Combining Boyle (V ∝ 1/P), Charles (V ∝ T), and Avogadro (V ∝ n) yields V ∝ nT/P.",
          "Ideal Gas Equation: PV = nRT.",
          "Value of R in dm³ atm K⁻¹ mol⁻¹ is 0.0821; in SI units (J K⁻¹ mol⁻¹) is 8.314."
        ],
        "formulas": [
          "PV = nRT",
          "PM = dRT (Density relation)",
          "P_total = P1 + P2 + P3 ..."
        ],
        "boardQuestions": [
          "Calculate the value of R in SI units and dm³·atm·K⁻¹·mol⁻¹ with dimensional verification."
        ],
        "contentHtml": "<p><strong>Derivation of Gas Density Formula:</strong> From PV = nRT, since n = mass (m) / molar mass (M): PV = (m/M)RT => P*M = (m/V)RT. As m/V = density (d), we get <strong>PM = dRT</strong> or <strong>d = PM / RT</strong>.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "The Ideal Gas Equation & Constant R",
        "section": "Section 3.1: Gas Laws Unified",
        "keyPoints": [
          "Boyle, Charles, Avogadro Laws combined",
          "Ideal gas equation derivations"
        ],
        "formulas": [
          "PV = nRT",
          "d = PM / RT"
        ],
        "boardQuestions": [
          "Calculate value of R in multiple units."
        ],
        "contentHtml": "<p>Comprehensive proof and applications to industrial gas mixtures and pressure vessels.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Van der Waals Equation for Non-Ideal Real Gases",
        "section": "Section 3.2: Real Gas Deviations",
        "keyPoints": [
          "Two faulty postulates of KMT: (1) Gas molecules possess zero actual volume; (2) No attractive forces exist.",
          "Volume correction: V_free = (V - nb).",
          "Pressure correction: P_ideal = P_observed + (n²a / V²)."
        ],
        "formulas": [
          "[P + (n²a / V²)] * (V - nb) = nRT"
        ],
        "boardQuestions": [
          "Explain the causes of deviation of real gases from ideality at high pressure and low temperature."
        ],
        "contentHtml": "<p>Van der Waals constants 'a' measures intermolecular attraction, while 'b' represents the effective co-volume (4 times actual molecular volume).</p>"
      }
    ]
  },
  {
    "id": "fsc2-phy-ch12",
    "title": "Electrostatics & Gauss’s Law Master Derivations",
    "classLevel": "FSc-Part2",
    "subject": "Physics",
    "chapterNumber": 12,
    "chapterTitle": "Electrostatics",
    "description": "Premier 2nd year Physics notes for board exam toppers: Coulomb’s Law with dielectric effect, Electric field & lines, Gauss’s Law & its 3 applications, Electric potential, Millikan’s experiment, and Capacitors with dielectric charging.",
    "totalPages": 36,
    "pricePKR": 320,
    "rating": 5,
    "reviewsCount": 310,
    "topicsCovered": [
      "Coulomb’s Law in Vector Form & Relative Permittivity (εr)",
      "Electric Field Intensity (E) & Electric Flux (Φ = E · A)",
      "Gauss’s Law Definition & Proof for Enclosed Charge",
      "Gauss Application 1: Infinite Sheet of Charge (E = σ / 2ε0)",
      "Gauss Application 2: Two Oppositely Charged Parallel Plates (E = σ / ε0)",
      "Millikan’s Oil Drop Experiment for Measurement of Charge on Electron",
      "Capacitors in Series and Parallel & Energy Stored (U = 0.5 C V²)"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/fsc_notes_cover_1790249204208.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Coulomb’s Law & Vector Formulation",
        "section": "Section 12.1: Electrostatic Force",
        "keyPoints": [
          "Electrostatic force is proportional to product of charges and inversely proportional to square of distance.",
          "Constant k = 1 / (4πε0) ≈ 9 × 10⁹ N m² C⁻².",
          "In the presence of dielectric medium, force decreases by factor εr: F_med = F_vac / εr."
        ],
        "formulas": [
          "F = (1 / 4πε) * (q1*q2 / r²)",
          "F_med = F_vac / εr",
          "E = F / q0"
        ],
        "boardQuestions": [
          "State Coulomb’s Law. Write its vector form and prove that Newton’s third law holds in electrostatics."
        ],
        "contentHtml": "<p><strong>Vector Formulation:</strong> Force exerted by q1 on q2 is F21 = (k q1 q2 / r²) r̂21. Similarly, F12 = (k q1 q2 / r²) r̂12. Since unit vectors are anti-parallel (r̂21 = -r̂12), we have <strong>F21 = -F12</strong>, confirming Newton’s Third Law.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Coulomb’s Law & Vector Formulation",
        "section": "Section 12.1: Electrostatic Force",
        "keyPoints": [
          "Vector form",
          "Dielectric constant εr"
        ],
        "formulas": [
          "F21 = -F12",
          "F_med = F_vac / εr"
        ],
        "boardQuestions": [
          "Prove that electrostatics obeys Newton’s third law."
        ],
        "contentHtml": "<p>Detailed vector analysis, superposition principle, and continuous charge distributions.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Gauss’s Law & Infinite Sheet Application",
        "section": "Section 12.2: Electric Flux & Applications",
        "keyPoints": [
          "Electric flux through any closed surface is 1/ε0 times total charge enclosed: Φ = Q / ε0.",
          "Application to infinite sheet of charge: Cylindrical Gaussian surface of cross-sectional area A.",
          "Resulting electric intensity: E = σ / (2ε0)."
        ],
        "formulas": [
          "Φ = ∮ E · dA = Q / ε0",
          "E = σ / (2ε0)",
          "E = σ / ε0 (Parallel plates)"
        ],
        "boardQuestions": [
          "State Gauss’s Law. Apply it to find electric intensity due to an infinite plane sheet of charge."
        ],
        "contentHtml": "<p>Flux through curved surface = 0 (E is parallel to surface). Flux through two flat end caps = 2 * E * A. By Gauss's Law: 2EA = Q / ε0 = (σ * A) / ε0. Solving gives: <strong>E = σ / (2ε0)</strong>.</p>"
      },
      {
        "pageNumber": 3,
        "title": "Millikan’s Experiment & Capacitor Energy",
        "section": "Section 12.3: Experimental Electrostatics",
        "keyPoints": [
          "Millikan balanced gravitational force with electric force: F_e = F_g => qE = mg.",
          "Calculated charge on electron e = 1.602 × 10⁻¹⁹ C.",
          "Energy stored in capacitor: U = 0.5 C V² = 0.5 ε0 εr E² (Ad)."
        ],
        "formulas": [
          "q = (m * g * d) / V",
          "C = ε0 * εr * A / d",
          "Energy Density = 0.5 * ε0 * εr * E²"
        ],
        "boardQuestions": [
          "Describe Millikan’s oil drop method for determining electronic charge with neat diagram."
        ],
        "contentHtml": "<p>Complete step-by-step description with Stokes’s law viscosity correction, terminal velocity derivation, and charge quantization.</p>"
      }
    ]
  },
  {
    "id": "fsc2-math-ch2",
    "title": "Differentiation & Calculus Rules (Derivatives from First Principles)",
    "classLevel": "FSc-Part2",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Differentiation",
    "description": "Complete FSc Part-2 Mathematics Chapter 2 notes: Definition of derivative, First Principles (ab-initio), Power rule, Product rule, Quotient rule, Chain rule, Derivatives of Trigonometric, Inverse Trig, Exponential & Logarithmic functions, and Maxima/Minima optimization.",
    "totalPages": 40,
    "pricePKR": 350,
    "rating": 5,
    "reviewsCount": 289,
    "topicsCovered": [
      "Derivative as instantaneous rate of change & limit definition",
      "Derivations of formulas from First Principle (ab-initio method)",
      "Product Rule, Quotient Rule and General Power Rule proofs",
      "Derivatives of sin x, cos x, tan x, sec x, csc x, cot x",
      "Inverse Trigonometric derivatives (sin⁻¹x, tan⁻¹x, sec⁻¹x)",
      "Implicit Differentiation and Parametric Equations (dy/dx = (dy/dt) / (dx/dt))",
      "Second Derivative Test for Local Maxima and Minima"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/fsc_notes_cover_1790249204208.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Definition of Derivative & First Principles",
        "section": "Section 2.1: The Limit Definition",
        "keyPoints": [
          "Derivative f'(x) = lim_{δx -> 0} [f(x + δx) - f(x)] / δx.",
          "The 4-step ab-initio method: (1) y + δy = f(x + δx); (2) Subtract y; (3) Divide by δx; (4) Take limit as δx -> 0."
        ],
        "formulas": [
          "dy/dx = lim_{δx -> 0} (δy / δx)",
          "d/dx (x^n) = n * x^(n-1)"
        ],
        "boardQuestions": [
          "Differentiate (ax + b)^n from first principles. (Appeared in 8 out of 9 Punjab boards)"
        ],
        "contentHtml": "<p><strong>Proof of Power Rule via Binomial Theorem:</strong> Let y = (ax + b)^n. Then y + δy = [a(x + δx) + b]^n = [(ax + b) + a δx]^n. Factor out (ax + b)^n: y + δy = (ax + b)^n [1 + (a δx)/(ax + b)]^n. Expanding by binomial theorem and dividing by δx yields: <strong>dy/dx = n a (ax + b)^(n-1)</strong>.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Definition of Derivative & First Principles",
        "section": "Section 2.1: The Limit Definition",
        "keyPoints": [
          "Ab-initio 4-step method",
          "Binomial expansion proof"
        ],
        "formulas": [
          "dy/dx = n a (ax + b)^(n-1)"
        ],
        "boardQuestions": [
          "Differentiate (ax + b)^n from first principles."
        ],
        "contentHtml": "<p>Full rigorous proofs for algebraic, root, and reciprocal power functions.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Trigonometric & Exponential Derivatives",
        "section": "Section 2.2: Transcendental Functions",
        "keyPoints": [
          "d/dx (sin x) = cos x, d/dx (cos x) = -sin x, d/dx (tan x) = sec²x.",
          "d/dx (e^x) = e^x, d/dx (a^x) = a^x ln a.",
          "d/dx (ln x) = 1/x."
        ],
        "formulas": [
          "d/dx [sin⁻¹(x/a)] = 1 / √(a² - x²)",
          "d/dx [tan⁻¹(x/a)] = a / (a² + x²)"
        ],
        "boardQuestions": [
          "Differentiate y = (ln x)^x with respect to x using logarithmic differentiation."
        ],
        "contentHtml": "<p>Complete derivations using trigonometric identity sin A - sin B = 2 cos((A+B)/2) sin((A-B)/2) and squeeze theorem limit sin θ / θ -> 1.</p>"
      },
      {
        "pageNumber": 3,
        "title": "Optimization & Maxima / Minima Theorem",
        "section": "Section 2.3: Second Derivative Applications",
        "keyPoints": [
          "Critical points: Set f'(x) = 0.",
          "Second derivative test: If f''(c) < 0, local MAXIMUM at x = c. If f''(c) > 0, local MINIMUM at x = c."
        ],
        "formulas": [
          "f'(c) = 0 (Stationary point)",
          "f''(c) < 0 => Maxima",
          "f''(c) > 0 => Minima"
        ],
        "boardQuestions": [
          "Find dimensions of a rectangular field of maximum area enclosed by 600m fencing."
        ],
        "contentHtml": "<p>Solved past board word problems with geometric constraints, box volumes, and profit optimization models.</p>"
      }
    ]
  },
  {
    "id": "bsc-math-calc3",
    "title": "Advanced Calculus & Analytical Geometry (Multivariable & Vectors)",
    "classLevel": "BSc-Year1",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Multivariable Calculus and Vector Analysis",
    "description": "University-level BSc source notes: Partial derivatives, Euler’s theorem on homogeneous functions, Tangent planes, Gradient, Divergence, Curl, and Green’s / Stokes’s / Divergence Theorems with proof demonstrations.",
    "totalPages": 48,
    "pricePKR": 450,
    "rating": 4.9,
    "reviewsCount": 182,
    "topicsCovered": [
      "Functions of Several Variables, Limits and Continuity in R²",
      "Partial Differentiation & Clairaut’s Theorem (f_xy = f_yx)",
      "Euler’s Theorem for Homogeneous Functions of Degree n",
      "Directional Derivatives & Gradient Vector Operator (∇)",
      "Divergence and Curl of Vector Fields with physical interpretations",
      "Line Integrals, Conservative Vector Fields and Potential Functions",
      "Green’s Theorem in the Plane & Stokes’s Theorem proofs"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/bsc_notes_cover_1790249216045.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Euler’s Theorem on Homogeneous Functions",
        "section": "Section 1.1: Homogeneous Functions & PDE",
        "keyPoints": [
          "A function f(x, y) is homogeneous of degree n if f(tx, ty) = t^n f(x, y).",
          "Euler’s Statement: x (∂f/∂x) + y (∂f/∂y) = n f(x, y).",
          "Second order extension: x² (∂²f/∂x²) + 2xy (∂²f/∂x∂y) + y² (∂²f/∂y²) = n(n-1) f(x, y)."
        ],
        "formulas": [
          "x ∂u/∂x + y ∂u/∂y = n u",
          "x² ∂²u/∂x² + 2xy ∂²u/∂x∂y + y² ∂²u/∂y² = n(n-1)u"
        ],
        "boardQuestions": [
          "If u = sin⁻¹[(x² + y²) / (x + y)], prove that x ∂u/∂x + y ∂u/∂y = tan u. (Punjab Univ & Karachi Univ Annual Exam favorite)"
        ],
        "contentHtml": "<p><strong>Proof Strategy for u = sin⁻¹(z):</strong> Let z = sin u = (x² + y²)/(x + y). Since z is homogeneous of degree 1 (numerator degree 2, denominator degree 1), by Euler's Theorem: x ∂z/∂x + y ∂z/∂y = 1 * z. Now ∂z/∂x = cos u (∂u/∂x). Substituting: x cos u ∂u/∂x + y cos u ∂u/∂y = sin u. Dividing through by cos u yields: <strong>x ∂u/∂x + y ∂u/∂y = tan u</strong>.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Euler’s Theorem on Homogeneous Functions",
        "section": "Section 1.1: Homogeneous Functions & PDE",
        "keyPoints": [
          "Homogeneity test",
          "Euler’s 1st and 2nd theorems"
        ],
        "formulas": [
          "x ∂u/∂x + y ∂u/∂y = n u"
        ],
        "boardQuestions": [
          "u = sin⁻¹[(x²+y²)/(x+y)] proof of tan u."
        ],
        "contentHtml": "<p>Full formal proofs and 12 university solved examination problems.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Vector Differential Calculus: Gradient, Divergence & Curl",
        "section": "Section 1.2: Del Operator Operations",
        "keyPoints": [
          "Gradient: ∇φ = (∂φ/∂x)î + (∂φ/∂y)ĵ + (∂φ/∂z)k̂ (Points in direction of maximum increase).",
          "Divergence: ∇ · V = ∂V1/∂x + ∂V2/∂y + ∂V3/∂z (Solenoidal field if ∇ · V = 0).",
          "Curl: ∇ × V (Irrotational field if ∇ × V = 0 => V = ∇φ)."
        ],
        "formulas": [
          "∇ · (∇ × V) = 0 (Div of Curl is zero)",
          "∇ × (∇φ) = 0 (Curl of Grad is zero)"
        ],
        "boardQuestions": [
          "Show that vector field V = (2xy + z³)î + x²ĵ + 3xz²k̂ is irrotational and find its scalar potential."
        ],
        "contentHtml": "<p>Detailed evaluation of line integrals along closed contours, conservative fields, and work done calculations.</p>"
      },
      {
        "pageNumber": 3,
        "title": "Stokes’s Theorem & Divergence Theorem",
        "section": "Section 1.3: Integral Theorems of Vector Analysis",
        "keyPoints": [
          "Stokes’s Theorem: ∮_C F · dr = ∬_S (∇ × F) · n̂ dS.",
          "Gauss’s Divergence Theorem: ∬_S F · n̂ dS = ∭_V (∇ · F) dV."
        ],
        "formulas": [
          "∮ F · dr = ∬ (curl F) · dS",
          "∬ F · dS = ∭ (div F) dV"
        ],
        "boardQuestions": [
          "Verify Stokes’s Theorem for F = yî + zj + xk around the boundary of triangle x+y+z=1."
        ],
        "contentHtml": "<p>Complete analytical and geometrical verification across hemispheres, cylinders, and polyhedra.</p>"
      }
    ]
  },
  {
    "id": "bsc-phy-mech",
    "title": "Mechanics & Special Theory of Relativity",
    "classLevel": "BSc-Year1",
    "subject": "Physics",
    "chapterNumber": 2,
    "chapterTitle": "Relativistic Mechanics and Rotational Dynamics",
    "description": "Advanced university physics notes: Michelson-Morley experiment, Postulates of Special Relativity, Lorentz Transformations, Length Contraction, Time Dilation, Relativistic Mass & E = mc², and Rigid Body Moments of Inertia.",
    "totalPages": 52,
    "pricePKR": 420,
    "rating": 4.9,
    "reviewsCount": 154,
    "topicsCovered": [
      "Inertial vs Non-Inertial frames & Galilean Transformations breakdown",
      "Michelson-Morley Experiment null result and ether hypothesis failure",
      "Einstein’s Postulates of Special Relativity",
      "Derivation of Lorentz Transformation equations for space-time coordinates",
      "Time Dilation (t = γ t0) and Muon decay experimental validation",
      "Lorentz-FitzGerald Length Contraction (L = L0 / γ)",
      "Relativistic Mass variation & Proof of Mass-Energy Equivalence E = mc²"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/bsc_notes_cover_1790249216045.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Postulates & Lorentz Transformation Matrix",
        "section": "Section 2.1: Foundations of Relativity",
        "keyPoints": [
          "Postulate 1 (Principle of Relativity): The laws of physics are identical in all inertial frames.",
          "Postulate 2 (Constancy of Speed of Light): The speed of light in vacuum c = 3 × 10⁸ m/s is independent of the motion of the source or observer.",
          "Lorentz Factor: γ = 1 / √(1 - v²/c²)."
        ],
        "formulas": [
          "x' = γ (x - vt)",
          "y' = y",
          "z' = z",
          "t' = γ (t - vx/c²)",
          "γ = 1 / √(1 - v²/c²)"
        ],
        "boardQuestions": [
          "Derive Lorentz coordinate and time transformation equations between two inertial frames in relative motion along x-axis."
        ],
        "contentHtml": "<p><strong>Derivation Overview:</strong> For a spherical light wavefront expanding in frame S: x² + y² + z² - c²t² = 0. In frame S': x'² + y'² + z'² - c²t'² = 0. Using linear transformations x' = k(x - vt) and assuming symmetry in y and z, imposing invariance of light speed c leads directly to <strong>k = γ = 1 / √(1 - v²/c²)</strong>.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Postulates & Lorentz Transformation Matrix",
        "section": "Section 2.1: Foundations of Relativity",
        "keyPoints": [
          "Einstein’s two postulates",
          "Lorentz factor γ derivation"
        ],
        "formulas": [
          "x' = γ(x - vt)",
          "t' = γ(t - vx/c²)"
        ],
        "boardQuestions": [
          "Derive Lorentz Transformations."
        ],
        "contentHtml": "<p>Complete step-by-step space-time interval invariance proof.</p>"
      },
      {
        "pageNumber": 2,
        "title": "Time Dilation & Length Contraction",
        "section": "Section 2.2: Kinematic Consequences of Relativity",
        "keyPoints": [
          "Time Dilation: Moving clocks run slow: Δt = γ Δt0 (where Δt0 is proper time).",
          "Length Contraction: An object moves past at velocity v appears contracted along direction of motion: L = L0 √(1 - v²/c²)."
        ],
        "formulas": [
          "Δt = Δt0 / √(1 - v²/c²)",
          "L = L0 * √(1 - v²/c²)"
        ],
        "boardQuestions": [
          "A spacecraft moves at speed 0.8c. To an observer on Earth, its journey takes 10 hours. How much time elapsed on board?"
        ],
        "contentHtml": "<p>Light clock thought experiment and calculations for atmospheric muon longevity.</p>"
      },
      {
        "pageNumber": 3,
        "title": "Relativistic Dynamics: Derivation of E = mc²",
        "section": "Section 2.3: Relativistic Energy and Momentum",
        "keyPoints": [
          "Relativistic Mass: m = m0 / √(1 - v²/c²).",
          "Work-Energy Theorem in relativistic regime: W = ∫ F dx = ∫ (dp/dt) dx = (m - m0) c².",
          "Total Energy: E = mc² = m0 c² + K.E.",
          "Energy-Momentum Relation: E² = p²c² + m0²c⁴."
        ],
        "formulas": [
          "E = m c²",
          "K = (m - m0)c²",
          "E² = p²c² + m0²c⁴"
        ],
        "boardQuestions": [
          "Derive Einstein’s mass-energy equation E = mc² using relativistic momentum definition."
        ],
        "contentHtml": "<p>Integration of dK = v dp where p = γ m0 v yields K = γ m0 c² - m0 c² = mc² - m0 c². Adding rest energy E0 = m0 c² yields <strong>E = mc²</strong>.</p>"
      }
    ]
  },
  {
    "id": "bundle-fsc2-complete",
    "title": "FSc Part 2 Complete Master Science Bundle (All Subjects)",
    "classLevel": "FSc-Part2",
    "subject": "Physics",
    "chapterNumber": 0,
    "chapterTitle": "Complete Board Examination Master Bundle",
    "description": "Comprehensive bundle including all chapters of FSc Part 2 Physics, Chemistry, and Mathematics (or Biology). Includes full chapter notes, solved 10-year past papers, and formula quick sheets.",
    "totalPages": 380,
    "pricePKR": 1199,
    "isBundle": true,
    "bundleNoteIds": [
      "fsc2-phy-ch12",
      "fsc2-math-ch2"
    ],
    "rating": 5,
    "reviewsCount": 420,
    "topicsCovered": [
      "Physics: Electrostatics, Current Electricity, Electromagnetism, Modern Physics (Chapters 12-21)",
      "Chemistry: Periodic Trends, Organic Reaction Mechanisms, Macromolecules (Chapters 1-16)",
      "Math: Functions & Limits, Differentiation, Integration, Conic Sections (Chapters 1-7)",
      "Solved numericals and long questions for all 9 Educational Boards of Pakistan"
    ],
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
    "coverImage": "/images/fsc_notes_cover_1790249204208.jpg",
    "previewPages": [
      {
        "pageNumber": 1,
        "title": "Master Bundle Index & Board Syllabus Blueprint",
        "section": "Bundle Overview",
        "keyPoints": [
          "Full coverage of all 21 Punjab & Federal Textbook Board Units.",
          "Highlighted 5-star questions marked by 20+ year senior examiners."
        ],
        "boardQuestions": [
          "Covers all previous board exam questions from 2014 to 2024."
        ],
        "contentHtml": "<p>Welcome to the FSc Part-2 Complete Master Bundle. This comprehensive compilation grants permanent digital access to every unit of 2nd year Physics, Chemistry, and Mathematics/Biology with our high-security reader.</p>"
      }
    ],
    "fullContentPages": [
      {
        "pageNumber": 1,
        "title": "Master Bundle Index & Board Syllabus Blueprint",
        "section": "Bundle Overview",
        "keyPoints": [
          "Comprehensive syllabus mapping across all board papers"
        ],
        "contentHtml": "<p>Complete master access to all bundled files.</p>"
      }
    ]
  }
];

export const seedOrders: Order[] = [
  {
    "id": "KH-4038",
    "studentName": "Zainab Fatima (Student Test)",
    "studentEmail": "zainab.fsc@gmail.com",
    "studentPhone": "03218765432",
    "noteIds": [
      "fsc2-phy-ch12"
    ],
    "noteTitles": [
      "Electrostatics & Gauss’s Law Master Derivations"
    ],
    "totalAmountPKR": 320,
    "paymentMethod": "easypaisa",
    "easypaisaAccount": "03415892099",
    "trxId": "2437181069",
    "screenshotUrl": "",
    "status": "rejected",
    "createdAt": "2026-09-24T11:47:58.562Z"
  },
  {
    "id": "KH-5622",
    "studentName": "Kainat Hamad",
    "studentEmail": "kainatloveshamad@gmail.com",
    "studentPhone": "03124052253",
    "noteIds": [
      "mat10-phy-ch10"
    ],
    "noteTitles": [
      "Simple Harmonic Motion & Waves (Diagrams & Derivations)"
    ],
    "totalAmountPKR": 220,
    "paymentMethod": "easypaisa",
    "easypaisaAccount": "03415892099",
    "trxId": "Pakistan",
    "screenshotUrl": "data:image/jpeg;base64,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",
    "status": "verified",
    "createdAt": "2026-09-24T11:37:37.538Z",
    "verifiedAt": "2026-09-24T11:47:32.100Z",
    "accessToken": "tok_kh-5622_1d2jknj",
    "notesUnlocked": [
      {
        "id": "mat10-phy-ch10",
        "title": "Simple Harmonic Motion & Waves (Diagrams & Derivations)",
        "classLevel": "Matric-10th",
        "subject": "Physics"
      }
    ]
  },
  {
    "id": "KH-2681",
    "studentName": "Test Student",
    "studentEmail": "test@school.pk",
    "studentPhone": "03241234567",
    "noteIds": [
      "mat9-chem-ch1"
    ],
    "noteTitles": [
      "Fundamentals of Chemistry (Definitions, Mole Concept & Molar Mass)"
    ],
    "totalAmountPKR": 180,
    "paymentMethod": "easypaisa",
    "easypaisaAccount": "03415892099",
    "trxId": "9845123456",
    "screenshotUrl": "",
    "status": "verified",
    "createdAt": "2026-09-24T11:31:41.403Z",
    "verifiedAt": "2026-09-24T11:31:43.419Z",
    "accessToken": "tok_kh-2681_1677vla",
    "notesUnlocked": [
      {
        "id": "mat9-chem-ch1",
        "title": "Fundamentals of Chemistry (Definitions, Mole Concept & Molar Mass)",
        "classLevel": "Matric-9th",
        "subject": "Chemistry"
      }
    ]
  },
  {
    "id": "KH-8102",
    "studentName": "Muhammad Hamza",
    "studentEmail": "hamza.student@gmail.com",
    "studentPhone": "03041234567",
    "noteIds": [
      "mat9-phy-ch2"
    ],
    "noteTitles": [
      "Kinematics & Equations of Motion (Topper Handwritten Notes)"
    ],
    "totalAmountPKR": 199,
    "paymentMethod": "easypaisa",
    "easypaisaAccount": "03415892099",
    "trxId": "8294102941",
    "status": "verified",
    "createdAt": "2026-09-24T09:31:35.170Z",
    "verifiedAt": "2026-09-24T10:31:35.170Z",
    "accessToken": "tok_kh8102_demo_access",
    "notesUnlocked": [
      {
        "id": "mat9-phy-ch2",
        "title": "Kinematics & Equations of Motion (Topper Handwritten Notes)",
        "classLevel": "Matric-9th",
        "subject": "Physics"
      }
    ]
  }
];

export const seedNotifications: OrderNotificationAlert[] = [
  {
    "id": "notif-1790250452100",
    "orderId": "KH-5622",
    "studentName": "Kainat Hamad",
    "studentEmail": "kainatloveshamad@gmail.com",
    "studentPhone": "03124052253",
    "totalAmountPKR": 220,
    "verifiedAt": "2026-09-24T11:47:32.100Z",
    "message": "Payment verified for Kainat Hamad (KH-5622). Notes unlocked in secure viewer!"
  },
  {
    "id": "notif-1790249503419",
    "orderId": "KH-2681",
    "studentName": "Test Student",
    "studentEmail": "test@school.pk",
    "studentPhone": "03241234567",
    "totalAmountPKR": 180,
    "verifiedAt": "2026-09-24T11:31:43.419Z",
    "message": "Payment verified for Test Student (KH-2681). Notes unlocked in secure viewer!"
  },
  {
    "id": "notif-1",
    "orderId": "KH-8102",
    "studentName": "Muhammad Hamza",
    "studentEmail": "hamza.student@gmail.com",
    "studentPhone": "03041234567",
    "totalAmountPKR": 199,
    "verifiedAt": "2026-09-24T10:31:35.170Z",
    "message": "Payment verified successfully for Order KH-8102. Notes unlocked!"
  }
];

export const seedSettings: SiteSettings = {
  "siteName": "Kainat Notes Hub",
  "ownerName": "Kainat",
  "logoUrl": "",
  "easyPaisaNumber": "03415892099",
  "whatsAppNumber": "0324 9059918",
  "ownerEmail": "ka8984510@gmail.com"
};
