using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactMvcApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActionHistory",
                columns: table => new
                {
                    history_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    referenceNumber = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    ActionTaker = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    ActionTaken = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    ActionTakenDate = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ActionHistory_PK", x => x.history_id);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationPerDistrict",
                columns: table => new
                {
                    UUID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DistrictId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    FinancialYear = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    CountValue = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationPerDistrict", x => x.UUID);
                });

            migrationBuilder.CreateTable(
                name: "Certificates",
                columns: table => new
                {
                    UUID = table.Column<int>(type: "int", nullable: false),
                    OfficerId = table.Column<int>(type: "int", nullable: false),
                    EncryptedCertificateData = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    EncryptedPassword = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    encryptionKey = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    encryptionIV = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    RegisteredDate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "Citizen_Applications",
                columns: table => new
                {
                    ReferenceNumber = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Citizen_id = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    FormDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WorkFlow = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdditionalDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentPlayer = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Created_at = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Citizen_Applications", x => x.ReferenceNumber);
                });

            migrationBuilder.CreateTable(
                name: "District",
                columns: table => new
                {
                    DistrictID = table.Column<int>(type: "int", nullable: false),
                    DistrictName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    DistrictShort = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Division = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "OfficerDetails",
                columns: table => new
                {
                    DetailId = table.Column<int>(type: "int", nullable: false),
                    OfficerId = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    AccessLevel = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    AccessCode = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "OfficersDesignations",
                columns: table => new
                {
                    UUID = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    DesignationShort = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    AccessLevel = table.Column<string>(type: "varchar(40)", unicode: false, maxLength: 40, nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    ServiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    NameShort = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Department = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    FormElement = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    BankDetails = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    OfficerEditableField = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentFields = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pool = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Approve = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApprovalListEnabled = table.Column<bool>(type: "bit", nullable: true),
                    webService = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.ServiceId);
                });

            migrationBuilder.CreateTable(
                name: "Tehsil",
                columns: table => new
                {
                    DistrictID = table.Column<int>(type: "int", nullable: false),
                    TehsilId = table.Column<int>(type: "int", nullable: false),
                    TehsilName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    Username = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    Password = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    MobileNumber = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    Profile = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    UserType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true),
                    BackupCodes = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    IsEmailValid = table.Column<bool>(type: "bit", nullable: false),
                    RegisteredDate = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "Pool",
                columns: table => new
                {
                    PoolId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    AccessLevel = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    AccessCode = table.Column<int>(type: "int", nullable: false),
                    List = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pool", x => x.PoolId);
                    table.ForeignKey(
                        name: "FK_Pool_Services",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "ServiceId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pool_ServiceId",
                table: "Pool",
                column: "ServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActionHistory");

            migrationBuilder.DropTable(
                name: "ApplicationPerDistrict");

            migrationBuilder.DropTable(
                name: "Certificates");

            migrationBuilder.DropTable(
                name: "Citizen_Applications");

            migrationBuilder.DropTable(
                name: "District");

            migrationBuilder.DropTable(
                name: "OfficerDetails");

            migrationBuilder.DropTable(
                name: "OfficersDesignations");

            migrationBuilder.DropTable(
                name: "Pool");

            migrationBuilder.DropTable(
                name: "Tehsil");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Services");
        }
    }
}
