const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET || "change-this-development-secret";

const sqlConfig = {
  driver: "msnodesqlv8",
  connectionString: [
    "Driver={ODBC Driver 18 for SQL Server}",
    `Server=${process.env.DB_SERVER || "LAPTOP-APDI4PGR"}`,
    `Database=${process.env.DB_NAME || "campusxcompanyDB"}`,
    "Trusted_Connection=Yes",
    `Encrypt=${process.env.DB_ENCRYPT || "Yes"}`,
    `TrustServerCertificate=${process.env.DB_TRUST_SERVER_CERTIFICATE || "Yes"}`
  ].join(";")
};

let poolPromise;
function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig).catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

function sendServerError(res, error, message) {
  console.error(message, error);
  res.status(500).json({ error: message });
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    req.account = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Authentication is required." });
  }
}

const dataTableNames = {
    opportunities: "Opportunities",
    driveRequests: "DriveRequests",
    verificationRequests: "VerificationRequests",
    opportunityReports: "OpportunityReports",
    organizationReports: "OrganizationReports",
    savedOpportunities: "SavedOpportunities",
    notificationPreferences: "NotificationPreferences"
};

function getDataTable(resource) {
  return dataTableNames[resource] || null;
}

function toOpportunityRow(item) {
    return {
      externalId: String(item.id),
      opportunityType: item.type,
      title: item.title,
      companyName: item.company,
      location: item.location,
      workMode: item.mode || null,
      openings: Number(item.openings || 1),
      salary: item.salary || null,
      duration: item.duration || null,
      description: item.description || null,
      eligibility: item.eligibility || null,
      skillsJson: JSON.stringify(Array.isArray(item.skills) ? item.skills : []),
      expiryDate: item.expiryDate || null,
      status: item.status || (item.verified ? "verified" : "pending"),
      isVerified: Boolean(item.verified)
    };
}

function fromOpportunityRow(row) {
    return {
      id: row.ExternalId || row.OpportunityId,
      type: row.OpportunityType,
      title: row.Title,
      company: row.CompanyName,
      location: row.Location,
      mode: row.WorkMode,
      openings: row.Openings,
      salary: row.Salary || undefined,
      duration: row.Duration || undefined,
      description: row.Description || undefined,
      eligibility: row.Eligibility || undefined,
      skills: JSON.parse(row.SkillsJson || "[]"),
      expiryDate: row.ExpiryDate ? String(row.ExpiryDate).slice(0, 10) : "",
      status: row.Status,
      verified: Boolean(row.IsVerified),
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
}

function toGenericRow(resource, item) {
    if (resource === "opportunities") return toOpportunityRow(item);
    if (resource === "driveRequests") return {
      externalId: String(item.id),
      companyName: item.company,
      collegeName: item.college,
      driveDate: item.date,
      expectedStudents: Number(item.students || 0),
      message: item.message || null,
      adminStatus: item.adminStatus || "pending",
      requestStatus: item.status || "pending"
    };
    if (resource === "verificationRequests") return {
      externalId: String(item.id),
      accountType: item.accountType,
      organizationName: item.organizationName,
      contactEmail: item.contactEmail,
      location: item.location || null,
      registrationNumber: item.registrationNumber,
      website: item.website || null,
      note: item.note || null,
      status: item.status || "pending",
      submittedAt: item.submittedAt || new Date().toISOString(),
      documentsJson: JSON.stringify(item.documents || [])
    };
    if (resource === "opportunityReports") return {
      externalId: String(item.id),
      opportunityId: Number(item.opportunityId),
      opportunityTitle: item.title,
      companyName: item.company,
      opportunityType: item.type,
      reportedBy: item.reportedBy,
      reporterEmail: item.reporterEmail || null,
      reason: item.reason,
      details: item.details || null,
      status: item.status || "pending",
      reportedAt: item.reportedAt || new Date().toISOString()
    };
    if (resource === "organizationReports") return {
      externalId: String(item.id),
      accountType: item.accountType,
      organizationName: item.organizationName,
      reportedBy: item.reportedBy,
      reporterEmail: item.reporterEmail || null,
      reason: item.reason,
      details: item.details || null,
      status: item.status || "pending",
      reportedAt: item.reportedAt || new Date().toISOString()
    };
    return null;
}

function fromGenericRow(resource, row) {
    if (resource === "opportunities") return fromOpportunityRow(row);
    if (resource === "driveRequests") return {
      id: row.ExternalId || row.DriveRequestId,
      company: row.CompanyName,
      college: row.CollegeName,
      date: row.DriveDate ? String(row.DriveDate).slice(0, 10) : "",
      students: row.ExpectedStudents,
      message: row.Message || "",
      adminStatus: row.AdminStatus,
      status: row.RequestStatus,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
    if (resource === "verificationRequests") return {
      id: row.ExternalId || row.VerificationRequestId,
      accountType: row.AccountType,
      organizationName: row.OrganizationName,
      contactEmail: row.ContactEmail,
      location: row.Location || "",
      registrationNumber: row.RegistrationNumber,
      website: row.Website || "",
      note: row.Note || "",
      documents: JSON.parse(row.DocumentsJson || "[]"),
      status: row.Status,
      submittedAt: row.SubmittedAt,
      reviewedAt: row.ReviewedAt
    };
    return {
      id: row.ExternalId || row.OpportunityReportId || row.OrganizationReportId,
      ...(resource === "opportunityReports"
        ? {
            opportunityId: row.OpportunityId,
            title: row.OpportunityTitle,
            company: row.CompanyName,
            type: row.OpportunityType
          }
        : {
            accountType: row.AccountType,
            organizationName: row.OrganizationName
          }),
      reportedBy: row.ReportedBy,
      reporterEmail: row.ReporterEmail || "",
      reason: row.Reason,
      details: row.Details || "",
      status: row.Status,
      reportedAt: row.ReportedAt,
      reviewedAt: row.ReviewedAt
    };
}

async function initializeDatabase() {
  const pool = await getPool();
  const schema = fs.readFileSync(path.join(__dirname, "database", "schema.sql"), "utf8");
  await pool.request().batch(schema);
  console.log("Database schema is ready.");
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS connected");
    res.json({ ok: true, database: process.env.DB_NAME || "campusxcompanyDB" });
  } catch (error) {
    sendServerError(res, error, "Database connection failed.");
  }
});

app.post("/api/auth/register", async (req, res) => {
  const {
    accountType,
    organizationName,
    email,
    password,
    location,
    collegeTier,
    geoLocation,
    industry
  } = req.body || {};

  if (!["college", "company"].includes(accountType) ||
      !organizationName?.trim() ||
      !email?.trim() ||
      !password ||
      !location?.trim()) {
    return res.status(400).json({ error: "Complete all required signup fields." });
  }

  if (accountType === "college" && !["Tier 1", "Tier 2", "Tier 3"].includes(collegeTier)) {
    return res.status(400).json({ error: "Select a valid college tier." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const pool = await getPool();
    const request = pool.request()
      .input("accountType", sql.NVarChar(20), accountType)
      .input("organizationName", sql.NVarChar(200), organizationName.trim())
      .input("email", sql.NVarChar(320), email.trim().toLowerCase())
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .input("location", sql.NVarChar(200), location.trim())
      .input("collegeTier", sql.NVarChar(20), accountType === "college" ? collegeTier : null)
      .input("geoLocation", sql.NVarChar(200), accountType === "college" ? (geoLocation?.trim() || null) : null)
      .input("industry", sql.NVarChar(150), accountType === "company" ? (industry?.trim() || "Software & Technology") : null)
    await request.query(`
        INSERT INTO dbo.Signups
          (AccountType, OrganizationName, Email, PasswordHash, Location, CollegeTier, GeoLocation, Industry)
        VALUES
          (@accountType, @organizationName, @email, @passwordHash, @location, @collegeTier, @geoLocation, @industry)
      `);
    if (accountType === "company") {
      await pool.request()
        .input("name", sql.NVarChar(200), organizationName.trim())
        .input("email", sql.NVarChar(320), email.trim().toLowerCase())
        .input("location", sql.NVarChar(200), location.trim())
        .input("industry", sql.NVarChar(150), industry?.trim() || "Software & Technology")
        .query(`
          INSERT INTO dbo.Companies (CompanyName, Email, Location, Industry)
          VALUES (@name, @email, @location, @industry)
        `);
    } else {
      await pool.request()
        .input("name", sql.NVarChar(200), organizationName.trim())
        .input("email", sql.NVarChar(320), email.trim().toLowerCase())
        .input("location", sql.NVarChar(200), location.trim())
        .input("tier", sql.NVarChar(20), collegeTier)
        .input("geoLocation", sql.NVarChar(200), geoLocation?.trim() || null)
        .query(`
          INSERT INTO dbo.Colleges (CollegeName, Email, Location, CollegeTier, GeoLocation)
          VALUES (@name, @email, @location, @tier, @geoLocation)
        `);
    }

    const normalizedEmail = email.trim().toLowerCase();
    res.status(201).json({
      accountType,
      email: normalizedEmail,
      token: jwt.sign({ email: normalizedEmail, accountType }, jwtSecret, { expiresIn: "8h" })
    });
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    sendServerError(res, error, "Unable to create the account.");
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("email", sql.NVarChar(320), email.trim().toLowerCase())
      .query(`
        SELECT TOP 1 SignupId, AccountType, OrganizationName, Email, PasswordHash, AccountStatus
        FROM dbo.Signups
        WHERE Email = @email
      `);
    const account = result.recordset[0];
    if (!account || account.AccountStatus !== "active" || !(await bcrypt.compare(password, account.PasswordHash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
      accountType: account.AccountType,
      organizationName: account.OrganizationName,
      email: account.Email,
      token: jwt.sign(
        { email: account.Email, accountType: account.AccountType },
        jwtSecret,
        { expiresIn: "8h" }
      )
    });
  } catch (error) {
    sendServerError(res, error, "Unable to sign in.");
  }
});

app.get("/api/profiles/:accountType/:email", requireAuth, async (req, res) => {
  const { accountType, email } = req.params;
  const table = accountType === "company" ? "Companies" : accountType === "college" ? "Colleges" : null;
  if (!table) return res.status(400).json({ error: "Invalid account type." });
  if (req.account.email !== decodeURIComponent(email).toLowerCase() ||
      req.account.accountType !== accountType) {
    return res.status(403).json({ error: "You cannot access this profile." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("email", sql.NVarChar(320), decodeURIComponent(email).toLowerCase())
      .query(`
        SELECT TOP 1 *
        FROM dbo.${table}
        WHERE Email = @email
      `);
    if (!result.recordset[0]) return res.status(404).json({ error: "Profile not found." });
    res.json(result.recordset[0]);
  } catch (error) {
    sendServerError(res, error, "Unable to load the profile.");
  }
});

app.put("/api/profiles/:accountType/:email", requireAuth, async (req, res) => {
  const { accountType, email } = req.params;
  const table = accountType === "company" ? "Companies" : accountType === "college" ? "Colleges" : null;
  if (!table) return res.status(400).json({ error: "Invalid account type." });
  if (req.account.email !== decodeURIComponent(email).toLowerCase() ||
      req.account.accountType !== accountType) {
    return res.status(403).json({ error: "You cannot update this profile." });
  }

  const profile = req.body || {};
  try {
    const pool = await getPool();
    const request = pool.request()
      .input("email", sql.NVarChar(320), decodeURIComponent(email).toLowerCase())
      .input("name", sql.NVarChar(200), profile.name?.trim())
      .input("location", sql.NVarChar(200), profile.location?.trim())
      .input("phone", sql.NVarChar(30), profile.phone?.trim() || null)
      .input("website", sql.NVarChar(500), profile.website?.trim() || null)
      .input("status", sql.NVarChar(30), profile.verificationStatus || "not_submitted");

    if (table === "Companies") {
      await request
        .input("industry", sql.NVarChar(150), profile.industry?.trim() || "Software & Technology")
        .query(`
          UPDATE dbo.Companies
          SET CompanyName = @name, Location = @location, Industry = @industry,
              Phone = @phone, Website = @website, VerificationStatus = @status,
              UpdatedAt = SYSUTCDATETIME()
          WHERE Email = @email
        `);
    } else {
      await request
        .input("tier", sql.NVarChar(20), profile.tier || "Tier 2")
        .input("geoLocation", sql.NVarChar(200), profile.geoLocation?.trim() || null)
        .query(`
          UPDATE dbo.Colleges
          SET CollegeName = @name, Location = @location, CollegeTier = @tier,
              GeoLocation = @geoLocation, Phone = @phone, Website = @website,
              VerificationStatus = @status, UpdatedAt = SYSUTCDATETIME()
          WHERE Email = @email
        `);
    }
    res.json({ ok: true });
  } catch (error) {
    sendServerError(res, error, "Unable to save the profile.");
  }
});

app.get("/api/data/:resource", async (req, res) => {
  const { resource } = req.params;
  const table = getDataTable(resource);
  if (!table) return res.status(404).json({ error: "Unknown data resource." });
  try {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM dbo.${table} ORDER BY 1 DESC`);
    if (resource === "opportunities") return res.json(result.recordset.map(fromOpportunityRow));
    if (resource === "driveRequests" || resource === "verificationRequests" ||
        resource === "opportunityReports" || resource === "organizationReports") {
      return res.json(result.recordset.map((row) => fromGenericRow(resource, row)));
    }
    res.json(result.recordset);
  } catch (error) {
    sendServerError(res, error, "Unable to load application data.");
  }
});

app.put("/api/data/:resource", async (req, res) => {
  const { resource } = req.params;
  const table = getDataTable(resource);
  if (!table || !Array.isArray(req.body)) {
    return res.status(400).json({ error: "A valid data collection is required." });
  }
  const rows = req.body.map((item) => toGenericRow(resource, item)).filter(Boolean);
  if (resource === "savedOpportunities" || resource === "notificationPreferences") {
    return res.status(400).json({ error: "Use the dedicated endpoint for this resource." });
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    await new sql.Request(transaction).query(`DELETE FROM dbo.${table}`);
    for (const row of rows) {
      const request = new sql.Request(transaction);
      if (resource === "opportunities") {
        await request.input("externalId", sql.NVarChar(100), row.externalId)
          .input("type", sql.NVarChar(20), row.opportunityType)
          .input("title", sql.NVarChar(200), row.title)
          .input("company", sql.NVarChar(200), row.companyName)
          .input("location", sql.NVarChar(200), row.location)
          .input("mode", sql.NVarChar(50), row.workMode)
          .input("openings", sql.Int, row.openings)
          .input("salary", sql.NVarChar(100), row.salary)
          .input("duration", sql.NVarChar(100), row.duration)
          .input("description", sql.NVarChar(sql.MAX), row.description)
          .input("eligibility", sql.NVarChar(sql.MAX), row.eligibility)
          .input("skills", sql.NVarChar(sql.MAX), row.skillsJson)
          .input("expiry", sql.Date, row.expiryDate)
          .input("status", sql.NVarChar(30), row.status)
          .input("verified", sql.Bit, row.isVerified)
          .query(`
            INSERT INTO dbo.Opportunities
              (ExternalId, OpportunityType, Title, CompanyName, Location, WorkMode, Openings, Salary,
               Duration, Description, Eligibility, SkillsJson, ExpiryDate, Status, IsVerified)
            VALUES (@externalId, @type, @title, @company, @location, @mode, @openings, @salary,
               @duration, @description, @eligibility, @skills, @expiry, @status, @verified)
          `);
      } else if (resource === "driveRequests") {
        await request.input("externalId", sql.NVarChar(100), row.externalId)
          .input("company", sql.NVarChar(200), row.companyName)
          .input("college", sql.NVarChar(200), row.collegeName)
          .input("date", sql.Date, row.driveDate)
          .input("students", sql.Int, row.expectedStudents)
          .input("message", sql.NVarChar(2000), row.message)
          .input("adminStatus", sql.NVarChar(30), row.adminStatus)
          .input("status", sql.NVarChar(30), row.requestStatus)
          .query(`
            INSERT INTO dbo.DriveRequests
              (ExternalId, CompanyName, CollegeName, DriveDate, ExpectedStudents, Message, AdminStatus, RequestStatus)
            VALUES (@externalId, @company, @college, @date, @students, @message, @adminStatus, @status)
          `);
      } else if (resource === "verificationRequests") {
        await request.input("externalId", sql.NVarChar(100), row.externalId)
          .input("accountType", sql.NVarChar(20), row.accountType)
          .input("organization", sql.NVarChar(200), row.organizationName)
          .input("email", sql.NVarChar(320), row.contactEmail)
          .input("location", sql.NVarChar(200), row.location)
          .input("registration", sql.NVarChar(100), row.registrationNumber)
          .input("website", sql.NVarChar(500), row.website)
          .input("note", sql.NVarChar(2000), row.note)
          .input("status", sql.NVarChar(30), row.status)
          .input("submittedAt", sql.DateTime2, row.submittedAt)
          .input("documents", sql.NVarChar(sql.MAX), row.documentsJson)
          .query(`
            INSERT INTO dbo.VerificationRequests
              (ExternalId, AccountType, OrganizationName, ContactEmail, Location, RegistrationNumber,
               Website, Note, Status, SubmittedAt, DocumentsJson)
            VALUES (@externalId, @accountType, @organization, @email, @location, @registration,
               @website, @note, @status, @submittedAt, @documents)
          `);
      } else {
        const isOpportunity = resource === "opportunityReports";
        await request.input("externalId", sql.NVarChar(100), row.externalId)
          .input("accountType", sql.NVarChar(20), row.accountType || null)
          .input("organization", sql.NVarChar(200), row.organizationName || null)
          .input("opportunityId", sql.Int, row.opportunityId || null)
          .input("title", sql.NVarChar(200), row.opportunityTitle || null)
          .input("company", sql.NVarChar(200), row.companyName || null)
          .input("type", sql.NVarChar(20), row.opportunityType || null)
          .input("reportedBy", sql.NVarChar(200), row.reportedBy)
          .input("reporterEmail", sql.NVarChar(320), row.reporterEmail)
          .input("reason", sql.NVarChar(100), row.reason)
          .input("details", sql.NVarChar(2000), row.details)
          .input("status", sql.NVarChar(30), row.status)
          .input("reportedAt", sql.DateTime2, row.reportedAt)
          .query(isOpportunity
            ? `INSERT INTO dbo.OpportunityReports
                (ExternalId, OpportunityId, OpportunityTitle, CompanyName, OpportunityType, ReportedBy,
                 ReporterEmail, Reason, Details, Status, ReportedAt)
               VALUES (@externalId, @opportunityId, @title, @company, @type, @reportedBy,
                 @reporterEmail, @reason, @details, @status, @reportedAt)`
            : `INSERT INTO dbo.OrganizationReports
                (ExternalId, AccountType, OrganizationName, ReportedBy, ReporterEmail, Reason, Details, Status, ReportedAt)
               VALUES (@externalId, @accountType, @organization, @reportedBy, @reporterEmail,
                 @reason, @details, @status, @reportedAt)`);
      }
    }
    await transaction.commit();
    res.json({ ok: true, count: rows.length });
  } catch (error) {
    await transaction.rollback().catch(() => {});
    sendServerError(res, error, "Unable to save application data.");
  }
});

app.put("/api/data/saved-opportunities/:email", async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: "Saved opportunity IDs are required." });
  try {
    const pool = await getPool();
    const email = decodeURIComponent(req.params.email).toLowerCase();
    await pool.request().input("email", sql.NVarChar(320), email)
      .query("DELETE FROM dbo.SavedOpportunities WHERE CollegeEmail = @email");
    for (const opportunityId of req.body) {
      await pool.request().input("email", sql.NVarChar(320), email)
        .input("opportunityId", sql.Int, Number(opportunityId))
        .query("INSERT INTO dbo.SavedOpportunities (CollegeEmail, OpportunityId) VALUES (@email, @opportunityId)");
    }
    res.json({ ok: true });
  } catch (error) {
    sendServerError(res, error, "Unable to save bookmarked opportunities.");
  }
});

app.get("/api/data/saved-opportunities/:email", async (req, res) => {
  try {
    const result = await (await getPool()).request()
      .input("email", sql.NVarChar(320), decodeURIComponent(req.params.email).toLowerCase())
      .query("SELECT OpportunityId FROM dbo.SavedOpportunities WHERE CollegeEmail = @email");
    res.json(result.recordset.map((row) => String(row.OpportunityId)));
  } catch (error) {
    sendServerError(res, error, "Unable to load bookmarked opportunities.");
  }
});

app.put("/api/data/notifications/:scope", async (req, res) => {
  const { readIds = [], dismissedIds = [], email = null } = req.body || {};
  try {
    await (await getPool()).request()
      .input("scope", sql.NVarChar(30), req.params.scope)
      .input("email", sql.NVarChar(320), email)
      .input("readIds", sql.NVarChar(sql.MAX), JSON.stringify(readIds))
      .input("dismissedIds", sql.NVarChar(sql.MAX), JSON.stringify(dismissedIds))
      .query(`
        MERGE dbo.NotificationPreferences AS target
        USING (SELECT @scope AS AccountScope, @email AS AccountEmail) AS source
        ON target.AccountScope = source.AccountScope
          AND ISNULL(target.AccountEmail, N'') = ISNULL(source.AccountEmail, N'')
        WHEN MATCHED THEN UPDATE SET ReadNotificationIdsJson = @readIds,
          DismissedNotificationIdsJson = @dismissedIds, UpdatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT
          (AccountScope, AccountEmail, ReadNotificationIdsJson, DismissedNotificationIdsJson)
          VALUES (@scope, @email, @readIds, @dismissedIds);
      `);
    res.json({ ok: true });
  } catch (error) {
    sendServerError(res, error, "Unable to save notification preferences.");
  }
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to initialize the database schema.", error);
    process.exitCode = 1;
  });
