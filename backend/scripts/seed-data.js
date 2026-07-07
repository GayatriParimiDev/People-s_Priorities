import pool from '../src/db.js';
import { hashPassword } from '../src/controllers/authController.js';

const indiaData = [
  {
    state: "Karnataka",
    district: "Bengaluru",
    mp: { name: "Bangalore South Lok Sabha", mp_name: "Tejasvi Surya" },
    mlas: [
      { name: "Jayanagar Vidhan Sabha", mla_name: "C. K. Ramamurthy", lat: 12.9307, lng: 77.5847 },
      { name: "Basavanagudi Vidhan Sabha", mla_name: "L. A. Ravi Subramanya", lat: 12.9421, lng: 77.5754 },
      { name: "B.T.M. Layout Vidhan Sabha", mla_name: "Ramalinga Reddy", lat: 12.9166, lng: 77.6101 }
    ]
  },
  {
    state: "Maharashtra",
    district: "Mumbai",
    mp: { name: "Mumbai South Lok Sabha", mp_name: "Arvind Sawant" },
    mlas: [
      { name: "Colaba Vidhan Sabha", mla_name: "Rahul Narwekar", lat: 18.9154, lng: 72.8250 },
      { name: "Worli Vidhan Sabha", mla_name: "Aaditya Thackeray", lat: 18.9986, lng: 72.8174 },
      { name: "Malabar Hill Vidhan Sabha", mla_name: "Mangal Lodha", lat: 18.9543, lng: 72.7983 }
    ]
  },
  {
    state: "Uttar Pradesh",
    district: "Varanasi",
    mp: { name: "Varanasi Lok Sabha", mp_name: "Narendra Modi" },
    mlas: [
      { name: "Varanasi Cantonment Vidhan Sabha", mla_name: "Saurabh Srivastava", lat: 25.3263, lng: 82.9904 },
      { name: "Varanasi North Vidhan Sabha", mla_name: "Ravindra Jaiswal", lat: 25.3481, lng: 82.9996 },
      { name: "Varanasi South Vidhan Sabha", mla_name: "Neelkanth Tiwari", lat: 25.3102, lng: 83.0078 }
    ]
  },
  {
    state: "Delhi",
    district: "New Delhi",
    mp: { name: "New Delhi Lok Sabha", mp_name: "Bansuri Swaraj" },
    mlas: [
      { name: "New Delhi Vidhan Sabha", mla_name: "Arvind Kejriwal", lat: 28.6304, lng: 77.2177 },
      { name: "Karol Bagh Vidhan Sabha", mla_name: "Vishesh Ravi", lat: 28.6515, lng: 77.1907 },
      { name: "Greater Kailash Vidhan Sabha", mla_name: "Saurabh Bhardwaj", lat: 28.5482, lng: 77.2348 }
    ]
  },
  {
    state: "Tamil Nadu",
    district: "Chennai",
    mp: { name: "Chennai South Lok Sabha", mp_name: "Thamizhachi Thangapandian" },
    mlas: [
      { name: "Mylapore Vidhan Sabha", mla_name: "Dha. Velu", lat: 13.0330, lng: 80.2687 },
      { name: "Velachery Vidhan Sabha", mla_name: "J. M. H. Aassan Maulaana", lat: 12.9815, lng: 80.2196 },
      { name: "T. Nagar Vidhan Sabha", mla_name: "J. Karunanithi", lat: 13.0418, lng: 80.2341 }
    ]
  },
  {
    state: "West Bengal",
    district: "Kolkata",
    mp: { name: "Kolkata South Lok Sabha", mp_name: "Mala Roy" },
    mlas: [
      { name: "Bhawanipur Vidhan Sabha", mla_name: "Mamata Banerjee", lat: 22.5354, lng: 88.3473 },
      { name: "Rashbehari Vidhan Sabha", mla_name: "Debasish Kumar", lat: 22.5186, lng: 88.3516 },
      { name: "Ballygunge Vidhan Sabha", mla_name: "Babul Supriyo", lat: 22.5280, lng: 88.3659 }
    ]
  },
  {
    state: "Rajasthan",
    district: "Jaipur",
    mp: { name: "Jaipur Lok Sabha", mp_name: "Manju Sharma" },
    mlas: [
      { name: "Hawa Mahal Vidhan Sabha", mla_name: "Balmukund Acharya", lat: 26.9239, lng: 75.8267 },
      { name: "Civil Lines Vidhan Sabha", mla_name: "Gopal Sharma", lat: 26.9105, lng: 75.7873 },
      { name: "Kishanpole Vidhan Sabha", mla_name: "Amin Kagzi", lat: 26.9179, lng: 75.8164 }
    ]
  },
  {
    state: "Gujarat",
    district: "Ahmedabad",
    mp: { name: "Ahmedabad West Lok Sabha", mp_name: "Kirit Solanki" },
    mlas: [
      { name: "Ellisbridge Vidhan Sabha", mla_name: "Amit Shah (MLA)", lat: 23.0232, lng: 72.5647 },
      { name: "Dariapur Vidhan Sabha", mla_name: "Kaushik Jain", lat: 23.0371, lng: 72.5932 },
      { name: "Jamalpur-Khadia Vidhan Sabha", mla_name: "Imran Khedawala", lat: 23.0186, lng: 72.5891 }
    ]
  }
];

const proposalTemplates = [
  {
    category: "roads",
    title: "Pavement Rehabilitation and Drainage Work",
    description: "Severe pothole propagation and cracking on main arterial sector roadways. Inadequate storm drainage causes heavy waterlogging during seasonal monsoons, presenting risk to commuters.",
    cost: 3200000,
    beneficiaries: 12000,
    demand_score: 92,
    urgency: "CRITICAL",
    sentiment: "Highly Frustrated",
    breakdown: {
      complaint_count: 540,
      severity_weighted_score: 95,
      population_density_factor: 88,
      duplicate_count: 95,
      historical_neglect_factor: 85
    }
  },
  {
    category: "water",
    title: "Drinking Water Supply Pipe Interlink",
    description: "Intermittent supply flow and low water pressure across residential blocks. Proposing installation of auxiliary pipeline networks and direct booster pumping links.",
    cost: 4500000,
    beneficiaries: 18000,
    demand_score: 85,
    urgency: "ELEVATED",
    sentiment: "Anxious / Discontented",
    breakdown: {
      complaint_count: 420,
      severity_weighted_score: 82,
      population_density_factor: 92,
      duplicate_count: 50,
      historical_neglect_factor: 70
    }
  },
  {
    category: "education",
    title: "Science Lab Upgrade and Smart Classroom Systems",
    description: "Equipping local secondary state schools with modern digital systems and lab apparatus. Outdated resources limit STEM subject enrollment and learning outcomes.",
    cost: 1800000,
    beneficiaries: 1500,
    demand_score: 74,
    urgency: "STANDARD",
    sentiment: "Optimistic / Hopeful",
    breakdown: {
      complaint_count: 180,
      severity_weighted_score: 65,
      population_density_factor: 60,
      duplicate_count: 15,
      historical_neglect_factor: 45
    }
  },
  {
    category: "electricity",
    title: "Public Solar Street Lighting Installation",
    description: "Erecting grid-independent solar street lights along critical arterial lanes and residential lanes to improve public safety and resolve security concerns.",
    cost: 1200000,
    beneficiaries: 5500,
    demand_score: 79,
    urgency: "STANDARD",
    sentiment: "Concerned",
    breakdown: {
      complaint_count: 290,
      severity_weighted_score: 72,
      population_density_factor: 85,
      duplicate_count: 35,
      historical_neglect_factor: 55
    }
  },
  {
    category: "sanitation",
    title: "Community Bio-Toilet Blocks Construction",
    description: "Installation of gender-segregated modern bio-toilets with automatic flushing and continuous water supply to maintain health parameters and reduce open defecation spots.",
    cost: 2100000,
    beneficiaries: 8000,
    demand_score: 89,
    urgency: "CRITICAL",
    sentiment: "Urgent Grid Defect",
    breakdown: {
      complaint_count: 480,
      severity_weighted_score: 90,
      population_density_factor: 90,
      duplicate_count: 80,
      historical_neglect_factor: 80
    }
  }
];

async function seedData() {
  console.log("🌱 Starting India-wide database seeding...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Truncating existing data...");
    await client.query(
      "TRUNCATE users, constituencies, suggestions, audit_log, fund_ledger, manifesto_priorities, constituency_hierarchy, suggestion_timeline CASCADE;"
    );

    const passHash = hashPassword("password123");
    let primaryMpConstId = null;
    let primaryMlaConstId = null;

    // Loop through each state/district block in India
    for (const block of indiaData) {
      console.log(`Seeding ${block.state} - ${block.mp.name}...`);

      // 1. Insert MP constituency
      const mpConstRes = await client.query(
        "INSERT INTO constituencies (name, district, state, mp_name, constituency_type) VALUES ($1, $2, $3, $4, 'mp') RETURNING id;",
        [block.mp.name, block.district, block.state, block.mp.mp_name]
      );
      const mpId = mpConstRes.rows[0].id;

      if (!primaryMpConstId) {
        primaryMpConstId = mpId;
      }

      // 2. Insert MLAs
      for (const mla of block.mlas) {
        const mlaConstRes = await client.query(
          "INSERT INTO constituencies (name, district, state, mp_name, constituency_type) VALUES ($1, $2, $3, $4, 'mla') RETURNING id;",
          [mla.name, block.district, block.state, mla.mla_name]
        );
        const mlaId = mlaConstRes.rows[0].id;

        if (!primaryMlaConstId) {
          primaryMlaConstId = mlaId;
        }

        // 3. Connect to Hierarchy
        await client.query(
          "INSERT INTO constituency_hierarchy (lok_sabha_constituency_id, assembly_segment_id) VALUES ($1, $2);",
          [mpId, mlaId]
        );

        // 4. Create a citizen user for this MLA constituency
        const citizenEmail = `citizen.${mla.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@assembly.gov`;
        const citizenUserRes = await client.query(
          `INSERT INTO users (full_name, email, password_hash, role, constituency_id, constituency_type, avatar_url)
           VALUES ($1, $2, $3, 'citizen', $4, 'mla', 'https://avatar.iran.liara.run/public/boy') RETURNING id;`,
          [`Citizen of ${mla.name.split(" ")[0]}`, citizenEmail, passHash, mlaId]
        );
        const citizenUserId = citizenUserRes.rows[0].id;

        // 5. Seed Proposals for this MLA segment via the citizen user
        let mlaCommitted = 0;
        for (let i = 0; i < proposalTemplates.length; i++) {
          const t = proposalTemplates[i];
          const jitterLat = mla.lat + (Math.random() - 0.5) * 0.01;
          const jitterLng = mla.lng + (Math.random() - 0.5) * 0.01;
          
          const status = i === 2 ? "approved" : i === 1 ? "under_review" : "proposed";
          if (status === "approved") {
            mlaCommitted += t.cost;
          }

          const propTitle = `${mla.name.replace(" Vidhan Sabha", "")} ${t.title}`;
          const propDesc = `${t.description} Specifically targeted around the central corridors of ${mla.name}.`;

          const propRes = await client.query(
            `INSERT INTO suggestions (title, description, category, ward_id, status, latitude, longitude, cost_estimate, beneficiary_count, cross_boundary, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, $10) RETURNING id;`,
            [propTitle, propDesc, t.category, `Ward Segment ${String.fromCharCode(65 + i)}`, status, jitterLat, jitterLng, t.cost, t.beneficiaries, citizenUserId]
          );
          const propId = propRes.rows[0].id;

          // 6. Seed AI Analysis details
          await client.query(
            `INSERT INTO ai_analysis (suggestion_id, priority_score, urgency, sentiment, theme, beneficiaries_estimate, ai_metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [propId, t.demand_score, t.urgency, t.sentiment, t.category, t.beneficiaries, JSON.stringify(t.breakdown)]
          );

          // 7. Seed timeline details
          await client.query(
            "INSERT INTO suggestion_timeline (suggestion_id, status, notes) VALUES ($1, $2, $3);",
            [propId, status, `Timeline entry generated for ${propTitle}`]
          );
        }

        // 8. Seed budget details for the MLA
        await client.query(
          "INSERT INTO fund_ledger (constituency_id, total_fund, committed, remaining) VALUES ($1, $2, $3, $4);",
          [mlaId, 50000000, mlaCommitted, 50000000 - mlaCommitted]
        );
      }

      // 9. Seed budget details for the MP
      await client.query(
        "INSERT INTO fund_ledger (constituency_id, total_fund, committed, remaining) VALUES ($1, $2, $3, $4);",
        [mpId, 150000000, 0, 150000000]
      );
    }

    // 10. Insert Universal logins linked to Bengaluru Central / Jayanagar
    console.log("Inserting users...");
    
    // MP
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, constituency_id, constituency_type, avatar_url)
       VALUES ('Tejasvi Surya (MP)', 'mp@assembly.gov', $1, 'mp', $2, 'mp', 'https://avatar.iran.liara.run/public/boy')`,
      [passHash, primaryMpConstId]
    );

    // MLA
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, constituency_id, constituency_type, avatar_url)
       VALUES ('C. K. Ramamurthy (MLA)', 'mla@assembly.gov', $1, 'mla', $2, 'mla', 'https://avatar.iran.liara.run/public/boy')`,
      [passHash, primaryMlaConstId]
    );

    // Staff
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, constituency_id, constituency_type, office, avatar_url)
       VALUES ('Smith (Staff Analyst)', 'staff@assembly.gov', $1, 'staff', $2, 'mp', 'Constituency Management Office', 'https://avatar.iran.liara.run/public/girl')`,
      [passHash, primaryMpConstId]
    );

    // Verification
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, constituency_id, constituency_type, office, avatar_url)
       VALUES ('Davis (Ground Inspector)', 'verification@assembly.gov', $1, 'verification_officer', $2, 'mp', 'Ground Truthing Unit', 'https://avatar.iran.liara.run/public/boy')`,
      [passHash, primaryMpConstId]
    );

    // Citizen
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, constituency_id, constituency_type, avatar_url)
       VALUES ('Rohan Gowda (Citizen)', 'citizen@assembly.gov', $1, 'citizen', $2, 'mla', 'https://avatar.iran.liara.run/public/boy')`,
      [passHash, primaryMlaConstId]
    );

    // Administrator
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, office, avatar_url)
       VALUES ('Admin Coordinator', 'admin@assembly.gov', $1, 'admin', 'National Assembly Operations Unit', 'https://avatar.iran.liara.run/public/girl')`,
      [passHash]
    );

    await client.query("COMMIT");
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", error);
  } finally {
    client.release();
  }
}

seedData().then(() => process.exit(0));
