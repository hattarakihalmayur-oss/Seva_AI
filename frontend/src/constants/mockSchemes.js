/**
 * BharatSeva AI - Verified and Representative Scheme Dataset
 * Labeled transparently with provenance metadata.
 */

export const MOCK_SCHEMES = [
  {
    "id": "ssp-scholarship-karnataka",
    "slug": "ssp-scholarship-karnataka",
    "name": "State Scholarship Portal (SSP) Post-Matric Scholarship (Karnataka)",
    "shortName": "SSP Post-Matric Scholarship",
    "sector": "Education & Scholarships",
    "type": "State",
    "state": "Karnataka",
    "authority": "Social Welfare & Backward Classes Welfare Department, Government of Karnataka",
    "description": "Unified digital welfare scholarship program providing tuition fee waivers, maintenance stipends, and hostel allowances directly through Aadhaar-seeded DBT bank accounts to SC, ST, OBC, and EWS students enrolled in post-matric courses across Karnataka.",
    "targetBeneficiaries": [
      "Post-Matric Students in Karnataka (Class 11, PUC, ITI, Diploma, UG, Engineering, Medical, PG, PhD)",
      "SC and ST Category Students",
      "OBC Category Students (Cat-1, 2A, 2B, 3A, 3B)",
      "Economically Weaker Section (EWS) & Minority Students"
    ],
    "benefits": [
      "Full or partial college tuition and examination fee concession reimbursement.",
      "Annual maintenance allowance / student stipend ranging from ₹2,500 to ₹10,000 per academic year.",
      "Direct Benefit Transfer (DBT) into student’s Aadhaar-linked bank account verified via PFMS.",
      "Hostel accommodation fee reimbursement for recognized government and empanelled private hostels."
    ],
    "eligibilityCriteria": [
      { "id": "karnataka_domicile", "label": "Student must be a permanent resident of Karnataka.", "mandatory": true, "field": "state", "operator": "eq", "value": "Karnataka" },
      { "id": "enrolled_post_matric", "label": "Must be actively enrolled in a recognized post-matric course (PUC, Diploma, ITI, Degree, Engineering, Medical, PG).", "mandatory": true, "field": "isStudent", "operator": "eq", "value": true },
      { "id": "family_income_cap", "label": "Annual family income must not exceed ₹2,50,000 (up to ₹2.5 Lakh for SC/ST/Cat-1; ₹1 Lakh to ₹2.5 Lakh for OBC/EWS).", "mandatory": true, "field": "annualIncome", "operator": "lte", "value": 250000 },
      { "id": "aadhaar_dbt_seeded", "label": "Student must have an active bank account seeded with Aadhaar for NPCI Direct Benefit Transfer.", "mandatory": true, "field": "dbtEnabled", "operator": "eq", "value": true }
    ],
    "requiredDocuments": [
      "Aadhaar Card of the Student & Parent",
      "Caste & Category Certificate with RD Number (Revenue Dept)",
      "Income Certificate with RD Number (Revenue Dept)",
      "Bank Account Passbook (Aadhaar & DBT Seeded)",
      "College Admission Fee Receipt & Student SATS / USN ID",
      "SSLC / 10th Standard Academic Marksheet",
      "Permanent Domicile & Residence Certificate"
    ],
    "applicationSteps": [
      "Register on Karnataka State Scholarship Portal (ssp.postmatric.karnataka.gov.in) with Aadhaar e-KYC.",
      "Auto-fetch Caste and Income Certificate RD numbers via DigiLocker / Revenue Department integration.",
      "Complete online e-Attestation of admission and academic marksheets through College Verification Officer.",
      "Submit post-matric scholarship application on SSP portal and select eligible welfare department.",
      "Scholarship amount and fee concession credited directly to student bank account via DBT."
    ],
    "applicationMode": "Online via State Scholarship Portal (ssp.postmatric.karnataka.gov.in)",
    "officialLink": "https://ssp.postmatric.karnataka.gov.in",
    "sourceAuthority": "State Scholarship Portal (SSP), Center for e-Governance, Karnataka",
    "lastVerifiedDate": "2026-03-15",
    "dataClassification": "VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 15,
    "maxAge": 35,
    "occupations": ["Student", "Youth", "Any"],
    "applicationDeadline": "31 January 2027 (Annual Academic Year 2026-27 Window)",
    "deadlineStatus": "OPEN"
  },
  {
    "id": "pm-kisan",
    "slug": "pm-kisan",
    "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    "shortName": "PM-KISAN",
    "sector": "Agriculture & Farmers Welfare",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Agriculture and Farmers Welfare, Government of India",
    "description": "An income support initiative transferring ₹6,000 per year directly into bank accounts of eligible landholder farmer families in three equal four-monthly installments.",
    "targetBeneficiaries": [
      "Small and Marginal Farmers",
      "Landholding Farmer Families",
      "Rural Households"
    ],
    "benefits": [
      "Direct financial benefit of ₹6,000 annually.",
      "Transferred in 3 equal installments of ₹2,000 every 4 months directly via DBT.",
      "Aadhaar-seeded direct account transfer with zero middlemen fees."
    ],
    "eligibilityCriteria": [
      {
        "id": "land",
        "label": "Must be a cultivable landholding farmer family with land records in state/UT land records database.",
        "mandatory": true,
        "field": "landholding",
        "operator": "gt",
        "value": 0
      },
      {
        "id": "citizen",
        "label": "Must be an Indian citizen resident.",
        "mandatory": true,
        "field": "citizen",
        "operator": "eq",
        "value": true
      },
      {
        "id": "not_taxpayer",
        "label": "Must not have paid income tax in the previous assessment year.",
        "mandatory": true,
        "field": "taxpayer",
        "operator": "eq",
        "value": false
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card (Mandatory)",
      "Proof of Citizenship / Domicile Certificate",
      "Landholding ownership papers (RoR / Pahani / Khasra-Khatauni)",
      "Active Bank Passbook seeded with Aadhaar",
      "Mobile number linked to Aadhaar (for e-KYC)"
    ],
    "applicationSteps": [
      "Visit the official PM-KISAN portal (pmkisan.gov.in).",
      "Click on \"Farmers Corner\" and select \"New Farmer Registration\".",
      "Enter your Aadhaar number, state, and mobile number to receive an OTP.",
      "Fill in landholding records details matching state land revenue data.",
      "Submit the application and complete biometric or OTP e-KYC.",
      "Track status using the \"Know Your Status\" tab with your registration number."
    ],
    "applicationMode": "Online & Common Service Centers (CSC)",
    "officialLink": "https://pmkisan.gov.in",
    "sourceAuthority": "Ministry of Agriculture and Farmers Welfare (pmkisan.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 75,
    "occupations": [
      "Farmer",
      "Agriculture"
    ]
  },
  {
    "id": "pm-fasal-bima-yojana",
    "slug": "pm-fasal-bima-yojana",
    "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    "shortName": "PMFBY (Crop Insurance)",
    "sector": "Agriculture & Farmers Welfare",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Agriculture and Farmers Welfare",
    "description": "Comprehensive yield and weather-based crop insurance coverage against non-preventable natural risks (drought, flood, pest infestation, cyclones) from pre-sowing to post-harvest.",
    "targetBeneficiaries": [
      "All Farmers Growing Notified Crops",
      "Sharecroppers and Tenant Farmers",
      "Loanee and Non-loanee Farmers"
    ],
    "benefits": [
      "Very low farmer premium: 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops.",
      "Balance premium subsidized up to 90% equally by Central and State Governments.",
      "Covers localized calamities, mid-season adversity, and post-harvest losses up to 14 days."
    ],
    "eligibilityCriteria": [
      {
        "id": "farmer_crop",
        "label": "Must cultivate notified crops in an area declared eligible by the State Government.",
        "mandatory": true,
        "field": "growsNotifiedCrop",
        "operator": "eq",
        "value": true
      },
      {
        "id": "insurable_interest",
        "label": "Must have insurable interest in the land (owner, tenant, or sharecropper).",
        "mandatory": true,
        "field": "hasLandInterest",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Land Record Documents (Khasra/Khatauni/RTC)",
      "Sowing Certificate / Declaration from Village Revenue Officer (Patwari)",
      "Bank Account Passbook"
    ],
    "applicationSteps": [
      "Apply via National Crop Insurance Portal (pmfby.gov.in) or nearest CSC/Bank branch.",
      "Select notified crop, survey number, and insured acreage.",
      "Pay farmer share of premium before cut-off date.",
      "Receive Insurance Certificate and track crop assessment status."
    ],
    "applicationMode": "Online (pmfby.gov.in), CSCs & Commercial/Cooperative Banks",
    "officialLink": "https://pmfby.gov.in",
    "sourceAuthority": "Ministry of Agriculture (pmfby.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 75,
    "occupations": [
      "Farmer",
      "Agriculture"
    ]
  },
  {
    "id": "kisan-credit-card",
    "slug": "kisan-credit-card",
    "name": "Kisan Credit Card (KCC) Scheme",
    "shortName": "Kisan Credit Card (KCC)",
    "sector": "Agriculture & Farmers Welfare",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Agriculture & Cooperation / RBI / NABARD",
    "description": "Provides timely credit to farmers to meet short-term cultivation expenses, post-harvest needs, working capital for dairy/fisheries, and maintenance of farm assets at subsidized interest rates.",
    "targetBeneficiaries": [
      "Individual Farmers",
      "Joint Borrowers",
      "Self Help Groups of Farmers",
      "Fishermen and Animal Husbandry Farmers"
    ],
    "benefits": [
      "Short-term crop loan up to ₹3,00,000 at concessional interest rate of 7%, reduced to 4% upon prompt repayment.",
      "Collateral-free loan limit up to ₹1,60,000.",
      "Flexible revolving credit facility valid for 5 years with simple annual renewal."
    ],
    "eligibilityCriteria": [
      {
        "id": "farmer_or_allied",
        "label": "Owner cultivators, tenant farmers, oral lessees, or farmers engaged in animal husbandry/fisheries.",
        "mandatory": true,
        "field": "isFarmerOrAllied",
        "operator": "eq",
        "value": true
      },
      {
        "id": "age_req",
        "label": "Must be between 18 and 75 years of age (co-borrower required above 60).",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 18
      }
    ],
    "requiredDocuments": [
      "Duly filled KCC Application Form",
      "Identity & Address Proof (Aadhaar Card, Voter ID)",
      "Land ownership documents or tenancy agreements certified by local revenue authority",
      "Passport size photographs"
    ],
    "applicationSteps": [
      "Download one-page KCC application form from bank portal or collect from local branch.",
      "Submit land revenue records and crop cultivation details.",
      "Bank issues Kisan Credit Card cum RuPay ATM card within 14 days."
    ],
    "applicationMode": "Offline at Banks & Online via Bank Portals",
    "officialLink": "https://www.myscheme.gov.in/schemes/kcc",
    "sourceAuthority": "National Bank for Agriculture and Rural Development (NABARD)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 75,
    "occupations": [
      "Farmer",
      "Fisherman",
      "Dairy Worker",
      "Agriculture"
    ]
  },
  {
    "id": "pm-krishi-sinchayee-yojana",
    "slug": "pm-krishi-sinchayee-yojana",
    "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)",
    "shortName": "PMKSY Micro-Irrigation",
    "sector": "Agriculture & Farmers Welfare",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Agriculture and Farmers Welfare",
    "description": "Promotes water use efficiency at the farm level through micro-irrigation technologies such as Drip and Sprinkler systems with high government financial subsidies.",
    "targetBeneficiaries": [
      "Small and Marginal Farmers",
      "Women Farmers",
      "SC/ST Agricultural Landholders"
    ],
    "benefits": [
      "55% financial subsidy on drip/sprinkler system cost for Small & Marginal farmers.",
      "45% subsidy for other farmers.",
      "Saves up to 40-50% water while increasing agricultural crop yield by 30-40%."
    ],
    "eligibilityCriteria": [
      {
        "id": "own_or_lease_land",
        "label": "Farmers having cultivable land with an assured source of irrigation.",
        "mandatory": true,
        "field": "hasIrrigationSource",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Land Record (RoR / 7/12 / RTC extract)",
      "Water Source proof (Borewell / Open well / Canal share)",
      "Bank Passbook copy",
      "Quotation from empanelled micro-irrigation manufacturer"
    ],
    "applicationSteps": [
      "Apply online on State Micro-Irrigation Portal or through Assistant Director of Horticulture/Agriculture.",
      "Field survey and technical layout conducted by certified company engineer.",
      "Administrative sanction issued; system installed at farmer field.",
      "Subsidy released via DBT directly to farmer bank account or manufacturer upon farmer consent."
    ],
    "applicationMode": "Online via State Horticulture Portals & Agriculture Offices",
    "officialLink": "https://pmksy.gov.in",
    "sourceAuthority": "Ministry of Agriculture and Farmers Welfare (pmksy.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Possibly Eligible",
    "minAge": 18,
    "maxAge": 75,
    "occupations": [
      "Farmer",
      "Agriculture"
    ]
  },
  {
    "id": "ayushman-bharat-pmjay",
    "slug": "ayushman-bharat-pmjay",
    "name": "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    "shortName": "PM-JAY (Ayushman Bharat)",
    "sector": "Healthcare & Health Insurance",
    "type": "Central",
    "state": "All India",
    "authority": "National Health Authority (NHA), Ministry of Health & Family Welfare",
    "description": "The world’s largest government-funded health assurance scheme providing a health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization.",
    "targetBeneficiaries": [
      "Low-income Families",
      "SECC 2011 Identified Deprivation Households",
      "Rural & Urban Vulnerable Workers",
      "Senior Citizens aged 70+"
    ],
    "benefits": [
      "Cashless and paperless access to health services up to ₹5 Lakh per family per year.",
      "Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization expenses.",
      "Covers 1,900+ medical procedures, surgeries, and critical illness treatments at empanelled hospitals across India.",
      "Universal health coverage for all senior citizens aged 70 and above regardless of family income."
    ],
    "eligibilityCriteria": [
      {
        "id": "secc",
        "label": "Listed under eligible deprivation categories of SECC 2011, NFSA list, or senior citizen aged 70+.",
        "mandatory": true,
        "field": "eligibleHealthCover",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card or Government Photo Identity Card",
      "Ration Card / NFSA Card for family verification",
      "Mobile number for OTP verification"
    ],
    "applicationSteps": [
      "Visit beneficiary.nha.gov.in or visit the nearest Empanelled Health Care Provider (EHCP) / Ayushman Mitra.",
      "Search using Aadhaar number, Ration card number, or Family ID.",
      "Verify identity through Aadhaar OTP or biometric scan.",
      "Download and print your personalized Ayushman Card."
    ],
    "applicationMode": "Online & At Empanelled Hospitals (Ayushman Mitra)",
    "officialLink": "https://beneficiary.nha.gov.in",
    "sourceAuthority": "National Health Authority (nha.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Daily Wage Worker",
      "Informal Sector",
      "Unemployed",
      "Farmer",
      "Self Employed",
      "Senior Citizen"
    ]
  },
  {
    "id": "pm-janaushadhi-pariyojana",
    "slug": "pm-janaushadhi-pariyojana",
    "name": "Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP)",
    "shortName": "PM Janaushadhi (Generic Medicine)",
    "sector": "Healthcare & Health Insurance",
    "type": "Central",
    "state": "All India",
    "authority": "Pharmaceuticals & Medical Devices Bureau of India (PMBI), Ministry of Chemicals & Fertilizers",
    "description": "Ensures availability of quality generic medicines at affordable prices (50% to 90% cheaper than branded drugs) through 10,000+ dedicated Kendra outlets across India.",
    "targetBeneficiaries": [
      "All Citizens of India",
      "Chronic Patients (Diabetes, BP, Cardiac)",
      "Low & Middle Income Families"
    ],
    "benefits": [
      "Quality medicines available at 50% to 90% lower prices compared to open market branded alternatives.",
      "Over 2,046 medicines and 300 surgical devices covered.",
      "Quality guaranteed through strict NABL accredited laboratory batch testing."
    ],
    "eligibilityCriteria": [
      {
        "id": "open_to_all",
        "label": "Open universally to all citizens of India with a valid doctor prescription.",
        "mandatory": true,
        "field": "hasDoctorPrescription",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Doctor Prescription (for scheduled medicines)",
      "No income certificate or reservation card needed"
    ],
    "applicationSteps": [
      "Locate nearest Pradhan Mantri Bharatiya Janaushadhi Kendra using Jan Aushadhi Sugam App or janaushadhi.gov.in.",
      "Present prescription at the store counter.",
      "Purchase medicines at designated subsidized MRP."
    ],
    "applicationMode": "Over the Counter at Janaushadhi Kendras",
    "officialLink": "https://janaushadhi.gov.in",
    "sourceAuthority": "Ministry of Chemicals & Fertilizers (janaushadhi.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Any",
      "Salaried",
      "Farmer",
      "Student",
      "Senior Citizen"
    ]
  },
  {
    "id": "nikshay-poshan-yojana",
    "slug": "nikshay-poshan-yojana",
    "name": "Ni-Kshay Poshan Yojana (Nutritional Support for TB Patients)",
    "shortName": "Ni-Kshay Poshan Yojana",
    "sector": "Healthcare & Health Insurance",
    "type": "Central",
    "state": "All India",
    "authority": "Central TB Division, Ministry of Health and Family Welfare",
    "description": "Direct Benefit Transfer scheme offering ₹500 to ₹1,000 per month financial nutritional assistance to all notified Tuberculosis (TB) patients for each month of active medical treatment.",
    "targetBeneficiaries": [
      "All Notified TB Patients in India (Public and Private Sector)"
    ],
    "benefits": [
      "Direct monthly cash transfer of ₹500 to ₹1,000 for purchasing nutritious diet and protein supplements.",
      "Provided for the entire prescribed duration of anti-TB treatment.",
      "Disbursed directly into patient Aadhaar-linked bank account."
    ],
    "eligibilityCriteria": [
      {
        "id": "notified_tb",
        "label": "Must be a diagnosed and notified TB patient registered on the Ni-kshay national portal.",
        "mandatory": true,
        "field": "isNotifiedTBPatient",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card of the patient",
      "Bank Account Passbook / IFSC details",
      "Ni-Kshay Patient Identification ID number"
    ],
    "applicationSteps": [
      "Patient is registered on Ni-Kshay portal upon diagnosis by treating doctor or clinic.",
      "Submit Aadhaar and bank account details to the Senior Treatment Supervisor (STS) or health worker.",
      "Monthly DBT transfers are credited automatically during treatment duration."
    ],
    "applicationMode": "Automated via Ni-Kshay Healthcare Portal",
    "officialLink": "https://nikshay.in",
    "sourceAuthority": "Ministry of Health & Family Welfare (nikshay.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Possibly Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Any"
    ]
  },
  {
    "id": "national-means-cum-merit-scholarship",
    "slug": "national-means-cum-merit-scholarship",
    "name": "National Means-cum-Merit Scholarship Scheme (NMMSS)",
    "shortName": "NMMSS Scholarship",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "Department of School Education & Literacy, Ministry of Education",
    "description": "A centrally sponsored scholarship scheme providing ₹12,000 per annum (₹1,000/month) to meritorious students from economically weaker sections to prevent drop-outs after Class VIII and support secondary education up to Class XII.",
    "targetBeneficiaries": [
      "Class 9 to 12 Students",
      "Economically Weaker Section Families",
      "Government & Aided School Students"
    ],
    "benefits": [
      "Scholarship amount of ₹12,000 per annum credited directly to the student bank account via DBT.",
      "Continuous annual assistance from Class 9 through Class 12 upon maintaining satisfactory academic progression.",
      "No application fees on the National Scholarship Portal (NSP)."
    ],
    "eligibilityCriteria": [
      {
        "id": "class_criteria",
        "label": "Passed Class VIII with minimum 55% marks (50% for SC/ST) from a Government, Local Body, or Government-aided school.",
        "mandatory": true,
        "field": "educationLevel",
        "operator": "in",
        "value": [
          "Class 8",
          "Class 9",
          "Class 10",
          "Class 11",
          "Class 12",
          "Student"
        ]
      },
      {
        "id": "income_limit",
        "label": "Parental annual income from all sources must not exceed ₹3,50,000.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 350000
      },
      {
        "id": "nmms_exam",
        "label": "Must qualify the state-level National Means-cum-Merit Scholarship Selection Test (MAT & SAT).",
        "mandatory": true,
        "field": "qualifiedNMMSS",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Student Aadhaar Card (Mandatory)",
      "Class 7 & Class 8 Marksheets verified by school head",
      "Income Certificate issued by competent Revenue Authority (< ₹3.5 Lakh)",
      "Caste / Category Certificate (for SC/ST reservation)",
      "Active bank passbook in the student’s name linked to Aadhaar",
      "Bonafide Student Certificate issued by school principal"
    ],
    "applicationSteps": [
      "Register for One Time Registration (OTR) on the National Scholarship Portal (scholarships.gov.in).",
      "Select \"Department of School Education & Literacy\" -> \"National Means-cum-Merit Scholarship\".",
      "Fill in student academic credentials, school U-DISE code, and bank details.",
      "Upload verified income certificate and marks certificate.",
      "Submit form; Institute Nodal Officer (INO) and District Nodal Officer (DNO) verify and disburse via DBT."
    ],
    "applicationMode": "Online via National Scholarship Portal (NSP)",
    "officialLink": "https://scholarships.gov.in",
    "sourceAuthority": "Ministry of Education, National Scholarship Portal (scholarships.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 12,
    "maxAge": 19,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "pm-usp-college-university-scholarship",
    "slug": "pm-usp-college-university-scholarship",
    "name": "PM-USP Central Sector Scheme of Scholarship for College and University Students",
    "shortName": "PM-USP College Scholarship",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Higher Education, Ministry of Education",
    "description": "A merit-cum-means scholarship providing ₹12,000/year for undergraduate study and ₹20,000/year for postgraduate study to meritorious students who scored above the 80th percentile in Class 12 board examinations.",
    "targetBeneficiaries": [
      "Undergraduate College Students",
      "Postgraduate University Students",
      "Meritorious College Youth"
    ],
    "benefits": [
      "₹12,000 per annum for the first three years of undergraduate college education.",
      "₹20,000 per annum for 4th & 5th year professional degree courses and postgraduate studies.",
      "Direct Benefit Transfer (DBT) directly into the student bank account.",
      "Annual renewal upon securing at least 50% marks and 75% attendance."
    ],
    "eligibilityCriteria": [
      {
        "id": "board_percentile",
        "label": "Must have scored above the 80th percentile in the relevant stream from the State/Central Board of Examination in Class 12.",
        "mandatory": true,
        "field": "boardPercentile",
        "operator": "gte",
        "value": 80
      },
      {
        "id": "income_cap",
        "label": "Gross family annual income from all sources must not exceed ₹4,50,000.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 450000
      },
      {
        "id": "regular_degree",
        "label": "Must be enrolled in regular full-time undergraduate or postgraduate degree courses in recognized colleges/universities.",
        "mandatory": true,
        "field": "isRegularStudent",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Class 12 Board Marksheet & Passing Certificate",
      "Annual Family Income Certificate issued by Tahsildar / Revenue Authority (< ₹4.5 Lakh)",
      "College Admission Fee Receipt & Bonafide Certificate",
      "Student Aadhaar Card linked to active bank account",
      "College ID Card"
    ],
    "applicationSteps": [
      "Complete One Time Registration (OTR) on the National Scholarship Portal (scholarships.gov.in).",
      "Select \"Department of Higher Education\" -> \"Central Sector Scheme of Scholarship for College and University Students\".",
      "Input Class 12 roll number, passing year, board name, and college admission credentials.",
      "College Nodal Officer verifies enrollment and admission through NSP portal.",
      "State Nodal Officer validates and DBT grant is sanctioned."
    ],
    "applicationMode": "Online via National Scholarship Portal (NSP)",
    "officialLink": "https://scholarships.gov.in",
    "sourceAuthority": "Department of Higher Education (education.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 17,
    "maxAge": 25,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "aicte-pragati-scholarship-girls",
    "slug": "aicte-pragati-scholarship-girls",
    "name": "AICTE Pragati Scholarship Scheme for Girl Students (Degree & Diploma)",
    "shortName": "AICTE Pragati Scholarship",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "All India Council for Technical Education (AICTE), Ministry of Education",
    "description": "Empowers meritorious female students pursuing technical education (Engineering, Architecture, Pharmacy, Diploma) with ₹50,000 per annum towards college tuition, books, computers, and educational software.",
    "targetBeneficiaries": [
      "Female Engineering & Technology Students",
      "Girl Students in Technical Diplomas",
      "Women in STEM"
    ],
    "benefits": [
      "Grant of ₹50,000 per annum for every year of technical study (max 4 years for Degree, 3 years for Diploma).",
      "Amount can be utilized for college fees, purchase of laptops, books, and educational devices.",
      "Guaranteed scholarship for up to two girl children per eligible family."
    ],
    "eligibilityCriteria": [
      {
        "id": "gender_female",
        "label": "Must be a female student admitted to 1st year (or 2nd year lateral entry) of an AICTE-approved Technical Degree or Diploma course.",
        "mandatory": true,
        "field": "gender",
        "operator": "eq",
        "value": "Female"
      },
      {
        "id": "family_income",
        "label": "Total family income must not exceed ₹8,00,000 per annum.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 800000
      },
      {
        "id": "counseling_admission",
        "label": "Admission must be secured through centralized counseling process of state or central government.",
        "mandatory": true,
        "field": "centralCounselingAdmission",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Class 10 and Class 12 mark sheets",
      "Seat Allotment Letter issued by Centralized Counseling Authority",
      "Tuition fee receipt paid to the technical institution",
      "Annual Family Income Certificate (< ₹8 Lakh) issued by Tehsildar / SDM",
      "Aadhaar seeded bank account passbook in student name",
      "Declaration by parents stating not more than two girl children are availing the scheme"
    ],
    "applicationSteps": [
      "Register on the National Scholarship Portal (scholarships.gov.in).",
      "Navigate to AICTE schemes and select \"PRAGATI Scholarship Scheme for Girl Students\".",
      "Fill in personal, academic, institution, and fee payment details.",
      "Institute Nodal Officer conducts digital scrutiny of credentials.",
      "AICTE processes sanction and credits funds directly into student bank account."
    ],
    "applicationMode": "Online via National Scholarship Portal (NSP)",
    "officialLink": "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
    "sourceAuthority": "All India Council for Technical Education (aicte-india.org)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 16,
    "maxAge": 26,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "post-matric-scholarship-sc-st",
    "slug": "post-matric-scholarship-sc-st",
    "name": "Centrally Sponsored Post Matric Scholarship Scheme for SC/ST Students",
    "shortName": "Post Matric SC/ST Scholarship",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Social Justice & Empowerment / Ministry of Tribal Affairs",
    "description": "Provides comprehensive financial coverage including 100% compulsory non-refundable college fees reimbursement and monthly maintenance allowances to Scheduled Caste and Scheduled Tribe students studying at post-matriculation stages.",
    "targetBeneficiaries": [
      "SC/ST Students in Class 11-12",
      "SC/ST College & University Students",
      "Polytechnic, ITI & Medical/Engineering Students"
    ],
    "benefits": [
      "Full reimbursement of compulsory non-refundable tuition and examination fees.",
      "Monthly maintenance allowance ranging from ₹4,000 to ₹13,500 per year depending on course classification.",
      "Additional allowances for book grants, study tours, and special disability equipment."
    ],
    "eligibilityCriteria": [
      {
        "id": "caste_category",
        "label": "Must belong to Scheduled Caste (SC) or Scheduled Tribe (ST) community.",
        "mandatory": true,
        "field": "casteCategory",
        "operator": "in",
        "value": [
          "SC",
          "ST"
        ]
      },
      {
        "id": "income_limit",
        "label": "Total family income from all sources must not exceed ₹2,50,000 per annum.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 250000
      },
      {
        "id": "post_matric_study",
        "label": "Must be enrolled in recognized post-matriculation courses (Class 11, 12, ITI, Diploma, Graduation, Post-Graduation).",
        "mandatory": true,
        "field": "isEnrolledPostMatric",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Caste Certificate issued by authorized revenue officer (Tahsildar/SDM)",
      "Income Certificate issued by competent revenue authority (< ₹2.5 Lakh)",
      "Previous examination mark sheets (Class 10 / 12 / Degree)",
      "Current year college fee receipt and admission bonafide certificate",
      "Aadhaar card linked with active bank passbook"
    ],
    "applicationSteps": [
      "Apply online on your State Scholarship Portal (e.g. SSP Karnataka, Mahadbt, Digital Gujarat) or National Scholarship Portal.",
      "Enter Caste Certificate RD number and Income Certificate number for digital validation.",
      "Enter college admission registration number and course details.",
      "College scrutiny committee verifies student enrollment and fee structure.",
      "State Welfare Department releases fee directly to institution and maintenance allowance to student account."
    ],
    "applicationMode": "Online via State Scholarship Portals & NSP",
    "officialLink": "https://socialjustice.gov.in",
    "sourceAuthority": "Ministry of Social Justice & Empowerment (socialjustice.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 15,
    "maxAge": 35,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "pm-yasasvi-scholarship",
    "slug": "pm-yasasvi-scholarship",
    "name": "PM Young Achievers Scholarship Award Scheme for Vibrant India (PM-YASASVI)",
    "shortName": "PM-YASASVI Scholarship",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Social Justice and Empowerment / National Testing Agency (NTA)",
    "description": "Top-class scholarship scheme for Other Backward Classes (OBC), Economically Backward Classes (EBC), and De-Notified Nomadic Tribes (DNT) students providing up to ₹1,25,000 per year for schooling and college education.",
    "targetBeneficiaries": [
      "OBC, EBC, DNT Students in Class 9 to 12",
      "Top-Class College Students from OBC/EBC Categories"
    ],
    "benefits": [
      "Up to ₹75,000 per annum for Class 9 and 10 students.",
      "Up to ₹1,25,000 per annum for Class 11 and 12 students covering school tuition and hostel fees.",
      "Full tuition and non-refundable fees reimbursement for students in empanelled top colleges (IITs, IIMs, NITs, AIIMS)."
    ],
    "eligibilityCriteria": [
      {
        "id": "category_yasasvi",
        "label": "Must belong to OBC, EBC, or DNT category.",
        "mandatory": true,
        "field": "category",
        "operator": "in",
        "value": [
          "OBC",
          "EBC",
          "DNT"
        ]
      },
      {
        "id": "income_yasasvi",
        "label": "Annual family income must not exceed ₹2,50,000.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 250000
      },
      {
        "id": "top_school",
        "label": "Studying in identified Top Class Schools or selected through NTA YASASVI test.",
        "mandatory": true,
        "field": "isEnrolledYasasvi",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "OBC / EBC / DNT Category Certificate",
      "Income Certificate (< ₹2.5 Lakh)",
      "Previous year marksheet (min 60% marks)",
      "Aadhaar Card linked to active bank account",
      "School / College Bonafide Letter"
    ],
    "applicationSteps": [
      "Register on NSP (scholarships.gov.in) under PM-YASASVI scheme.",
      "Provide academic credentials and upload category and income documents.",
      "Institute verifies student profile; Ministry sanctions grant directly via DBT."
    ],
    "applicationMode": "Online via National Scholarship Portal (NSP)",
    "officialLink": "https://yet.nta.ac.in",
    "sourceAuthority": "Ministry of Social Justice and Empowerment (socialjustice.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 13,
    "maxAge": 22,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "inspire-she-scholarship",
    "slug": "inspire-she-scholarship",
    "name": "INSPIRE Scholarship for Higher Education (SHE)",
    "shortName": "INSPIRE Scholarship (SHE)",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Science and Technology (DST), Ministry of Science & Technology",
    "description": "Prestigious national scholarship encouraging young talent to pursue research in Natural & Basic Sciences (B.Sc., B.S., Integrated M.Sc.) providing ₹80,000 per year.",
    "targetBeneficiaries": [
      "Top 1% Class 12 Science Students",
      "KVPY / JEE / NEET Top Rankers Pursuing Pure Sciences"
    ],
    "benefits": [
      "Total annual scholarship of ₹80,000 (₹60,000 direct cash + ₹20,000 mentorship grant for summer research projects).",
      "Supported for a maximum duration of 5 years (B.Sc. through M.Sc.).",
      "Opportunity to undertake summer research under leading Indian scientists."
    ],
    "eligibilityCriteria": [
      {
        "id": "top_1_percent",
        "label": "Ranked in the top 1% in Class 12 board examination in Science stream, or top 10,000 in JEE/NEET.",
        "mandatory": true,
        "field": "isTopScienceStudent",
        "operator": "eq",
        "value": true
      },
      {
        "id": "pure_science_course",
        "label": "Pursuing regular Natural/Basic Science courses (Physics, Chemistry, Maths, Biology, Geology, etc.).",
        "mandatory": true,
        "field": "isPureScienceCourse",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Class 12 Marksheet & Passing Certificate",
      "Endorsement Certificate from College Principal / University Registrar",
      "Aadhaar-seeded State Bank of India (SBI) Account Passbook",
      "Class 10 Certificate for date of birth"
    ],
    "applicationSteps": [
      "Apply online on the INSPIRE Web Portal (online-inspire.gov.in).",
      "Upload Class 12 advisory note/marksheet and college admission receipt.",
      "DST conducts evaluation and publishes shortlist; scholarship released directly to SBI account."
    ],
    "applicationMode": "Online via INSPIRE Portal (online-inspire.gov.in)",
    "officialLink": "https://online-inspire.gov.in",
    "sourceAuthority": "Department of Science and Technology (dst.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 17,
    "maxAge": 22,
    "occupations": [
      "Student",
      "Researcher"
    ]
  },
  {
    "id": "begum-hazrat-mahal-scholarship",
    "slug": "begum-hazrat-mahal-scholarship",
    "name": "Begum Hazrat Mahal National Scholarship for Minority Girls",
    "shortName": "Begum Hazrat Mahal Scholarship",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "Maulana Azad Education Foundation, Ministry of Minority Affairs",
    "description": "Financial assistance to meritorious girl students belonging to economically weaker sections of notified National Minority Communities studying in Classes 9th to 12th.",
    "targetBeneficiaries": [
      "Minority Girl Students in Class 9-12 (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)"
    ],
    "benefits": [
      "₹6,000 per annum for Classes 9 and 10.",
      "₹12,000 per annum for Classes 11 and 12.",
      "Direct DBT credit to student bank account to support school fees, uniforms, and textbooks."
    ],
    "eligibilityCriteria": [
      {
        "id": "minority_community",
        "label": "Belongs to notified minority community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).",
        "mandatory": true,
        "field": "isMinority",
        "operator": "eq",
        "value": true
      },
      {
        "id": "female_student",
        "label": "Must be a female student with at least 50% marks in previous class.",
        "mandatory": true,
        "field": "gender",
        "operator": "eq",
        "value": "Female"
      },
      {
        "id": "minority_income",
        "label": "Annual parental income from all sources must not exceed ₹2,00,000.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 200000
      }
    ],
    "requiredDocuments": [
      "Previous class marksheet signed by school principal",
      "Minority community self-declaration / certificate",
      "Income Certificate (< ₹2 Lakh)",
      "School verification certificate",
      "Aadhaar card and bank account details"
    ],
    "applicationSteps": [
      "Apply through National Scholarship Portal (scholarships.gov.in).",
      "Upload school certificate, self-declaration, and income proof.",
      "School head and district officer verify before DBT disbursement."
    ],
    "applicationMode": "Online via National Scholarship Portal (NSP)",
    "officialLink": "https://scholarships.gov.in",
    "sourceAuthority": "Ministry of Minority Affairs (minorityaffairs.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 13,
    "maxAge": 19,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "aicte-saksham-scholarship",
    "slug": "aicte-saksham-scholarship",
    "name": "AICTE Saksham Scholarship Scheme for Specially-Abled Students",
    "shortName": "AICTE Saksham (Divyangjan)",
    "sector": "Education & Scholarships",
    "type": "Central",
    "state": "All India",
    "authority": "All India Council for Technical Education (AICTE)",
    "description": "Special technical education scholarship for differently-abled students with disability not less than 40% pursuing technical degree or diploma courses.",
    "targetBeneficiaries": [
      "Specially-abled Students Pursuing Engineering / Technology / Pharmacy Diplomas and Degrees"
    ],
    "benefits": [
      "₹50,000 per annum for every year of technical study.",
      "Covers tuition fees, books, laptops, assistive devices, and examination fees."
    ],
    "eligibilityCriteria": [
      {
        "id": "disability_percentage",
        "label": "Specially-abled student having disability of not less than 40% (UDID card or medical certificate).",
        "mandatory": true,
        "field": "hasDisabilityCertificate",
        "operator": "eq",
        "value": true
      },
      {
        "id": "saksham_income",
        "label": "Family annual income must not exceed ₹8,00,000.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 800000
      },
      {
        "id": "aicte_admission",
        "label": "Admitted to 1st year or lateral entry in AICTE approved college.",
        "mandatory": true,
        "field": "isAICTEEnrolled",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "UDID Card / Disability Certificate issued by Competent Medical Authority",
      "Class 10 and 12 / Diploma mark sheets",
      "Annual Income Certificate (< ₹8 Lakh)",
      "Admission fee receipt",
      "Aadhaar-seeded bank account details"
    ],
    "applicationSteps": [
      "Apply online on the National Scholarship Portal (scholarships.gov.in).",
      "Attach disability certificate and college enrollment verification.",
      "Scrutinized by college and sanctioned by AICTE directly via DBT."
    ],
    "applicationMode": "Online via National Scholarship Portal (NSP)",
    "officialLink": "https://www.aicte-india.org",
    "sourceAuthority": "AICTE (aicte-india.org)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Possibly Eligible",
    "minAge": 16,
    "maxAge": 30,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "gruha-lakshmi-karnataka",
    "slug": "gruha-lakshmi-karnataka",
    "name": "Gruha Lakshmi Scheme (Karnataka)",
    "shortName": "Gruha Lakshmi",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "State",
    "state": "Karnataka",
    "authority": "Department of Women & Child Development, Government of Karnataka",
    "description": "State welfare flagship program providing monthly financial assistance of ₹2,000 to the woman head of eligible households holding Antyodaya, BPL, or APL ration cards in Karnataka.",
    "targetBeneficiaries": [
      "Women Head of Households",
      "BPL / Antyodaya / APL Cardholders in Karnataka"
    ],
    "benefits": [
      "Monthly direct transfer of ₹2,000 directly into the bank account of woman head of household.",
      "Promotes female financial autonomy and household purchasing power."
    ],
    "eligibilityCriteria": [
      {
        "id": "resident",
        "label": "Resident woman of Karnataka.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "head_of_family",
        "label": "Must be designated as the woman head of the family in the Ration Card.",
        "mandatory": true,
        "field": "isHeadOfFamily",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar card of the woman head of household",
      "Husband’s Aadhaar card (if married)",
      "Ration card (APL, BPL, or Antyodaya)",
      "Bank passbook linked to Aadhaar (Aadhaar seeded DBT account)"
    ],
    "applicationSteps": [
      "Visit nearest Grama One, Karnataka One, or Bangalore One center or apply via Seva Sindhu portal.",
      "Present Ration Card and Aadhaar cards of head of family and husband.",
      "Submit biometrics or OTP for verification.",
      "Receive application acknowledgment with tracking number."
    ],
    "applicationMode": "Online (Seva Sindhu) & Offline (Grama One / Karnataka One)",
    "officialLink": "https://sevasindhu.karnataka.gov.in",
    "sourceAuthority": "Karnataka Seva Sindhu Portal",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 80,
    "occupations": [
      "Homemaker",
      "Self Employed",
      "Informal Sector"
    ]
  },
  {
    "id": "sukanya-samriddhi-yojana",
    "slug": "sukanya-samriddhi-yojana",
    "name": "Sukanya Samriddhi Yojana (SSY)",
    "shortName": "Sukanya Samriddhi",
    "sector": "Child Welfare & Girls Education",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Posts / Ministry of Finance, Government of India",
    "description": "A government-backed savings scheme targeted at parents of girl children encouraging savings for the future education and marriage expenses with high interest rates and Section 80C tax exemption.",
    "targetBeneficiaries": [
      "Parents / Legal Guardians of Girl Child under 10 years of age"
    ],
    "benefits": [
      "Competitive government-set interest rate (currently 8.2% p.a., compounded annually).",
      "Triple tax benefit under Section 80C: Exempt-Exempt-Exempt (EEE).",
      "Partial withdrawal up to 50% permitted after girl reaches 18 years for higher education.",
      "Minimum deposit of only ₹250 per financial year; maximum ₹1,50,000."
    ],
    "eligibilityCriteria": [
      {
        "id": "girl_age",
        "label": "Girl child must be an Indian citizen under the age of 10 years at the time of account opening.",
        "mandatory": true,
        "field": "childAge",
        "operator": "lte",
        "value": 10
      }
    ],
    "requiredDocuments": [
      "Birth Certificate of the girl child",
      "Identity and Address Proof of parent/guardian (Aadhaar Card, PAN Card)",
      "Medical certificate in case of twins/triplets",
      "Passport size photographs of child and guardian"
    ],
    "applicationSteps": [
      "Collect Form 1 from any Post Office or authorized commercial bank branch (SBI, PNB, BoB, etc.).",
      "Fill in child and guardian details and attach girl child birth certificate.",
      "Deposit the opening amount (minimum ₹250) via cash, cheque, or demand draft.",
      "Obtain the SSY Passbook containing account details."
    ],
    "applicationMode": "Offline at Post Offices & Authorized Bank Branches",
    "officialLink": "https://www.indiapost.gov.in",
    "sourceAuthority": "Department of Posts, Ministry of Communications",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Ineligible",
    "minAge": 0,
    "maxAge": 10,
    "occupations": [
      "Any",
      "Student",
      "Child"
    ]
  },
  {
    "id": "pm-matru-vandana-yojana",
    "slug": "pm-matru-vandana-yojana",
    "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY 2.0)",
    "shortName": "PMMVY (Matru Vandana)",
    "sector": "Women Welfare & Maternal Health",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Women and Child Development, Government of India",
    "description": "Maternity benefit program providing cash incentives of ₹5,000 for the first child and ₹6,000 for the birth of a second girl child directly to the mother bank account to promote institutional delivery, child vaccination, and maternal nutrition.",
    "targetBeneficiaries": [
      "Pregnant Women",
      "Lactating Mothers",
      "Infants and Newborn Girl Children"
    ],
    "benefits": [
      "Cash benefit of ₹5,000 in two installments for the first living child upon early ANC registration and child immunization.",
      "Enhanced incentive of ₹6,000 in a single installment upon the birth of a second girl child to curb female foeticide.",
      "Direct Benefit Transfer directly into mother Aadhaar-seeded bank account.",
      "Complementary free checkups and nutritional supplements through Anganwadi centers."
    ],
    "eligibilityCriteria": [
      {
        "id": "pregnant_mother",
        "label": "Must be a pregnant woman or lactating mother aged 19 years or above.",
        "mandatory": true,
        "field": "isPregnantOrLactating",
        "operator": "eq",
        "value": true
      },
      {
        "id": "non_govt",
        "label": "Must not be in regular employment with Central/State Government or Public Sector Undertakings (PSUs).",
        "mandatory": true,
        "field": "isGovtEmployee",
        "operator": "eq",
        "value": false
      },
      {
        "id": "vulnerable_category",
        "label": "Belongs to SC/ST, holds BPL/EWS/E-Shram card, or family annual income is below ₹8 Lakh.",
        "mandatory": true,
        "field": "isVulnerableCategory",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Mother and Father Aadhaar Card",
      "Mother-Child Protection (MCP) Card issued by Health/Anganwadi worker",
      "Child Birth Certificate (for second installment / second girl child)",
      "Aadhaar-seeded bank passbook in the mother name",
      "Proof of eligibility (BPL card, E-Shram card, PM-JAY card, or Income certificate)"
    ],
    "applicationSteps": [
      "Register at nearest Anganwadi Centre (AWC) or approved health facility within 570 days of Last Menstrual Period (LMP).",
      "Alternatively, register online on the PMMVY Portal (pmmvy.wcd.gov.in) using citizen login.",
      "Fill Form 1A with MCP card details and attach Aadhaar of parents.",
      "Complete at least one Antenatal Care (ANC) checkup for first installment release.",
      "Submit child birth registration and first cycle vaccination proof for subsequent installment."
    ],
    "applicationMode": "Online (pmmvy.wcd.gov.in) & Offline (Anganwadi Centres)",
    "officialLink": "https://pmmvy.wcd.gov.in",
    "sourceAuthority": "Ministry of Women and Child Development (wcd.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 19,
    "maxAge": 45,
    "occupations": [
      "Homemaker",
      "Daily Wage Worker",
      "Informal Sector",
      "Self Employed"
    ]
  },
  {
    "id": "pm-ujjwala-yojana",
    "slug": "pm-ujjwala-yojana",
    "name": "Pradhan Mantri Ujjwala Yojana (PMUY 2.0)",
    "shortName": "PM Ujjwala (Free LPG)",
    "sector": "Women Welfare & Clean Energy",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Petroleum and Natural Gas (MoPNG)",
    "description": "Provides deposit-free LPG connections to adult women from poor households, including a free stove, first refill, and ongoing targeted subsidy of ₹300 per 14.2 kg cylinder.",
    "targetBeneficiaries": [
      "Adult Women from BPL / SECC Households",
      "SC / ST / Most Backward Classes (MBC)",
      "PM Awas Yojana Beneficiaries"
    ],
    "benefits": [
      "Completely deposit-free LPG connection including cylinder, regulator, safety hose, and domestic gas stove.",
      "First LPG refill cylinder provided free of cost.",
      "Ongoing targeted subsidy of ₹300 per refill transferred directly into the woman bank account."
    ],
    "eligibilityCriteria": [
      {
        "id": "adult_woman",
        "label": "Applicant must be an adult woman aged 18 or above from an eligible BPL/deprived household.",
        "mandatory": true,
        "field": "gender",
        "operator": "eq",
        "value": "Female"
      },
      {
        "id": "no_existing_lpg",
        "label": "No existing LPG connection in the same household.",
        "mandatory": true,
        "field": "hasLPGConnection",
        "operator": "eq",
        "value": false
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card of the applicant woman",
      "Ration Card proving family composition",
      "Aadhaar of adult family members listed in ration card",
      "Bank Account Passbook / IFSC details for DBT"
    ],
    "applicationSteps": [
      "Submit online application on pmuy.gov.in or visit local LPG distributor (Indane, BharatGas, HP Gas).",
      "Fill 14-point declaration form confirming no existing connection.",
      "Distributor validates biometric Aadhaar and issues connection within 7-10 days."
    ],
    "applicationMode": "Online (pmuy.gov.in) & At LPG Distributorships",
    "officialLink": "https://www.pmuy.gov.in",
    "sourceAuthority": "Ministry of Petroleum & Natural Gas (pmuy.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 80,
    "occupations": [
      "Homemaker",
      "Daily Wage Worker",
      "Farmer",
      "Informal Sector"
    ]
  },
  {
    "id": "mahila-samman-savings-certificate",
    "slug": "mahila-samman-savings-certificate",
    "name": "Mahila Samman Savings Certificate (MSSC)",
    "shortName": "Mahila Samman Savings",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Finance / Department of Posts",
    "description": "A dedicated small-savings scheme exclusively for women and girl children offering an attractive fixed return of 7.5% per annum for a 2-year tenure with flexible partial withdrawal.",
    "targetBeneficiaries": [
      "Women of all ages",
      "Guardians opening on behalf of minor girls"
    ],
    "benefits": [
      "Guaranteed fixed interest rate of 7.5% per annum compounded quarterly.",
      "Short 2-year tenure with deposit limits from ₹1,000 up to ₹2,00,000.",
      "Partial withdrawal up to 40% permitted after 1 year."
    ],
    "eligibilityCriteria": [
      {
        "id": "female_investor",
        "label": "Account can be opened by an individual woman for herself or by guardian on behalf of minor girl.",
        "mandatory": true,
        "field": "gender",
        "operator": "eq",
        "value": "Female"
      }
    ],
    "requiredDocuments": [
      "Application Form (Form 1)",
      "Aadhaar Card and PAN Card of the woman or guardian",
      "Birth certificate in case of minor girl child",
      "Passport size photographs"
    ],
    "applicationSteps": [
      "Visit any Post Office or authorized commercial bank branch.",
      "Fill Form 1 and submit KYC documents with cash or cheque.",
      "Receive Mahila Samman Passbook with maturity details."
    ],
    "applicationMode": "Offline at Post Offices & Authorized Banks",
    "officialLink": "https://www.indiapost.gov.in",
    "sourceAuthority": "Ministry of Finance (dea.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 90,
    "occupations": [
      "Any",
      "Homemaker",
      "Student",
      "Working Professional"
    ]
  },
  {
    "id": "pm-awas-yojana-urban",
    "slug": "pm-awas-yojana-urban",
    "name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)",
    "shortName": "PMAY-Urban",
    "sector": "Housing & Urban Poverty Alleviation",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Housing and Urban Affairs (MoHUA), Government of India",
    "description": "A national mission addressing urban housing shortages among EWS, LIG, and Middle Income Groups by providing pucca houses with basic amenities and interest subsidies.",
    "targetBeneficiaries": [
      "Economically Weaker Sections (EWS)",
      "Low Income Groups (LIG)",
      "Middle Income Groups (MIG)"
    ],
    "benefits": [
      "Interest subsidy of up to 4% on home loans up to ₹25 Lakh for tenure up to 12 years.",
      "Direct central assistance for beneficiary-led individual house construction.",
      "All houses constructed must have female co-ownership or sole female head ownership."
    ],
    "eligibilityCriteria": [
      {
        "id": "no_pucca_house",
        "label": "The beneficiary family must not own a pucca house anywhere in India in their name or name of any family member.",
        "mandatory": true,
        "field": "ownsPuccaHouse",
        "operator": "eq",
        "value": false
      }
    ],
    "requiredDocuments": [
      "Aadhaar cards of all family members",
      "Proof of identity and address (Voter ID, Electricity bill)",
      "Income Certificate issued by competent revenue authority",
      "Affidavit affirming no pucca house ownership in India",
      "Bank account statement and IFSC details"
    ],
    "applicationSteps": [
      "Visit the official PMAY portal (pmaymis.gov.in) or visit your local Urban Local Body (Municipality/Corporation).",
      "Select \"Citizen Assessment\" and choose relevant component.",
      "Enter Aadhaar number and complete OTP authentication.",
      "Fill in family details, existing housing status, income details, and bank account.",
      "Save and print assessment reference slip for municipal verification."
    ],
    "applicationMode": "Online & Urban Local Bodies (Municipalities)",
    "officialLink": "https://pmaymis.gov.in",
    "sourceAuthority": "Ministry of Housing and Urban Affairs (pmaymis.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Possibly Eligible",
    "minAge": 21,
    "maxAge": 70,
    "occupations": [
      "Salaried",
      "Self Employed",
      "Informal Worker",
      "Shopkeeper"
    ]
  },
  {
    "id": "pm-awas-yojana-gramin",
    "slug": "pm-awas-yojana-gramin",
    "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    "shortName": "PMAY-Gramin (Rural Housing)",
    "sector": "Housing & Urban Poverty Alleviation",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Rural Development, Government of India",
    "description": "Provides direct financial grant assistance to homeless rural households and those living in kutcha/dilapidated houses to construct a permanent 25 sq.mt pucca house with basic amenities.",
    "targetBeneficiaries": [
      "Rural Houseless Families",
      "Kutcha House Dwellers identified in Awaas+ list",
      "SC/ST/Minority Rural Families"
    ],
    "benefits": [
      "Direct grant of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult/North-Eastern areas.",
      "Additional 90-95 person-days of unskilled wage under MGNREGS (approx. ₹25,000).",
      "Assistance of ₹12,000 for toilet construction under Swachh Bharat Mission (Grameen)."
    ],
    "eligibilityCriteria": [
      {
        "id": "rural_kutcha",
        "label": "Identified in SECC 2011 deprivation list or verified Awaas+ survey living in kutcha house.",
        "mandatory": true,
        "field": "isRuralKutchaDweller",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card of head and family members",
      "MGNREGA Job Card Number",
      "Bank Account Passbook",
      "Land allotment certificate / patta"
    ],
    "applicationSteps": [
      "Identification done by Gram Sabha and Block Development Office through Awaas+ app.",
      "Gram Panchayat uploads geotagged photos of existing kutcha house.",
      "Sanction order issued; funds transferred directly in 3 installments tied to construction stages."
    ],
    "applicationMode": "Through Gram Panchayat & Block Development Office",
    "officialLink": "https://pmayg.nic.in",
    "sourceAuthority": "Ministry of Rural Development (pmayg.nic.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 80,
    "occupations": [
      "Farmer",
      "Daily Wage Worker",
      "Artisan",
      "Rural Worker"
    ]
  },
  {
    "id": "pm-surya-ghar-muft-bijli",
    "slug": "pm-surya-ghar-muft-bijli",
    "name": "PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar Scheme)",
    "shortName": "PM Surya Ghar",
    "sector": "Renewable Energy & Utilities",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of New and Renewable Energy (MNRE), Government of India",
    "description": "A nationwide initiative offering direct financial subsidies up to ₹78,000 to install rooftop solar panels for residential households, providing up to 300 units of free electricity every month and income by selling surplus power back to the grid.",
    "targetBeneficiaries": [
      "Residential Households",
      "Homeowners",
      "Middle & Lower Income Families"
    ],
    "benefits": [
      "Direct subsidy of ₹30,000 for 1 kW system, ₹60,000 for 2 kW system, and ₹78,000 for 3 kW or higher systems.",
      "Up to 300 units of free electricity each month, drastically reducing household electricity bills.",
      "Collateral-free low-interest loans available from public sector banks at approximately 7% interest rate.",
      "Sell surplus generated power back to local DISCOM through net metering."
    ],
    "eligibilityCriteria": [
      {
        "id": "resident_home",
        "label": "Must be an Indian citizen with a residential home suitable for rooftop solar installation.",
        "mandatory": true,
        "field": "ownsResidentialRoof",
        "operator": "eq",
        "value": true
      },
      {
        "id": "active_meter",
        "label": "Must possess an active domestic electricity connection in the applicant name.",
        "mandatory": true,
        "field": "hasElectricityConnection",
        "operator": "eq",
        "value": true
      },
      {
        "id": "no_prior_solar",
        "label": "Must not have availed any previous central government solar rooftop subsidy for the same connection.",
        "mandatory": true,
        "field": "hasPriorSolarSubsidy",
        "operator": "eq",
        "value": false
      }
    ],
    "requiredDocuments": [
      "Recent electricity bill (last 2 months) showing consumer number",
      "Aadhaar card of the electricity connection holder",
      "Proof of ownership of property / house tax receipt",
      "Cancelled bank cheque / Bank passbook copy for subsidy DBT transfer",
      "Photographs of the available rooftop space"
    ],
    "applicationSteps": [
      "Register on the national portal at pmsuryaghar.gov.in with state, DISCOM name, and electricity consumer account number.",
      "Apply for Rooftop Solar installation approval with estimated system capacity (1 kW - 3 kW+).",
      "Receive DISCOM technical feasibility approval and choose registered vendor.",
      "Vendor completes installation; DISCOM installs bidirectional net meter.",
      "Submit commissioning certificate and bank details on the portal; subsidy credited within 30 days."
    ],
    "applicationMode": "Online via National Portal (pmsuryaghar.gov.in)",
    "officialLink": "https://pmsuryaghar.gov.in",
    "sourceAuthority": "Ministry of New and Renewable Energy (pmsuryaghar.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 80,
    "occupations": [
      "Homeowner",
      "Salaried",
      "Self Employed",
      "Retired",
      "Farmer",
      "Any"
    ]
  },
  {
    "id": "jal-jeevan-mission",
    "slug": "jal-jeevan-mission",
    "name": "Jal Jeevan Mission (Har Ghar Jal)",
    "shortName": "Jal Jeevan Mission",
    "sector": "Renewable Energy & Utilities",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Drinking Water and Sanitation, Ministry of Jal Shakti",
    "description": "Ensures functional household tap connections (FHTC) providing safe and adequate drinking water at the service level of 55 liters per capita per day to every rural household across India.",
    "targetBeneficiaries": [
      "All Rural Households",
      "Village Communities",
      "Anganwadi and Rural School Children"
    ],
    "benefits": [
      "Clean potable tap water supplied directly into the rural home.",
      "Eliminates drudgery of carrying water from distant sources for rural women.",
      "Continuous water quality testing via community field test kits (FTKs)."
    ],
    "eligibilityCriteria": [
      {
        "id": "rural_resident",
        "label": "Household residing in rural areas without existing piped tap connection.",
        "mandatory": true,
        "field": "isRuralResident",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Ration Card / Family ID",
      "Village residential proof"
    ],
    "applicationSteps": [
      "Implemented on a village habitation basis by Village Water and Sanitation Committee (VWSC) / Pani Samiti.",
      "Register requirement through local Gram Panchayat or JJM citizen grievance portal."
    ],
    "applicationMode": "Through Gram Panchayat / Village Pani Samiti",
    "officialLink": "https://jaljeevanmission.gov.in",
    "sourceAuthority": "Ministry of Jal Shakti (jaljeevanmission.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 100,
    "occupations": [
      "Rural Resident",
      "Farmer",
      "Homemaker"
    ]
  },
  {
    "id": "pm-svanidhi",
    "slug": "pm-svanidhi",
    "name": "PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)",
    "shortName": "PM SVANidhi",
    "sector": "Microfinance & Street Vendors",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Housing and Urban Affairs (MoHUA)",
    "description": "Special micro-credit facility providing affordable collateral-free working capital loans to street vendors to resume livelihoods, with subsidized interest rates and digital cashback rewards.",
    "targetBeneficiaries": [
      "Urban & Peri-Urban Street Vendors",
      "Hawkers",
      "Thela / Cart Vendors"
    ],
    "benefits": [
      "First tranche: Collateral-free working capital loan up to ₹10,000.",
      "Second tranche: Up to ₹20,000 upon timely repayment; Third tranche up to ₹50,000.",
      "Interest subsidy of 7% credited quarterly directly into the vendor bank account.",
      "Cashback incentive up to ₹1,200 per year for conducting digital transactions."
    ],
    "eligibilityCriteria": [
      {
        "id": "vending_status",
        "label": "Possess Certificate of Vending (CoV) / Identity Card issued by Urban Local Bodies (ULBs).",
        "mandatory": true,
        "field": "isStreetVendor",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card linked to active mobile number",
      "Voter ID Card",
      "Certificate of Vending (CoV) or Letter of Recommendation (LoR) from ULB",
      "Bank Account passbook with IFSC code"
    ],
    "applicationSteps": [
      "Visit pmsvanidhi.mohua.gov.in or apply via local Banking Correspondent / ULB center.",
      "Enter Aadhaar linked mobile number to verify via OTP.",
      "Select Vendor Category (Holding CoV or requiring LoR).",
      "Choose preferred Lending Institution (Public/Private Bank, SHG, NBFC).",
      "Upload required documents and submit."
    ],
    "applicationMode": "Online & Common Service Centers / ULB Help Desks",
    "officialLink": "https://pmsvanidhi.mohua.gov.in",
    "sourceAuthority": "Ministry of Housing and Urban Affairs (pmsvanidhi.mohua.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Not Enough Information",
    "minAge": 18,
    "maxAge": 65,
    "occupations": [
      "Street Vendor",
      "Hawker",
      "Artisan",
      "Self Employed"
    ]
  },
  {
    "id": "pm-mudra-yojana",
    "slug": "pm-mudra-yojana",
    "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
    "shortName": "Mudra Loan (PMMY)",
    "sector": "Microfinance & MSME",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Financial Services, Ministry of Finance",
    "description": "Offers collateral-free business loans up to ₹20 Lakh to non-corporate, non-farm small and micro enterprises across Shishu, Kishore, Tarun, and Tarun Plus tiers.",
    "targetBeneficiaries": [
      "Small Shopkeepers",
      "Artisans",
      "Micro Manufacturers",
      "Service Unit Providers",
      "Women Entrepreneurs"
    ],
    "benefits": [
      "Shishu: Loans up to ₹50,000 for early starters.",
      "Kishore: Loans from ₹50,000 up to ₹5,00,000.",
      "Tarun: Loans from ₹5,00,000 up to ₹10,00,000; Tarun Plus up to ₹20,00,000 for repeat borrowers.",
      "Zero collateral or third-party guarantee required."
    ],
    "eligibilityCriteria": [
      {
        "id": "business_nature",
        "label": "Non-farm micro or small business enterprise involved in manufacturing, processing, trading, or services.",
        "mandatory": true,
        "field": "isNonFarmBusiness",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "MUDRA Application Form",
      "Proof of Identity & Business Address (Udyam Registration, GST, Trade License)",
      "Bank statement for the last 6 months",
      "Project report and estimated quotation for machinery/equipment"
    ],
    "applicationSteps": [
      "Apply online via UdyamiMitra Portal (udyamimitra.in) or visit any commercial/Gramin bank branch.",
      "Select loan category and submit business proposal with quotations.",
      "Bank sanctions loan and issues MUDRA RuPay Card for drawing working capital."
    ],
    "applicationMode": "Online (udyamimitra.in) & All Commercial/Cooperative Banks",
    "officialLink": "https://www.mudra.org.in",
    "sourceAuthority": "Micro Units Development & Refinance Agency (mudra.org.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 65,
    "occupations": [
      "Shopkeeper",
      "Self Employed",
      "Trader",
      "Artisan",
      "Manufacturer"
    ]
  },
  {
    "id": "pm-vishwakarma-scheme",
    "slug": "pm-vishwakarma-scheme",
    "name": "PM Vishwakarma Scheme (Support for Traditional Artisans)",
    "shortName": "PM Vishwakarma",
    "sector": "Microfinance & Artisans",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Micro, Small and Medium Enterprises (MoMSME)",
    "description": "Comprehensive end-to-end support for traditional artisans and craftspeople across 18 family-based trades, providing recognition, skill training, toolkits, and low-interest collateral-free credit.",
    "targetBeneficiaries": [
      "Carpenters",
      "Blacksmiths",
      "Potters",
      "Sculptors",
      "Cobblers",
      "Masons",
      "Barbers",
      "Tailors",
      "Traditional Artisans"
    ],
    "benefits": [
      "PM Vishwakarma Digital Certificate and ID Card.",
      "Skill upgradation: 5-7 days basic training with ₹500/day stipend.",
      "Toolkit incentive of ₹15,000 credited directly via e-RUPI / DBT.",
      "Collateral-free enterprise loan: ₹1 Lakh first tranche, ₹2 Lakh second tranche at deeply subsidized 5% interest rate."
    ],
    "eligibilityCriteria": [
      {
        "id": "traditional_trade",
        "label": "Practicing one of the 18 notified traditional artisan/craft trades using hands and tools.",
        "mandatory": true,
        "field": "isTraditionalArtisan",
        "operator": "eq",
        "value": true
      },
      {
        "id": "min_age_vishwakarma",
        "label": "Minimum age of 18 years on the date of application; limited to one member per family.",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 18
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card linked to active mobile number",
      "Bank Account Passbook",
      "Ration Card for family verification",
      "Trade-specific tools photo or workshop verification"
    ],
    "applicationSteps": [
      "Visit nearest Common Service Center (CSC) to register on pmvishwakarma.gov.in.",
      "Complete biometric authentication and select your craft trade.",
      "Three-tier verification by Gram Panchayat, District Committee, and State Committee.",
      "Complete basic training, collect toolkit voucher, and apply for loan tranche."
    ],
    "applicationMode": "Common Service Centers (CSCs) via pmvishwakarma.gov.in",
    "officialLink": "https://pmvishwakarma.gov.in",
    "sourceAuthority": "Ministry of MSME (pmvishwakarma.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 70,
    "occupations": [
      "Artisan",
      "Carpenter",
      "Blacksmith",
      "Potter",
      "Mason",
      "Tailor",
      "Barber",
      "Cobbler"
    ]
  },
  {
    "id": "pm-kaushal-vikas-yojana",
    "slug": "pm-kaushal-vikas-yojana",
    "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
    "shortName": "PMKVY (Skill India)",
    "sector": "Education & Employment",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Skill Development and Entrepreneurship (MSDE)",
    "description": "The flagship skill certification scheme providing industry-aligned free vocational training, placement assistance, and NSDC certification in high-demand modern technology and industrial trades.",
    "targetBeneficiaries": [
      "Unemployed Youth",
      "School / College Dropouts",
      "Citizens seeking career transition"
    ],
    "benefits": [
      "100% free technical and soft-skills training aligned with National Skills Qualification Framework (NSQF).",
      "Recognized Government of India skill certificate and skill badge on Skill India Digital portal.",
      "Monetary reward and post-placement support allowance upon successful certification."
    ],
    "eligibilityCriteria": [
      {
        "id": "citizen_youth",
        "label": "Indian national aged between 15 and 45 years possessing Aadhaar card and verified mobile.",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 15
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Bank Account Passbook",
      "Educational certificate (10th/12th/Graduation or dropout declaration)"
    ],
    "applicationSteps": [
      "Register on Skill India Digital portal (skillindiadigital.gov.in).",
      "Browse and select nearest Pradhan Mantri Kaushal Kendra (PMKK) or course batch.",
      "Undergo classroom and practical training, pass third-party assessment, and receive job placement assistance."
    ],
    "applicationMode": "Online (skillindiadigital.gov.in) & at PMKK Training Centres",
    "officialLink": "https://www.pmkvyofficial.org",
    "sourceAuthority": "National Skill Development Corporation (NSDC)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 15,
    "maxAge": 45,
    "occupations": [
      "Student",
      "Youth",
      "Unemployed",
      "Technician"
    ]
  },
  {
    "id": "stand-up-india-scheme",
    "slug": "stand-up-india-scheme",
    "name": "Stand-Up India Scheme for SC, ST and Women Entrepreneurs",
    "shortName": "Stand-Up India",
    "sector": "Microfinance & Entrepreneurship",
    "type": "Central",
    "state": "All India",
    "authority": "Small Industries Development Bank of India (SIDBI) / Ministry of Finance",
    "description": "Facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST borrower and at least one woman borrower per bank branch for setting up greenfield enterprises.",
    "targetBeneficiaries": [
      "SC/ST Entrepreneurs",
      "Women Entrepreneurs",
      "Greenfield Enterprise Starters"
    ],
    "benefits": [
      "Composite loan (term loan and working capital) from ₹10 Lakh up to ₹100 Lakh.",
      "Margin money requirement capped at max 15%.",
      "Handholding support from SIDBI, handloom/handicrafts boards, and industrial development agencies."
    ],
    "eligibilityCriteria": [
      {
        "id": "sc_st_or_woman",
        "label": "Borrower must be SC/ST or a Woman entrepreneur aged 18 or above.",
        "mandatory": true,
        "field": "isSCSTOrWoman",
        "operator": "eq",
        "value": true
      },
      {
        "id": "greenfield_project",
        "label": "Project must be a greenfield enterprise in manufacturing, services, agri-allied, or trading.",
        "mandatory": true,
        "field": "isGreenfieldProject",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Identity & Category Certificate (SC/ST certificate or proof of woman ownership >= 51%)",
      "Detailed Project Report (DPR) with financial projections",
      "Promoter contribution proof and lease/land deed for business premises",
      "PAN Card and bank statements"
    ],
    "applicationSteps": [
      "Apply online on Stand-Up Mitra portal (standupmitra.in).",
      "Choose preferred Scheduled Commercial Bank branch.",
      "Complete technical interview and document scrutiny; loan sanctioned within 3-4 weeks."
    ],
    "applicationMode": "Online via standupmitra.in & Scheduled Commercial Banks",
    "officialLink": "https://www.standupmitra.in",
    "sourceAuthority": "Small Industries Development Bank of India (SIDBI)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 65,
    "occupations": [
      "Entrepreneur",
      "Business Owner",
      "Self Employed"
    ]
  },
  {
    "id": "pm-employment-generation-programme",
    "slug": "pm-employment-generation-programme",
    "name": "Prime Minister’s Employment Generation Programme (PMEGP)",
    "shortName": "PMEGP (Subsidy Loan)",
    "sector": "Microfinance & Entrepreneurship",
    "type": "Central",
    "state": "All India",
    "authority": "Khadi and Village Industries Commission (KVIC), Ministry of MSME",
    "description": "A major credit-linked subsidy scheme offering up to 35% government subsidy on bank-financed micro-enterprises with project cost up to ₹50 Lakh in manufacturing and ₹20 Lakh in services.",
    "targetBeneficiaries": [
      "Unemployed Individuals",
      "Rural Youth",
      "Women and Reserved Category Entrepreneurs",
      "Self Help Groups"
    ],
    "benefits": [
      "Government subsidy (margin money) of 25% (general urban), 35% (special category / rural areas).",
      "Project cost ceiling: ₹50 Lakh for manufacturing units, ₹20 Lakh for service sector units.",
      "Only 5% to 10% own contribution required by the beneficiary."
    ],
    "eligibilityCriteria": [
      {
        "id": "education_pmegp",
        "label": "Minimum 8th pass for manufacturing projects above ₹10 Lakh or service projects above ₹5 Lakh.",
        "mandatory": true,
        "field": "educationLevel",
        "operator": "in",
        "value": [
          "Class 8",
          "Class 10",
          "Class 12",
          "Graduate",
          "Postgraduate"
        ]
      },
      {
        "id": "age_pmegp",
        "label": "Must be an Indian citizen aged 18 years or above.",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 18
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card and PAN Card",
      "Detailed Project Report (DPR)",
      "Educational Qualification Certificate (8th pass or above)",
      "Special Category Certificate (SC/ST/OBC/Women/Ex-serviceman/Ph) if claiming 35% subsidy",
      "Rural area certificate issued by Sarpanch or Block Development Officer"
    ],
    "applicationSteps": [
      "Apply online on the PMEGP e-Portal (kviconline.gov.in/pmegpeportal).",
      "Select implementing agency (KVIC, KVIB, or DIC).",
      "District Level Task Force Committee (DLTFC) scrutinizes and forwards to financing bank.",
      "Undergo mandatory Entrepreneurship Development Programme (EDP) training and receive disbursement with subsidy lock-in."
    ],
    "applicationMode": "Online via kviconline.gov.in",
    "officialLink": "https://www.kviconline.gov.in/pmegpeportal",
    "sourceAuthority": "Khadi and Village Industries Commission (kvic.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 65,
    "occupations": [
      "Entrepreneur",
      "Unemployed",
      "Self Employed",
      "Artisan"
    ]
  },
  {
    "id": "atal-pension-yojana",
    "slug": "atal-pension-yojana",
    "name": "Atal Pension Yojana (APY) - Guaranteed Old Age Pension",
    "shortName": "Atal Pension (APY)",
    "sector": "Social Security & Pensions",
    "type": "Central",
    "state": "All India",
    "authority": "Pension Fund Regulatory and Development Authority (PFRDA), Ministry of Finance",
    "description": "A government-backed guaranteed pension scheme for citizens in the unorganized sector providing a guaranteed monthly pension of ₹1,00, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 from age 60 until lifetime, followed by spouse pension and return of pension corpus to nominees.",
    "targetBeneficiaries": [
      "Unorganized Sector Workers",
      "Gig and Daily Wage Workers",
      "Self Employed Citizens",
      "Youth aged 18 to 40"
    ],
    "benefits": [
      "Guaranteed monthly pension of ₹1,000 to ₹5,000 per month starting from age 60.",
      "Same pension amount continues to the spouse for life upon demise of subscriber.",
      "Full accumulated pension wealth (up to ₹8.5 Lakh) returned to nominee after both subscriber and spouse pass away.",
      "Low monthly contribution starting from as low as ₹42 per month (for 18-year-olds)."
    ],
    "eligibilityCriteria": [
      {
        "id": "age_bracket",
        "label": "Must be an Indian citizen between 18 and 40 years of age at the time of joining.",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 18
      },
      {
        "id": "non_taxpayer",
        "label": "Must not be an income taxpayer (citizens who have paid income tax are not eligible to join APY).",
        "mandatory": true,
        "field": "isTaxpayer",
        "operator": "eq",
        "value": false
      },
      {
        "id": "savings_account",
        "label": "Must possess an active savings bank account or post office savings account with auto-debit facility.",
        "mandatory": true,
        "field": "hasBankAccount",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card (Mandatory for identification)",
      "Active Savings Bank Account Passbook / Account Number & IFSC",
      "Mobile number linked to bank account (for SMS deduction alerts)",
      "Nominee Aadhaar and relationship details"
    ],
    "applicationSteps": [
      "Visit the bank branch where you hold a savings bank account, or apply via NetBanking/Mobile Banking app.",
      "Fill out the APY Registration Form selecting desired pension slab (₹1,000 to ₹5,000/month).",
      "Provide Aadhaar and nominee details, and authorize monthly/quarterly auto-debit.",
      "Receive APY Permanent Retirement Account Number (PRAN) via SMS.",
      "Download APY e-PRAN card from NSDL CRA portal (npscra.nsdl.co.in)."
    ],
    "applicationMode": "Online (Net Banking) & Offline at Bank Branches / Post Offices",
    "officialLink": "https://www.npscra.nsdl.co.in",
    "sourceAuthority": "Pension Fund Regulatory and Development Authority (pfrda.org.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 40,
    "occupations": [
      "Daily Wage Worker",
      "Driver",
      "Domestic Worker",
      "Artisan",
      "Farmer",
      "Shopkeeper",
      "Informal Sector"
    ]
  },
  {
    "id": "pm-suraksha-bima-yojana",
    "slug": "pm-suraksha-bima-yojana",
    "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    "shortName": "PMSBY (Accident Insurance)",
    "sector": "Social Security & Pensions",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Financial Services, Ministry of Finance",
    "description": "Extremely affordable national accident insurance scheme providing ₹2,00,000 coverage for accidental death or permanent total disability for a nominal annual premium of just ₹20.",
    "targetBeneficiaries": [
      "All Bank Account Holders aged 18 to 70 years"
    ],
    "benefits": [
      "₹2,00,000 in case of accidental death.",
      "₹2,00,000 in case of total and irrecoverable loss of both eyes or loss of use of both hands or feet.",
      "₹1,00,000 in case of total and irrecoverable loss of sight of one eye or loss of use of one hand or foot.",
      "Automatic annual debit of only ₹20 from the bank account."
    ],
    "eligibilityCriteria": [
      {
        "id": "pmsby_age",
        "label": "Must be between 18 and 70 years of age with an active savings bank account.",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 18
      },
      {
        "id": "auto_debit_consent",
        "label": "Consent to join and enable auto-debit on an annual renewal basis.",
        "mandatory": true,
        "field": "hasAutoDebitConsent",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Savings Bank Account details",
      "Nominee details"
    ],
    "applicationSteps": [
      "Log into NetBanking or visit home bank branch.",
      "Select \"Social Security Schemes\" -> \"Pradhan Mantri Suraksha Bima Yojana\".",
      "Confirm nominee details and authorize ₹20 auto-debit; policy certificate issued instantly."
    ],
    "applicationMode": "Online (NetBanking/Mobile App) & Offline at Bank Branches",
    "officialLink": "https://financialservices.gov.in",
    "sourceAuthority": "Department of Financial Services (financialservices.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 70,
    "occupations": [
      "Any",
      "Daily Wage Worker",
      "Farmer",
      "Driver",
      "Student"
    ]
  },
  {
    "id": "pm-jeevan-jyoti-bima-yojana",
    "slug": "pm-jeevan-jyoti-bima-yojana",
    "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    "shortName": "PMJJBY (Life Insurance)",
    "sector": "Social Security & Pensions",
    "type": "Central",
    "state": "All India",
    "authority": "Department of Financial Services, Ministry of Finance",
    "description": "Pure term life insurance scheme providing ₹2,00,000 life insurance coverage to bank account holders aged 18 to 50 years against death due to any cause, for ₹436 per annum.",
    "targetBeneficiaries": [
      "All Bank Account Holders aged 18 to 50 years"
    ],
    "benefits": [
      "Life cover of ₹2,00,000 payable to nominee upon death of the insured due to any cause.",
      "Low annual premium of ₹436 per annum (approx. ₹1.20 per day).",
      "Simple enrollment without mandatory medical underwriting."
    ],
    "eligibilityCriteria": [
      {
        "id": "pmjjby_age",
        "label": "Must be between 18 and 50 years of age with an active bank account.",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 18
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Savings Bank Account Passbook",
      "Nominee details and relationship proof"
    ],
    "applicationSteps": [
      "Apply through your bank NetBanking portal or submit enrollment slip at local branch.",
      "Authorize auto-debit of ₹436 from savings account in the month of May every year.",
      "Policy acknowledgment generated directly by partner life insurance company (LIC/private insurer)."
    ],
    "applicationMode": "Online (NetBanking) & Bank Branches",
    "officialLink": "https://financialservices.gov.in",
    "sourceAuthority": "Ministry of Finance (financialservices.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 50,
    "occupations": [
      "Any",
      "Salaried",
      "Self Employed",
      "Farmer",
      "Worker"
    ]
  },
  {
    "id": "senior-citizen-savings-scheme",
    "slug": "senior-citizen-savings-scheme",
    "name": "Senior Citizen Savings Scheme (SCSS)",
    "shortName": "Senior Citizen Savings (SCSS)",
    "sector": "Social Security & Pensions",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Finance / Reserve Bank of India",
    "description": "A government-backed premier retirement savings instrument for individuals aged 60 and above offering a high guaranteed interest rate of 8.2% per annum paid quarterly.",
    "targetBeneficiaries": [
      "Senior Citizens aged 60 and above",
      "Retired Defence Personnel aged 50+",
      "VRS Optants aged 55+"
    ],
    "benefits": [
      "High government guaranteed interest rate (currently 8.2% p.a.).",
      "Quarterly interest payout providing regular cash flow in retirement.",
      "Investment limit up to ₹30,00,000.",
      "Income Tax deduction under Section 80C up to ₹1,50,000."
    ],
    "eligibilityCriteria": [
      {
        "id": "senior_age",
        "label": "Individual must have attained 60 years of age (or 55 for civilian retirees with retirement benefits).",
        "mandatory": true,
        "field": "age",
        "operator": "gte",
        "value": 60
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card and PAN Card (Mandatory)",
      "Age proof / Birth Certificate / Passport",
      "Retirement and superannuation proof (for age 55-60 applicants)",
      "Cheque / Draft for deposit amount"
    ],
    "applicationSteps": [
      "Collect SCSS Account Opening Form from any authorized Post Office or commercial bank.",
      "Submit Form with KYC, retirement fund documentation, and cheque.",
      "SCSS Passbook issued with auto-credit instructions to savings account for quarterly interest."
    ],
    "applicationMode": "Offline at Post Offices & Authorized Bank Branches",
    "officialLink": "https://www.indiapost.gov.in",
    "sourceAuthority": "Ministry of Finance (dea.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 60,
    "maxAge": 100,
    "occupations": [
      "Senior Citizen",
      "Retired",
      "Pensioner"
    ]
  },
  {
    "id": "indira-gandhi-old-age-pension",
    "slug": "indira-gandhi-old-age-pension",
    "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    "shortName": "IGNOAPS (Old Age Pension)",
    "sector": "Social Security & Pensions",
    "type": "Central",
    "state": "All India",
    "authority": "Ministry of Rural Development / National Social Assistance Programme (NSAP)",
    "description": "Non-contributory monthly pension provided to destitute and BPL senior citizens aged 60 years and above to provide essential subsistence support in their old age.",
    "targetBeneficiaries": [
      "Destitute Senior Citizens aged 60+ belonging to BPL households"
    ],
    "benefits": [
      "Monthly pension amount directly transferred via DBT into the senior citizen bank or post office account.",
      "Central component supplemented by State Government top-up (often amounting to ₹1,000 - ₹2,500/month depending on state).",
      "Enhanced assistance upon crossing 80 years of age."
    ],
    "eligibilityCriteria": [
      {
        "id": "bpl_senior",
        "label": "Applicant must be aged 60 years or above and belong to a household living Below Poverty Line (BPL).",
        "mandatory": true,
        "field": "isBPLSenior",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "BPL Ration Card / BPL Certificate",
      "Age proof verified by medical officer or voter list",
      "Bank / Post Office Passbook"
    ],
    "applicationSteps": [
      "Apply online on NSAP Portal (nsap.nic.in) or offline at Village Gram Panchayat / Block Development Office / Municipal Ward Office.",
      "Social Welfare Department conducts local verification.",
      "Pension sanctioned and disbursed monthly under DBT."
    ],
    "applicationMode": "Online via nsap.nic.in & Block/Ward Offices",
    "officialLink": "https://nsap.nic.in",
    "sourceAuthority": "National Social Assistance Programme (nsap.nic.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 60,
    "maxAge": 100,
    "occupations": [
      "Senior Citizen",
      "Unemployed",
      "Informal Sector"
    ]
  },
  {
    "id": "gruha-jyothi-karnataka",
    "slug": "gruha-jyothi-karnataka",
    "name": "Gruha Jyothi Scheme (Karnataka Free Electricity)",
    "shortName": "Gruha Jyothi",
    "sector": "Renewable Energy & Utilities",
    "type": "State",
    "state": "Karnataka",
    "authority": "Energy Department, Government of Karnataka",
    "description": "Provides up to 200 units of zero-cost free electricity each month to all domestic residential households in Karnataka based on their average monthly consumption plus a 10% entitlement buffer.",
    "targetBeneficiaries": [
      "Domestic Households in Karnataka",
      "Tenants & House Owners with Domestic Meter"
    ],
    "benefits": [
      "Up to 200 units of free electricity every month for domestic meter connections.",
      "Zero electricity bill for households consuming within their calculated entitlement limit.",
      "Available to both homeowners and registered tenants residing in Karnataka."
    ],
    "eligibilityCriteria": [
      {
        "id": "karnataka_res",
        "label": "Must be a domestic residential electricity consumer in Karnataka (ESCOM meter).",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "consumption_cap",
        "label": "Monthly average electricity consumption must be below 200 units.",
        "mandatory": true,
        "field": "monthlyUnits",
        "operator": "lte",
        "value": 200
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card of the electricity connection holder or tenant",
      "Electricity Account ID / Consumer Connection Number (from BESCOM/CESC/HESCOM/MESCOM/GESCOM bill)",
      "Rental / Lease agreement (for tenants)"
    ],
    "applicationSteps": [
      "Visit Seva Sindhu portal (sevasindhuservices.karnataka.gov.in) and click \"Gruha Jyothi\".",
      "Select your ESCOM (BESCOM, HESCOM, etc.) and enter consumer account ID.",
      "Verify via Aadhaar OTP and submit occupancy status (owner or tenant).",
      "Receive instant digital acknowledgment slip."
    ],
    "applicationMode": "Online (Seva Sindhu) & Grama One / Karnataka One / Bangalore One",
    "officialLink": "https://sevasindhuservices.karnataka.gov.in",
    "sourceAuthority": "Government of Karnataka Energy Department",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 100,
    "occupations": [
      "Any",
      "Homemaker",
      "Resident",
      "Tenant"
    ]
  },
  {
    "id": "yuva-nidhi-karnataka",
    "slug": "yuva-nidhi-karnataka",
    "name": "Yuva Nidhi Scheme (Karnataka Graduate & Diploma Unemployment Allowance)",
    "shortName": "Yuva Nidhi",
    "sector": "Education & Employment",
    "type": "State",
    "state": "Karnataka",
    "authority": "Department of Skill Development, Entrepreneurship and Livelihood, Karnataka",
    "description": "Provides monthly unemployment assistance of ₹3,000 for degree holders and ₹1,500 for diploma holders who graduated in recent academic years and remain unemployed after 6 months of course completion.",
    "targetBeneficiaries": [
      "Unemployed Graduates in Karnataka",
      "Unemployed Diploma Holders in Karnataka",
      "Youth Job Seekers"
    ],
    "benefits": [
      "₹3,000 per month for degree holders for a maximum duration of 2 years (or until employment).",
      "₹1,500 per month for diploma holders for up to 2 years.",
      "Direct Benefit Transfer (DBT) directly into the youth’s Aadhaar-linked bank account.",
      "Free skill enhancement and job placement linkages via Skill Connect portal."
    ],
    "eligibilityCriteria": [
      {
        "id": "karnataka_domicile",
        "label": "Must be a domicile resident of Karnataka who completed graduation or diploma.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "unemployed_status",
        "label": "Must not be employed in government/private sector or enrolled in higher full-time education 6 months after graduation.",
        "mandatory": true,
        "field": "isUnemployed",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card with Karnataka address",
      "Degree / Diploma Passing Certificate and University Registration Number",
      "Bank Account passbook seeded with Aadhaar",
      "Self-declaration of unemployment"
    ],
    "applicationSteps": [
      "Apply online on Seva Sindhu (sevasindhu.karnataka.gov.in) under Yuva Nidhi.",
      "Verify academic credentials linked to Karnataka State Higher Education Council database.",
      "Authenticate via Aadhaar OTP and submit monthly self-declaration of unemployment status."
    ],
    "applicationMode": "Online via Seva Sindhu & Grama One Centers",
    "officialLink": "https://sevasindhuservices.karnataka.gov.in",
    "sourceAuthority": "Skill Development Department, Karnataka (skillconnect.ka.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 35,
    "occupations": [
      "Graduate",
      "Diploma Holder",
      "Unemployed",
      "Youth",
      "Student"
    ]
  },
  {
    "id": "shakti-scheme-karnataka",
    "slug": "shakti-scheme-karnataka",
    "name": "Shakti Scheme (Free Bus Travel for Women in Karnataka)",
    "shortName": "Shakti Scheme",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "State",
    "state": "Karnataka",
    "authority": "Transport Department, Government of Karnataka",
    "description": "Provides free public bus travel for all domicile women and transgender persons of Karnataka across ordinary, express, and city buses operated by KSRTC, BMTC, NWKRTC, and KKRTC.",
    "targetBeneficiaries": [
      "All Women Domicile Residents of Karnataka",
      "Transgender Persons in Karnataka",
      "Students and Working Women"
    ],
    "benefits": [
      "100% free travel in ordinary and express state public transport buses across Karnataka.",
      "Covers BMTC, KSRTC, NWKRTC, and KKRTC intra-state routes.",
      "Significant monthly transport cost savings for female students, domestic workers, and working women."
    ],
    "eligibilityCriteria": [
      {
        "id": "woman_karnataka",
        "label": "Must be a female or transgender resident of Karnataka.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      }
    ],
    "requiredDocuments": [
      "Government Photo Identity Card showing Karnataka address (Aadhaar Card, Voter ID, Driving License, or Shakti Smart Card)"
    ],
    "applicationSteps": [
      "Show physical government ID card with Karnataka residential address to the bus conductor to receive a zero-fare ticket.",
      "Optionally apply for the Shakti Smart Card on the Seva Sindhu transport portal."
    ],
    "applicationMode": "Instant at Bus with ID Card & Online for Smart Card",
    "officialLink": "https://ksrtc.in",
    "sourceAuthority": "Karnataka State Road Transport Corporation (KSRTC)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 5,
    "maxAge": 95,
    "occupations": [
      "Homemaker",
      "Student",
      "Working Woman",
      "Daily Wage Worker",
      "Any"
    ]
  },
  {
    "id": "anna-bhagya-karnataka",
    "slug": "anna-bhagya-karnataka",
    "name": "Anna Bhagya Scheme (Karnataka 10 KG Free Rice / Cash DBT)",
    "shortName": "Anna Bhagya",
    "sector": "Healthcare & Nutrition",
    "type": "State",
    "state": "Karnataka",
    "authority": "Food, Civil Supplies & Consumer Affairs Department, Karnataka",
    "description": "Provides 10 kg of free foodgrains per person per month to all Antyodaya and Priority Household (BPL) ration cardholders, including 5 kg free central rice plus direct bank transfer of ₹170/person for the state quota.",
    "targetBeneficiaries": [
      "BPL Ration Cardholders in Karnataka",
      "Antyodaya Anna Yojana (AAY) Families in Karnataka"
    ],
    "benefits": [
      "5 kg free central foodgrains plus cash transfer of ₹170 per person/month via Direct Benefit Transfer.",
      "Guarantees food and nutritional security for over 4 crore citizens in Karnataka.",
      "Transparent DBT payment sent directly to head of family bank account."
    ],
    "eligibilityCriteria": [
      {
        "id": "bpl_karnataka",
        "label": "Hold an active BPL (Priority Household) or Antyodaya Anna Yojana (AAY) ration card in Karnataka.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "aadhaar_seeded",
        "label": "Ration card must be linked to an active Aadhaar-seeded bank account.",
        "mandatory": true,
        "field": "isAadhaarSeeded",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Karnataka BPL / Antyodaya Ration Card",
      "Aadhaar card of all family members",
      "Active bank account linked to Aadhaar (DBT active)"
    ],
    "applicationSteps": [
      "Beneficiaries with existing active BPL/AAY cards are automatically enrolled.",
      "Check DBT credit status using the Ahara portal (ahara.kar.nic.in) under \"Status of DBT\"."
    ],
    "applicationMode": "Automatic for Ration Cardholders & Fair Price Shops",
    "officialLink": "https://ahara.kar.nic.in",
    "sourceAuthority": "Department of Food and Civil Supplies, Karnataka (ahara.kar.nic.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Farmer",
      "Daily Wage Worker",
      "Artisan",
      "Informal Worker",
      "Homemaker"
    ]
  },
  {
    "id": "raitha-vidyanidhi-karnataka",
    "slug": "raitha-vidyanidhi-karnataka",
    "name": "Chief Minister Raita Vidyanidhi Scholarship (Karnataka)",
    "shortName": "Raita Vidyanidhi Scholarship",
    "sector": "Education & Scholarships",
    "type": "State",
    "state": "Karnataka",
    "authority": "Department of Agriculture, Government of Karnataka",
    "description": "A higher education scholarship program providing annual financial aid ranging from ₹2,000 to ₹11,000 to children of farmers, agricultural laborers, weavers, fishermen, and auto-taxi drivers across Karnataka.",
    "targetBeneficiaries": [
      "Children of Farmers & Farm Laborers",
      "Children of Weavers, Fishermen, Auto Drivers",
      "PUC, ITI, Degree, PG, Medical & Engineering Students"
    ],
    "benefits": [
      "₹2,000 to ₹3,000 per year for High School & PUC/ITI/Diploma students.",
      "₹5,000 to ₹5,500 per year for BA, B.Sc, B.Com undergraduate courses.",
      "₹10,000 to ₹11,000 per year for MBBS, Engineering, and Professional Postgraduate degrees.",
      "Direct Benefit Transfer without requiring complex separate physical applications."
    ],
    "eligibilityCriteria": [
      {
        "id": "farmer_child",
        "label": "Parent must be a farmer with land ID on FRUITS portal or registered agricultural laborer/weaver/fisherman.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "enrolled_course",
        "label": "Student must be enrolled in post-matriculation courses registered on State Scholarship Portal (SSP).",
        "mandatory": true,
        "field": "isStudent",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Student SSP ID (State Scholarship Portal Karnataka)",
      "Parent FRUITS FID number (Farmer Registration and Unified Beneficiary Information System)",
      "College Admission Fee receipt",
      "Aadhaar card of student and parent"
    ],
    "applicationSteps": [
      "Apply online through Karnataka State Scholarship Portal (ssp.postmatric.karnataka.gov.in).",
      "System automatically pulls farmer land data from FRUITS database using parent Aadhaar.",
      "College verifies admission; scholarship credited directly via DBT."
    ],
    "applicationMode": "Online via State Scholarship Portal (SSP Karnataka)",
    "officialLink": "https://ssp.postmatric.karnataka.gov.in",
    "sourceAuthority": "Department of Agriculture, Karnataka (fruits.karnataka.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 15,
    "maxAge": 28,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "vidyasiri-karnataka",
    "slug": "vidyasiri-karnataka",
    "name": "Vidyasiri Food and Accommodation Scheme (Karnataka)",
    "shortName": "Vidyasiri (Food & Accommodation)",
    "sector": "Education & Scholarships",
    "type": "State",
    "state": "Karnataka",
    "authority": "Backward Classes Welfare Department, Government of Karnataka",
    "description": "Monthly stipend of ₹1,500 for 10 months (total ₹15,000/year) provided to post-matric backward classes (OBC) students who are pursuing higher education and could not secure admission in government hostels.",
    "targetBeneficiaries": [
      "OBC Category 1, 2A, 2B, 3A, 3B Students",
      "Rural Students Studying in Cities without Hostel Seats"
    ],
    "benefits": [
      "Financial support of ₹1,500 per month for 10 months (₹15,000 annually) for food and private room rent.",
      "Enables poor rural students to study in urban colleges without financial hardship."
    ],
    "eligibilityCriteria": [
      {
        "id": "obc_karnataka",
        "label": "Student must belong to Backward Classes (Category 1, 2A, 2B, 3A, 3B) of Karnataka.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "income_limit_vidyasiri",
        "label": "Annual family income must be within ₹2.5 Lakh (Cat-1) or ₹1 Lakh (Cat-2A, 2B, 3A, 3B).",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 250000
      },
      {
        "id": "min_distance",
        "label": "College must be at least 5 km away from student native village.",
        "mandatory": true,
        "field": "isOutsideNativeTown",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Caste and Income Certificate (RD number from Nadakacheri)",
      "College Admission Bonafide Certificate",
      "Aadhaar Card and Student Bank Passbook",
      "Hostel rejection / non-allotment acknowledgement"
    ],
    "applicationSteps": [
      "Register on Karnataka State Scholarship Portal (SSP) at ssp.postmatric.karnataka.gov.in.",
      "Select Backward Classes Welfare Department -> Food & Accommodation Scheme.",
      "Submit RD numbers and college details for digital verification."
    ],
    "applicationMode": "Online via SSP Portal (ssp.postmatric.karnataka.gov.in)",
    "officialLink": "https://bcwd.karnataka.gov.in",
    "sourceAuthority": "Backward Classes Welfare Department, Karnataka",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 16,
    "maxAge": 27,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "ganga-kalyana-karnataka",
    "slug": "ganga-kalyana-karnataka",
    "name": "Ganga Kalyana Scheme (Karnataka Free Irrigation Borewells)",
    "shortName": "Ganga Kalyana",
    "sector": "Agriculture & Farmers Welfare",
    "type": "State",
    "state": "Karnataka",
    "authority": "Dr. B.R. Ambedkar / D. Devaraj Urs Development Corporation, Karnataka",
    "description": "Provides free borewell drilling, submersible pump sets, piping, and electrification to small and marginal farmers belonging to SC, ST, Backward Classes, and Minority communities in Karnataka.",
    "targetBeneficiaries": [
      "SC / ST Small & Marginal Farmers in Karnataka",
      "OBC & Minority Landholding Farmers in Karnataka"
    ],
    "benefits": [
      "100% free borewell drilling, casing pipe, submersible pump, starter, and electricity line connection.",
      "Individual borewell for farmers owning 1.5 to 5 acres; collective lift irrigation for farmer groups.",
      "Subsidy value worth up to ₹3,50,000 to ₹4,50,000 per borewell installation."
    ],
    "eligibilityCriteria": [
      {
        "id": "category_karnataka",
        "label": "Belong to SC, ST, Backward Classes, or Minority community residing in Karnataka.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "small_marginal",
        "label": "Must be a small or marginal farmer owning dry land without existing irrigation source.",
        "mandatory": true,
        "field": "hasLandInterest",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "Caste Certificate and Income Certificate issued by Tahsildar",
      "Land RTC / Pahani extract, Mutation copy",
      "Small/Marginal Farmer Certificate from Agriculture Department",
      "Aadhaar card and bank account details"
    ],
    "applicationSteps": [
      "Apply online on Seva Sindhu (sevasindhu.karnataka.gov.in) when corporation issues notifications.",
      "Groundwater department surveys land for water point viability.",
      "Corporation allocates contractor for drilling, pump installation, and ESCOM electrification."
    ],
    "applicationMode": "Online via Seva Sindhu Portal",
    "officialLink": "https://kmdc.karnataka.gov.in",
    "sourceAuthority": "Karnataka Minorities / BCWD Development Corporations",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 65,
    "occupations": [
      "Farmer",
      "Agriculture"
    ]
  },
  {
    "id": "sandhya-suraksha-karnataka",
    "slug": "sandhya-suraksha-karnataka",
    "name": "Sandhya Suraksha Yojana (Karnataka Old Age Pension)",
    "shortName": "Sandhya Suraksha Pension",
    "sector": "Social Security & Pensions",
    "type": "State",
    "state": "Karnataka",
    "authority": "Revenue Department, Government of Karnataka",
    "description": "Monthly social security pension of ₹1,200 provided to destitute senior citizens aged 65 years and above in Karnataka who have no steady source of income or familial support.",
    "targetBeneficiaries": [
      "Senior Citizens aged 65 and above residing in Karnataka",
      "Destitute Elderly without Income"
    ],
    "benefits": [
      "Monthly direct financial pension of ₹1,200 transferred directly into the pensioner’s bank or post office account.",
      "Concessional healthcare and bus travel facilities in Karnataka."
    ],
    "eligibilityCriteria": [
      {
        "id": "senior_kar_age",
        "label": "Must be 65 years of age or older and a resident of Karnataka for at least 3 years.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Karnataka"
      },
      {
        "id": "income_sandhya",
        "label": "Annual combined income of pensioner and spouse must not exceed ₹20,000.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 20000
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card proving age and address in Karnataka",
      "Income Certificate issued by Revenue Authority (below ₹20,000)",
      "Domicile Certificate of Karnataka",
      "Bank or Post Office passbook"
    ],
    "applicationSteps": [
      "Submit application at nearest Nadakacheri (Village Accountant office) or Grama One / Karnataka One center.",
      "Revenue Inspector conducts field inquiry of income and age.",
      "Tahsildar sanctions pension order; credited monthly via DBT."
    ],
    "applicationMode": "Offline at Nadakacheri & Grama One Centers",
    "officialLink": "https://nadakacheri.karnataka.gov.in",
    "sourceAuthority": "Revenue Department, Karnataka (nadakacheri.karnataka.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 65,
    "maxAge": 100,
    "occupations": [
      "Senior Citizen",
      "Retired",
      "Unemployed"
    ]
  },
  {
    "id": "kalaignar-magalir-urimai-thogai",
    "slug": "kalaignar-magalir-urimai-thogai",
    "name": "Kalaignar Magalir Urimai Thogai Thittam (Tamil Nadu Women Basic Income)",
    "shortName": "Magalir Urimai Thogai",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "State",
    "state": "Tamil Nadu",
    "authority": "Special Programme Implementation Department, Government of Tamil Nadu",
    "description": "Flagship basic income scheme providing ₹1,000 per month directly to woman heads of eligible low-income households in Tamil Nadu to recognize their unpaid domestic labor and improve livelihood.",
    "targetBeneficiaries": [
      "Woman Head of Households in Tamil Nadu",
      "Low-income and Marginalized Families in Tamil Nadu"
    ],
    "benefits": [
      "Monthly direct transfer of ₹1,000 (₹12,000 annually) directly into the woman’s bank account.",
      "Direct Benefit Transfer without middlemen through Aadhaar enabled payment system (AePS)."
    ],
    "eligibilityCriteria": [
      {
        "id": "tn_resident",
        "label": "Must be a resident woman head of family aged 21 or above in Tamil Nadu.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Tamil Nadu"
      },
      {
        "id": "tn_income",
        "label": "Annual household income must be below ₹2,50,000 with household power consumption under 3,600 units/year.",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 250000
      }
    ],
    "requiredDocuments": [
      "Smart Family Card (Ration Card) of Tamil Nadu",
      "Aadhaar card of woman head and family members",
      "Electricity Consumer Connection number",
      "Bank passbook linked to Aadhaar"
    ],
    "applicationSteps": [
      "Special camps organized at local ration shops / e-Sevai centers across Tamil Nadu.",
      "Biometric fingerprint authentication done at e-Sevai camp.",
      "SMS confirmation received; ₹1,000 credited on the 15th of every month."
    ],
    "applicationMode": "Offline Camps at e-Sevai Centers and Fair Price Shops",
    "officialLink": "https://kmut.tn.gov.in",
    "sourceAuthority": "Government of Tamil Nadu (tn.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 21,
    "maxAge": 75,
    "occupations": [
      "Homemaker",
      "Daily Wage Worker",
      "Self Employed",
      "Informal Worker"
    ]
  },
  {
    "id": "pudhumai-penn-scheme-tamilnadu",
    "slug": "pudhumai-penn-scheme-tamilnadu",
    "name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance (Pudhumai Penn Scheme)",
    "shortName": "Pudhumai Penn Scheme",
    "sector": "Education & Scholarships",
    "type": "State",
    "state": "Tamil Nadu",
    "authority": "Social Welfare and Women Empowerment Department, Tamil Nadu",
    "description": "Provides ₹1,000 per month financial assistance to girl students who studied in Government schools from Classes 6 to 12 and enrolled in higher education (Undergraduate, Diploma, ITI) until degree completion.",
    "targetBeneficiaries": [
      "Girl Students from Tamil Nadu Government Schools pursuing College / ITI / Diplomas"
    ],
    "benefits": [
      "Monthly scholarship of ₹1,000 credited directly into the student bank account until completion of course.",
      "Dramatically improves higher education gross enrollment ratio (GER) of girls from government schools."
    ],
    "eligibilityCriteria": [
      {
        "id": "tn_female_student",
        "label": "Girl student who studied Classes 6 to 12 in Tamil Nadu Government schools.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Tamil Nadu"
      },
      {
        "id": "college_enrolled",
        "label": "Enrolled in recognized undergraduate degree, diploma, or ITI technical course.",
        "mandatory": true,
        "field": "isStudent",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "EMIS number (Education Management Information System from school)",
      "10th and 12th school passing certificates",
      "College Admission ID Card and fee receipt",
      "Aadhaar card and bank account details"
    ],
    "applicationSteps": [
      "Apply through college nodal officer via the Pudhumai Penn portal (pudhumaipenn.tn.gov.in).",
      "College validates government school study background via EMIS database.",
      "Funds released directly via DBT on the first week of every month."
    ],
    "applicationMode": "Online via College Nodal Officer (pudhumaipenn.tn.gov.in)",
    "officialLink": "https://www.pudhumaipenn.tn.gov.in",
    "sourceAuthority": "Social Welfare Department, Tamil Nadu",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 17,
    "maxAge": 24,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "rythu-bandhu-telangana",
    "slug": "rythu-bandhu-telangana",
    "name": "Rythu Bandhu / Rythu Bharosa Scheme (Telangana Farmer Investment Support)",
    "shortName": "Rythu Bandhu (Telangana)",
    "sector": "Agriculture & Farmers Welfare",
    "type": "State",
    "state": "Telangana",
    "authority": "Agriculture Department, Government of Telangana",
    "description": "Pioneering agricultural investment support scheme providing ₹10,000 to ₹15,000 per acre per year directly into farmers’ bank accounts in two seasonal tranches (Kharif and Rabi) to meet initial input costs.",
    "targetBeneficiaries": [
      "Landholding Farmers in Telangana",
      "Pattadar Passbook Holders"
    ],
    "benefits": [
      "Direct cash incentive of ₹5,000 to ₹7,500 per acre per season (total ₹10,000 - ₹15,000/acre/year).",
      "Transferred directly via DBT for seeds, fertilizers, pesticides, and field preparation.",
      "No loan repayment burden; 100% direct state grant."
    ],
    "eligibilityCriteria": [
      {
        "id": "telangana_pattadar",
        "label": "Must own agricultural land in Telangana registered with Pattadar Passbook in Dharani portal.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Telangana"
      }
    ],
    "requiredDocuments": [
      "Dharani Title Deed / Pattadar Passbook",
      "Aadhaar Card linked to Dharani land records",
      "Aadhaar-seeded bank account details"
    ],
    "applicationSteps": [
      "Agricultural Extension Officers (AEO) map land records from the Dharani revenue portal.",
      "Funds transferred directly via RBI e-Kuber into the farmer’s account at season onset."
    ],
    "applicationMode": "Automated via Dharani Land Records (dharani.telangana.gov.in)",
    "officialLink": "https://rythubandhu.telangana.gov.in",
    "sourceAuthority": "Agriculture Department, Telangana (dharani.telangana.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 85,
    "occupations": [
      "Farmer",
      "Agriculture"
    ]
  },
  {
    "id": "maha-lakshmi-scheme-telangana",
    "slug": "maha-lakshmi-scheme-telangana",
    "name": "Maha Lakshmi Scheme (Telangana Free Bus Travel & Financial Aid for Women)",
    "shortName": "Maha Lakshmi Scheme",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "State",
    "state": "Telangana",
    "authority": "Transport & Women Welfare Departments, Government of Telangana",
    "description": "Guarantees 100% free bus travel in TSRTC Palle Velugu and Express buses across Telangana for all women and transgender persons, along with monthly financial assistance of ₹2,500 for eligible women.",
    "targetBeneficiaries": [
      "Women Residents of Telangana",
      "Transgender Persons in Telangana",
      "Female Students and Workers"
    ],
    "benefits": [
      "Free travel in Palle Velugu, Express, and City Ordinary TSRTC buses across Telangana.",
      "Monthly financial assistance of ₹2,500 per month for women heads of low-income families.",
      "Subsidized domestic LPG cylinder at ₹500 under the Mahalakshmi gas component."
    ],
    "eligibilityCriteria": [
      {
        "id": "telangana_women",
        "label": "Must be a female resident of Telangana with valid state address proof.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Telangana"
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card / Voter ID proving Telangana residency",
      "Food Security Card (Ration Card) for financial aid and gas subsidy"
    ],
    "applicationSteps": [
      "Show physical government ID card with Telangana address to the bus conductor to receive zero-fare ticket.",
      "Apply under Praja Palana application form for monthly financial aid and ₹500 gas cylinder."
    ],
    "applicationMode": "On-bus for Travel & Praja Palana Seva Kendras for Aid",
    "officialLink": "https://tsrtc.telangana.gov.in",
    "sourceAuthority": "Government of Telangana (tsrtc.telangana.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 5,
    "maxAge": 90,
    "occupations": [
      "Homemaker",
      "Student",
      "Working Woman",
      "Daily Wage Worker"
    ]
  },
  {
    "id": "ladki-bahin-yojana-maharashtra",
    "slug": "ladki-bahin-yojana-maharashtra",
    "name": "Mukhyamantri Majhi Ladki Bahin Yojana (Maharashtra Women Financial Aid)",
    "shortName": "Majhi Ladki Bahin",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "State",
    "state": "Maharashtra",
    "authority": "Women and Child Development Department, Government of Maharashtra",
    "description": "Flagship financial inclusion initiative providing ₹1,500 per month (₹18,000 annually) directly to women aged 21 to 65 years in Maharashtra from families with annual income up to ₹2.5 Lakh.",
    "targetBeneficiaries": [
      "Married, Widowed, Divorced, Abandoned & Unmarried Women aged 21-65 in Maharashtra"
    ],
    "benefits": [
      "Monthly financial assistance of ₹1,500 deposited directly into the woman’s Aadhaar-linked bank account.",
      "Aids in personal healthcare, nutrition, and domestic economic independence."
    ],
    "eligibilityCriteria": [
      {
        "id": "maha_resident",
        "label": "Domicile resident woman of Maharashtra aged between 21 and 65 years.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Maharashtra"
      },
      {
        "id": "maha_income",
        "label": "Annual family income must not exceed ₹2,50,000 (holding Yellow or Orange Ration Card).",
        "mandatory": true,
        "field": "familyIncome",
        "operator": "lte",
        "value": 250000
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Domicile Certificate of Maharashtra or 15-year Ration Card / School Leaving Certificate",
      "Income Certificate issued by Tahsildar (< ₹2.5 Lakh) or Yellow/Orange Ration Card",
      "Bank passbook linked with Aadhaar"
    ],
    "applicationSteps": [
      "Apply online through Nari Shakti Doot App or official portal (ladakibahin.maharashtra.gov.in).",
      "Alternatively visit Anganwadi workers, Gram Panchayat, or Setu Suvidha Kendra.",
      "Verification completed and ₹1,500 credited on the 15th of every month."
    ],
    "applicationMode": "Online (Nari Shakti Doot App) & Setu Suvidha Kendras",
    "officialLink": "https://ladakibahin.maharashtra.gov.in",
    "sourceAuthority": "Government of Maharashtra (maharashtra.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 21,
    "maxAge": 65,
    "occupations": [
      "Homemaker",
      "Daily Wage Worker",
      "Self Employed",
      "Informal Worker"
    ]
  },
  {
    "id": "mjpjay-maharashtra",
    "slug": "mjpjay-maharashtra",
    "name": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY - Maharashtra Health Cover)",
    "shortName": "MJPJAY Health Scheme",
    "sector": "Healthcare & Health Insurance",
    "type": "State",
    "state": "Maharashtra",
    "authority": "State Health Assurance Society, Public Health Department, Maharashtra",
    "description": "Provides cashless secondary and tertiary hospitalization cover up to ₹5,00,000 per family per year across 1,000+ empanelled government and private network hospitals in Maharashtra for 1,356 medical procedures.",
    "targetBeneficiaries": [
      "All Ration Card Holders in Maharashtra (Yellow, Orange, and White Cards)"
    ],
    "benefits": [
      "Universal cashless health cover of ₹5,00,000 per family per year across Maharashtra.",
      "Covers 1,356 specialized surgical procedures, cancer treatments, cardiac surgeries, and ICU care.",
      "Paperless pre-authorization through Arogyamitra stationed at network hospitals."
    ],
    "eligibilityCriteria": [
      {
        "id": "maha_health_res",
        "label": "Resident family of Maharashtra possessing a valid Ration card (Yellow, Orange, or White) or Domicile.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Maharashtra"
      }
    ],
    "requiredDocuments": [
      "Ration Card (Yellow / Orange / White card)",
      "Aadhaar Card of the patient and family members"
    ],
    "applicationSteps": [
      "Visit any Empanelled Network Hospital and meet the Arogyamitra at the MJPJAY help desk.",
      "Arogyamitra validates ration card and generates cashless e-authorization slip.",
      "Hospital provides completely cashless surgery and treatment."
    ],
    "applicationMode": "At Network Hospitals through Arogyamitra Help Desk",
    "officialLink": "https://www.jeevandayee.gov.in",
    "sourceAuthority": "State Health Assurance Society, Maharashtra (jeevandayee.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Any",
      "Farmer",
      "Worker",
      "Salaried",
      "Self Employed"
    ]
  },
  {
    "id": "kanyashree-prakalpa-west-bengal",
    "slug": "kanyashree-prakalpa-west-bengal",
    "name": "Kanyashree Prakalpa (West Bengal Girl Child Empowerment & Scholarship)",
    "shortName": "Kanyashree Prakalpa",
    "sector": "Education & Scholarships",
    "type": "State",
    "state": "West Bengal",
    "authority": "Department of Women & Child Development and Social Welfare, West Bengal",
    "description": "UN Public Service Award-winning conditional cash transfer program preventing child marriage and encouraging secondary and higher education of adolescent girls through annual scholarships and one-time grants.",
    "targetBeneficiaries": [
      "Unmarried Girl Students aged 13 to 19 in West Bengal Schools & Colleges"
    ],
    "benefits": [
      "K1 Component: Annual scholarship of ₹1,000 per year for girls in Classes 8 to 12 (ages 13–18).",
      "K2 Component: One-time grant of ₹25,000 credited when the girl turns 18 and remains unmarried and studying.",
      "K3 Component: Monthly university postgraduate education allowance."
    ],
    "eligibilityCriteria": [
      {
        "id": "wb_female",
        "label": "Unmarried girl student residing in West Bengal enrolled in recognized school/college.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "West Bengal"
      }
    ],
    "requiredDocuments": [
      "Birth Certificate of the girl child",
      "School / College Bonafide Certificate showing enrollment",
      "Unmarried status declaration signed by parent",
      "Bank passbook in the girl’s own name"
    ],
    "applicationSteps": [
      "Form distributed and processed directly through the girl’s school or college.",
      "Head of institution uploads verified documents onto the Kanyashree portal (wbkanyashree.gov.in).",
      "Funds credited directly into the girl’s bank account via DBT."
    ],
    "applicationMode": "Through Schools and Colleges via wbkanyashree.gov.in",
    "officialLink": "https://wbkanyashree.gov.in",
    "sourceAuthority": "Government of West Bengal (wbkanyashree.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 13,
    "maxAge": 19,
    "occupations": [
      "Student",
      "Youth"
    ]
  },
  {
    "id": "lakshmir-bhandar-west-bengal",
    "slug": "lakshmir-bhandar-west-bengal",
    "name": "Lakshmir Bhandar Scheme (West Bengal Women Financial Assistance)",
    "shortName": "Lakshmir Bhandar",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "State",
    "state": "West Bengal",
    "authority": "Department of Women & Child Development and Social Welfare, West Bengal",
    "description": "Basic income support scheme providing ₹1,000 per month for General category and ₹1,200 per month for SC/ST women heads of families aged 25 to 60 years in West Bengal.",
    "targetBeneficiaries": [
      "Women Heads of Family aged 25 to 60 in West Bengal"
    ],
    "benefits": [
      "₹1,200 per month for SC/ST women (₹14,400 annually).",
      "₹1,000 per month for General/OBC women (₹12,000 annually).",
      "Direct monthly deposit directly into the woman’s bank account."
    ],
    "eligibilityCriteria": [
      {
        "id": "wb_woman_res",
        "label": "Female resident of West Bengal aged between 25 and 60 years.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "West Bengal"
      },
      {
        "id": "non_govt_wb",
        "label": "Must not be a permanent government employee or receiving regular government pension.",
        "mandatory": true,
        "field": "isGovtEmployee",
        "operator": "eq",
        "value": false
      }
    ],
    "requiredDocuments": [
      "Swasthya Sathi Card number",
      "Aadhaar Card of the woman applicant",
      "SC / ST Certificate (if claiming ₹1,200 rate)",
      "Bank Account passbook copy"
    ],
    "applicationSteps": [
      "Collect and submit application form at local \"Duare Sarkar\" (Government at Doorstep) camp.",
      "BDO / Municipal team verifies Swasthya Sathi and Aadhaar details.",
      "Monthly grant disbursed via DBT on the 1st week of each month."
    ],
    "applicationMode": "Duare Sarkar Camps & BDO/Municipality Offices",
    "officialLink": "https://wb.gov.in",
    "sourceAuthority": "Government of West Bengal (wb.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 25,
    "maxAge": 60,
    "occupations": [
      "Homemaker",
      "Daily Wage Worker",
      "Self Employed",
      "Informal Worker"
    ]
  },
  {
    "id": "amma-vodi-andhra-pradesh",
    "slug": "amma-vodi-andhra-pradesh",
    "name": "Jagananna Amma Vodi Scheme (Andhra Pradesh Mother Education Incentive)",
    "shortName": "Amma Vodi Scheme",
    "sector": "Education & Scholarships",
    "type": "State",
    "state": "Andhra Pradesh",
    "authority": "Department of School Education, Government of Andhra Pradesh",
    "description": "Provides annual financial assistance of ₹15,000 directly to mothers from below poverty line (BPL) families to send their children to school from Class 1 to Class 12.",
    "targetBeneficiaries": [
      "Mothers of School-Going Children (Class 1 to 12) in Andhra Pradesh"
    ],
    "benefits": [
      "Direct annual grant of ₹15,000 credited into the mother’s bank account.",
      "Ensures zero financial obstacle for school uniform, books, and educational needs.",
      "Dramatically curbs school drop-out rates in rural and urban poor habitations."
    ],
    "eligibilityCriteria": [
      {
        "id": "ap_mother",
        "label": "Mother residing in Andhra Pradesh with children enrolled in Class 1 to 12.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Andhra Pradesh"
      },
      {
        "id": "attendance_ap",
        "label": "Child must maintain at least 75% attendance in recognized school/junior college.",
        "mandatory": true,
        "field": "hasSchoolAttendance",
        "operator": "eq",
        "value": true
      }
    ],
    "requiredDocuments": [
      "White Ration Card / Rice Card of Andhra Pradesh",
      "Aadhaar card of mother and child",
      "School Child Info / Student UID number",
      "Active bank account of the mother"
    ],
    "applicationSteps": [
      "School Headmaster verifies student enrollment and 75% attendance on Student Info portal.",
      "Village / Ward Sachivalayam publishes social audit provisional list.",
      "Direct Benefit Transfer released annually by the Department of School Education."
    ],
    "applicationMode": "Through Village/Ward Sachivalayams & Schools",
    "officialLink": "https://jaganannaammavodi.ap.gov.in",
    "sourceAuthority": "Government of Andhra Pradesh (ap.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 55,
    "occupations": [
      "Homemaker",
      "Mother",
      "Parent"
    ]
  },
  {
    "id": "ysr-rythu-bharosa-andhra-pradesh",
    "slug": "ysr-rythu-bharosa-andhra-pradesh",
    "name": "YSR Rythu Bharosa - PM KISAN (Andhra Pradesh Farmer Assistance)",
    "shortName": "YSR Rythu Bharosa",
    "sector": "Agriculture & Farmers Welfare",
    "type": "State",
    "state": "Andhra Pradesh",
    "authority": "Department of Agriculture, Government of Andhra Pradesh",
    "description": "Provides ₹13,500 per year financial input assistance to landholding farmer families and tenant farmers belonging to SC, ST, BC, and Minority communities in Andhra Pradesh.",
    "targetBeneficiaries": [
      "Landowner Farmers in AP",
      "Tenant Farmers (SC/ST/BC/Minorities) holding CCRC cards"
    ],
    "benefits": [
      "₹13,500 per year per farmer family given in three installments before sowing seasons.",
      "Covers both landowners and landless tenant farmers cultivating under Crop Cultivator Rights Card (CCRC).",
      "Free borewells and zero-interest crop loans up to ₹1 Lakh."
    ],
    "eligibilityCriteria": [
      {
        "id": "ap_farmer",
        "label": "Farmer holding cultivable land in Andhra Pradesh or registered tenant with CCRC card.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Andhra Pradesh"
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Pattadar Passbook / Webland RoR extract or CCRC Tenant agreement",
      "Active bank account linked to Aadhaar"
    ],
    "applicationSteps": [
      "Rythu Bharosa Kendras (RBKs) verify land and tenant records at village level.",
      "Funds credited directly to bank account in May, October, and January."
    ],
    "applicationMode": "Village Rythu Bharosa Kendras (RBKs)",
    "officialLink": "https://ysrrythubharosa.ap.gov.in",
    "sourceAuthority": "Agriculture Department, Andhra Pradesh",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 85,
    "occupations": [
      "Farmer",
      "Tenant Farmer",
      "Agriculture"
    ]
  },
  {
    "id": "kalia-scheme-odisha",
    "slug": "kalia-scheme-odisha",
    "name": "KALIA Scheme (Krushak Assistance for Livelihood and Income Augmentation - Odisha)",
    "shortName": "KALIA Scheme (Odisha)",
    "sector": "Agriculture & Farmers Welfare",
    "type": "State",
    "state": "Odisha",
    "authority": "Department of Agriculture and Farmers’ Empowerment, Government of Odisha",
    "description": "Provides comprehensive livelihood financial assistance of ₹10,000/year to small/marginal farmers and ₹12,500 to landless agricultural households for allied activities in Odisha.",
    "targetBeneficiaries": [
      "Small and Marginal Farmers in Odisha",
      "Landless Agricultural Households",
      "Vulnerable Agricultural Families"
    ],
    "benefits": [
      "₹10,000 per family per year (₹5,000 for Kharif and ₹5,000 for Rabi) for small and marginal farmers.",
      "₹12,500 one-time financial support for landless agricultural households for goat rearing, poultry, and mushroom cultivation.",
      "Life insurance cover of ₹2 Lakh and zero-interest crop loans up to ₹50,000."
    ],
    "eligibilityCriteria": [
      {
        "id": "odisha_farmer",
        "label": "Small/marginal farmer or landless agricultural laborer residing in Odisha.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Odisha"
      }
    ],
    "requiredDocuments": [
      "Aadhaar Card",
      "Ration Card / Food Security Card",
      "Land records (for farmers) or MGNREGA job card (for landless laborers)",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Apply online on KALIA Portal (kalia.odisha.gov.in) or submit \"Green Form\" at Gram Panchayat office.",
      "Village scrutiny committee verifies household eligibility and DBT credits funds directly."
    ],
    "applicationMode": "Online via kalia.odisha.gov.in & Gram Panchayat Offices",
    "officialLink": "https://kalia.odisha.gov.in",
    "sourceAuthority": "Agriculture Department, Odisha (kalia.odisha.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 18,
    "maxAge": 80,
    "occupations": [
      "Farmer",
      "Daily Wage Worker",
      "Agricultural Laborer"
    ]
  },
  {
    "id": "bsky-gopabandhu-health-odisha",
    "slug": "bsky-gopabandhu-health-odisha",
    "name": "Biju Swasthya Kalyan Yojana (BSKY - Odisha Cashless Health Assurance)",
    "shortName": "BSKY Health Assurance",
    "sector": "Healthcare & Health Insurance",
    "type": "State",
    "state": "Odisha",
    "authority": "Health & Family Welfare Department, Government of Odisha",
    "description": "Provides cashless healthcare coverage up to ₹5 Lakh per family per year, with an enhanced coverage of ₹10 Lakh for female family members, across 800+ top private hospitals in Odisha and major Indian cities.",
    "targetBeneficiaries": [
      "Ration Card / BSKY Card Holders in Odisha",
      "All BPL & Low-income Families in Odisha"
    ],
    "benefits": [
      "₹5 Lakh cashless treatment per family per year; enhanced ₹10 Lakh cover for women members.",
      "Empanelled top hospitals across India including Tata Memorial, Apollo, and Fortis.",
      "Smart health card enables instant swipe authorization at hospital help desks."
    ],
    "eligibilityCriteria": [
      {
        "id": "odisha_bsky_card",
        "label": "Possess a BSKY Smart Health Card or National/State Food Security Card in Odisha.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Odisha"
      }
    ],
    "requiredDocuments": [
      "BSKY Smart Health Card / Ration Card",
      "Aadhaar Card of the patient"
    ],
    "applicationSteps": [
      "Visit any BSKY empanelled hospital in Odisha or major metros.",
      "Present BSKY Smart Health Card to Swasthya Mitra at the help desk.",
      "Entire treatment, diagnostics, and surgeries provided completely cashless."
    ],
    "applicationMode": "At Empanelled Hospitals via Swasthya Mitra",
    "officialLink": "https://bsky.odisha.gov.in",
    "sourceAuthority": "Government of Odisha (bsky.odisha.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Any",
      "Farmer",
      "Worker",
      "Self Employed"
    ]
  },
  {
    "id": "chiranjeevi-swasthya-bima-rajasthan",
    "slug": "chiranjeevi-swasthya-bima-rajasthan",
    "name": "Mukhyamantri Ayushman Arogya / Chiranjeevi Health Scheme (Rajasthan)",
    "shortName": "Chiranjeevi Health Scheme",
    "sector": "Healthcare & Health Insurance",
    "type": "State",
    "state": "Rajasthan",
    "authority": "Rajasthan State Health Assurance Agency, Government of Rajasthan",
    "description": "Pioneering state health insurance scheme providing cashless secondary and tertiary hospitalization cover up to ₹25 Lakh per family per year across government and private network hospitals in Rajasthan.",
    "targetBeneficiaries": [
      "All Families of Rajasthan holding Jan Aadhaar Card"
    ],
    "benefits": [
      "Comprehensive cashless inpatient cover up to ₹25,00,000 per family per year.",
      "Covers organ transplants, heart surgery, oncology, neurosurgery, and critical dialysis.",
      "Free for NFSA, SECC, small farmers, and contract workers; subsidized premium of ₹850/yr for other families."
    ],
    "eligibilityCriteria": [
      {
        "id": "rajasthan_resident",
        "label": "Resident family of Rajasthan possessing an active Jan Aadhaar card.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Rajasthan"
      }
    ],
    "requiredDocuments": [
      "Jan Aadhaar Card / Jan Aadhaar Acknowledgement Number",
      "Aadhaar Card of the patient"
    ],
    "applicationSteps": [
      "Apply online on SSO Rajasthan portal (sso.rajasthan.gov.in) using Jan Aadhaar.",
      "Present Jan Aadhaar card at hospital help desk for paperless admission."
    ],
    "applicationMode": "Online via SSO Rajasthan & e-Mitra Kiosks",
    "officialLink": "https://chiranjeevi.rajasthan.gov.in",
    "sourceAuthority": "Government of Rajasthan (chiranjeevi.rajasthan.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Any",
      "Farmer",
      "Worker",
      "Salaried",
      "Self Employed"
    ]
  },
  {
    "id": "delhi-pink-pass-free-bus",
    "slug": "delhi-pink-pass-free-bus",
    "name": "Delhi Free Pink Ticket Bus Travel Scheme for Women",
    "shortName": "Delhi Pink Pass",
    "sector": "Women Welfare & Financial Inclusion",
    "type": "State",
    "state": "Delhi",
    "authority": "Transport Department, Government of NCT of Delhi",
    "description": "Provides 100% free bus travel to all women passengers across all Delhi Transport Corporation (DTC) and Delhi Integrated Multi-Modal Transit System (DIMTS) cluster city buses in the National Capital.",
    "targetBeneficiaries": [
      "All Women Passengers Traveling in Delhi (Residents and Visitors)"
    ],
    "benefits": [
      "Completely free single-journey Pink Passes on every DTC and DIMTS orange cluster bus.",
      "No application form, card, or documentation required.",
      "Women conductors and marshals stationed for enhanced passenger safety."
    ],
    "eligibilityCriteria": [
      {
        "id": "woman_passenger",
        "label": "Open unconditionally to all female passengers traveling in Delhi city buses.",
        "mandatory": true,
        "field": "gender",
        "operator": "eq",
        "value": "Female"
      }
    ],
    "requiredDocuments": [
      "No documents required; available directly from bus conductor on board"
    ],
    "applicationSteps": [
      "Board any DTC or cluster bus in Delhi.",
      "Conductor automatically hands you a zero-value Pink Pass ticket upon boarding."
    ],
    "applicationMode": "Instant On-Boarding on Delhi Public Buses",
    "officialLink": "https://transport.delhi.gov.in",
    "sourceAuthority": "Delhi Transport Corporation (dtc.delhi.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 5,
    "maxAge": 95,
    "occupations": [
      "Homemaker",
      "Student",
      "Working Professional",
      "Any"
    ]
  },
  {
    "id": "kerala-kasp-health-scheme",
    "slug": "kerala-kasp-health-scheme",
    "name": "Karunya Arogya Suraksha Padhathi (KASP - Kerala Health Scheme)",
    "shortName": "KASP Kerala Health",
    "sector": "Healthcare & Health Insurance",
    "type": "State",
    "state": "Kerala",
    "authority": "State Health Agency (SHA), Health & Family Welfare Department, Kerala",
    "description": "State health assurance scheme providing ₹5,00,000 per family per year for secondary and tertiary care hospitalization in Kerala, covering 42 lakh poor and vulnerable families across government and private empanelled hospitals.",
    "targetBeneficiaries": [
      "BPL and Deprivation Category Families in Kerala",
      "Registered Karunya Benevolent Beneficiaries"
    ],
    "benefits": [
      "Cashless inpatient treatment cover up to ₹5,00,000 per family per year.",
      "Free medications, diagnostic tests, and follow-up care up to 15 days post-discharge."
    ],
    "eligibilityCriteria": [
      {
        "id": "kerala_resident",
        "label": "Resident family of Kerala possessing active Ration Card under priority categories.",
        "mandatory": true,
        "field": "state",
        "operator": "eq",
        "value": "Kerala"
      }
    ],
    "requiredDocuments": [
      "Ration Card of Kerala",
      "Aadhaar card of patient and family members"
    ],
    "applicationSteps": [
      "Visit any Empanelled Hospital in Kerala.",
      "Liaise with KASP Kiosk at hospital entrance with Ration Card and Aadhaar for cashless admission."
    ],
    "applicationMode": "At Empanelled Hospitals via KASP Help Desk",
    "officialLink": "https://sha.kerala.gov.in",
    "sourceAuthority": "State Health Agency, Kerala (sha.kerala.gov.in)",
    "lastVerifiedDate": "2026-03-01",
    "dataClassification": "DEMO_VERIFIED",
    "assessmentCategory": "Appears Eligible",
    "minAge": 0,
    "maxAge": 100,
    "occupations": [
      "Any",
      "Daily Wage Worker",
      "Fisherman",
      "Farmer",
      "Self Employed"
    ]
  }
];
