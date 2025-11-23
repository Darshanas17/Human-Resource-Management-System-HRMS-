import { dbRun, dbGet, dbAll } from "./models/database.js";
import bcrypt from "bcryptjs";
import { initDatabase } from "./models/database.js";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Initialize database first
    await initDatabase();
    console.log("Database initialized");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await dbRun("DELETE FROM logs");
    await dbRun("DELETE FROM employee_teams");
    await dbRun("DELETE FROM employees");
    await dbRun("DELETE FROM teams");
    await dbRun("DELETE FROM users");
    await dbRun("DELETE FROM organisations");
    console.log("Existing data cleared");

    // 1. Create sample organisations
    console.log("Creating organisations...");
    const org1 = await dbRun("INSERT INTO organisations (name) VALUES (?)", [
      "Tech Solutions Inc.",
    ]);
    const org1Id = org1.lastID;

    const org2 = await dbRun("INSERT INTO organisations (name) VALUES (?)", [
      "Marketing Pro Ltd.",
    ]);
    const org2Id = org2.lastID;

    console.log(`Created organisations: ${org1Id}, ${org2Id}`);

    // 2. Create admin users for each organisation
    console.log("Creating admin users...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin1 = await dbRun(
      "INSERT INTO users (organisation_id, email, password_hash, name) VALUES (?, ?, ?, ?)",
      [org1Id, "admin@techsolutions.com", hashedPassword, "John Admin"]
    );

    const admin2 = await dbRun(
      "INSERT INTO users (organisation_id, email, password_hash, name) VALUES (?, ?, ?, ?)",
      [org2Id, "admin@marketingpro.com", hashedPassword, "Sarah Manager"]
    );

    console.log("Admin users created");

    // 3. Create sample employees for Tech Solutions Inc.
    console.log("Creating employees for Tech Solutions...");
    const techEmployees = [
      {
        first_name: "Alice",
        last_name: "Johnson",
        email: "alice.johnson@techsolutions.com",
        phone: "+1-555-0101",
        position: "Senior Developer",
      },
      {
        first_name: "Bob",
        last_name: "Smith",
        email: "bob.smith@techsolutions.com",
        phone: "+1-555-0102",
        position: "DevOps Engineer",
      },
      {
        first_name: "Carol",
        last_name: "Williams",
        email: "carol.williams@techsolutions.com",
        phone: "+1-555-0103",
        position: "Frontend Developer",
      },
      {
        first_name: "David",
        last_name: "Brown",
        email: "david.brown@techsolutions.com",
        phone: "+1-555-0104",
        position: "Backend Developer",
      },
      {
        first_name: "Eva",
        last_name: "Davis",
        email: "eva.davis@techsolutions.com",
        phone: "+1-555-0105",
        position: "QA Engineer",
      },
    ];

    const techEmployeeIds = [];
    for (const emp of techEmployees) {
      const result = await dbRun(
        "INSERT INTO employees (organisation_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)",
        [org1Id, emp.first_name, emp.last_name, emp.email, emp.phone]
      );
      techEmployeeIds.push(result.lastID);
    }
    console.log(
      `Created ${techEmployeeIds.length} employees for Tech Solutions`
    );

    // 4. Create sample employees for Marketing Pro Ltd.
    console.log("Creating employees for Marketing Pro...");
    const marketingEmployees = [
      {
        first_name: "Frank",
        last_name: "Miller",
        email: "frank.miller@marketingpro.com",
        phone: "+1-555-0201",
        position: "Marketing Manager",
      },
      {
        first_name: "Grace",
        last_name: "Wilson",
        email: "grace.wilson@marketingpro.com",
        phone: "+1-555-0202",
        position: "Content Writer",
      },
      {
        first_name: "Henry",
        last_name: "Moore",
        email: "henry.moore@marketingpro.com",
        phone: "+1-555-0203",
        position: "SEO Specialist",
      },
      {
        first_name: "Ivy",
        last_name: "Taylor",
        email: "ivy.taylor@marketingpro.com",
        phone: "+1-555-0204",
        position: "Social Media Manager",
      },
    ];

    const marketingEmployeeIds = [];
    for (const emp of marketingEmployees) {
      const result = await dbRun(
        "INSERT INTO employees (organisation_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)",
        [org2Id, emp.first_name, emp.last_name, emp.email, emp.phone]
      );
      marketingEmployeeIds.push(result.lastID);
    }
    console.log(
      `Created ${marketingEmployeeIds.length} employees for Marketing Pro`
    );

    // 5. Create teams for Tech Solutions Inc.
    console.log("Creating teams for Tech Solutions...");
    const techTeams = [
      {
        name: "Development Team",
        description:
          "Full-stack development team responsible for web applications",
      },
      {
        name: "DevOps Team",
        description: "Infrastructure and deployment management",
      },
      {
        name: "Quality Assurance",
        description: "Testing and quality control team",
      },
    ];

    const techTeamIds = [];
    for (const team of techTeams) {
      const result = await dbRun(
        "INSERT INTO teams (organisation_id, name, description) VALUES (?, ?, ?)",
        [org1Id, team.name, team.description]
      );
      techTeamIds.push(result.lastID);
    }

    // 6. Create teams for Marketing Pro Ltd.
    console.log("Creating teams for Marketing Pro...");
    const marketingTeams = [
      {
        name: "Content Team",
        description: "Content creation and copywriting",
      },
      {
        name: "Digital Marketing",
        description: "SEO, SEM, and online campaigns",
      },
      {
        name: "Social Media",
        description: "Social media management and engagement",
      },
    ];

    const marketingTeamIds = [];
    for (const team of marketingTeams) {
      const result = await dbRun(
        "INSERT INTO teams (organisation_id, name, description) VALUES (?, ?, ?)",
        [org2Id, team.name, team.description]
      );
      marketingTeamIds.push(result.lastID);
    }

    console.log("Teams created for both organisations");

    // 7. Assign employees to teams (Tech Solutions)
    console.log("Assigning employees to teams...");

    // Tech Solutions assignments
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [techEmployeeIds[0], techTeamIds[0]] // Alice to Development
    );
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [techEmployeeIds[1], techTeamIds[1]] // Bob to DevOps
    );
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [techEmployeeIds[2], techTeamIds[0]] // Carol to Development
    );
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [techEmployeeIds[3], techTeamIds[0]] // David to Development
    );
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [techEmployeeIds[4], techTeamIds[2]] // Eva to QA
    );

    // Marketing Pro assignments
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [marketingEmployeeIds[0], marketingTeamIds[0]] // Frank to Content
    );
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [marketingEmployeeIds[1], marketingTeamIds[0]] // Grace to Content
    );
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [marketingEmployeeIds[2], marketingTeamIds[1]] // Henry to Digital Marketing
    );
    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [marketingEmployeeIds[3], marketingTeamIds[2]] // Ivy to Social Media
    );

    console.log("Employee-team assignments completed");

    // 8. Create sample audit logs
    console.log("Creating sample audit logs...");

    const techLogs = [
      {
        action: "employee_created",
        meta: {
          employeeId: techEmployeeIds[0],
          first_name: "Alice",
          last_name: "Johnson",
        },
      },
      {
        action: "employee_created",
        meta: {
          employeeId: techEmployeeIds[1],
          first_name: "Bob",
          last_name: "Smith",
        },
      },
      {
        action: "team_created",
        meta: { teamId: techTeamIds[0], name: "Development Team" },
      },
      {
        action: "employee_assigned",
        meta: { employeeId: techEmployeeIds[0], teamId: techTeamIds[0] },
      },
      {
        action: "user_login",
        meta: { email: "admin@techsolutions.com" },
      },
    ];

    for (const log of techLogs) {
      await dbRun(
        "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
        [org1Id, admin1.lastID, log.action, JSON.stringify(log.meta)]
      );
    }

    const marketingLogs = [
      {
        action: "employee_created",
        meta: {
          employeeId: marketingEmployeeIds[0],
          first_name: "Frank",
          last_name: "Miller",
        },
      },
      {
        action: "team_created",
        meta: { teamId: marketingTeamIds[0], name: "Content Team" },
      },
      {
        action: "employee_assigned",
        meta: {
          employeeId: marketingEmployeeIds[0],
          teamId: marketingTeamIds[0],
        },
      },
      {
        action: "user_login",
        meta: { email: "admin@marketingpro.com" },
      },
    ];

    for (const log of marketingLogs) {
      await dbRun(
        "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
        [org2Id, admin2.lastID, log.action, JSON.stringify(log.meta)]
      );
    }

    console.log("Sample audit logs created");

    // 9. Display summary
    console.log("\n=== SEEDING COMPLETED SUCCESSFULLY ===");
    console.log("Sample data has been populated with:");
    console.log(`- 2 Organisations`);
    console.log(`- 2 Admin Users`);
    console.log(
      `- ${techEmployees.length + marketingEmployees.length} Employees total`
    );
    console.log(`- ${techTeams.length + marketingTeams.length} Teams total`);
    console.log(`- Multiple Employee-Team assignments`);
    console.log(`- Sample audit logs`);

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Organisation 1 - Tech Solutions Inc.:");
    console.log("  Email: admin@techsolutions.com");
    console.log("  Password: admin123");
    console.log("\nOrganisation 2 - Marketing Pro Ltd.:");
    console.log("  Email: admin@marketingpro.com");
    console.log("  Password: admin123");

    console.log(
      "\nYou can now start the application and login with these credentials!"
    );
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
