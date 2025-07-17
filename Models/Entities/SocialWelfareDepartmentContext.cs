﻿using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SahayataNidhi.Models.Entities;

public partial class SocialWelfareDepartmentContext : DbContext
{
    public SocialWelfareDepartmentContext()
    {
    }

    public SocialWelfareDepartmentContext(DbContextOptions<SocialWelfareDepartmentContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ActionHistory> ActionHistories { get; set; }

    public virtual DbSet<ApplicationPerDistrict> ApplicationPerDistricts { get; set; }

    public virtual DbSet<BankDetail> BankDetails { get; set; }

    public virtual DbSet<Block> Blocks { get; set; }

    public virtual DbSet<Certificate> Certificates { get; set; }

    public virtual DbSet<CitizenApplication> CitizenApplications { get; set; }

    public virtual DbSet<District> Districts { get; set; }

    public virtual DbSet<EmailSetting> EmailSettings { get; set; }

    public virtual DbSet<HalqaPanchayat> HalqaPanchayats { get; set; }

    public virtual DbSet<Muncipality> Muncipalities { get; set; }

    public virtual DbSet<MuncipalityType> MuncipalityTypes { get; set; }

    public virtual DbSet<OfficersDesignation> OfficersDesignations { get; set; }

    public virtual DbSet<PensionPayment> PensionPayments { get; set; }

    public virtual DbSet<Pool> Pools { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<Tehsil> Tehsils { get; set; }

    public virtual DbSet<Tswotehsil> Tswotehsils { get; set; }

    public virtual DbSet<UploadedFile> UploadedFiles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserDocument> UserDocuments { get; set; }

    public virtual DbSet<Village> Villages { get; set; }

    public virtual DbSet<Ward> Wards { get; set; }

    public virtual DbSet<WebService> WebServices { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ActionHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("ActionHistory_PK");

            entity.ToTable("ActionHistory");

            entity.Property(e => e.HistoryId).HasColumnName("history_id");
            entity.Property(e => e.ActionTaken)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ActionTakenDate)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ActionTaker)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.LocationLevel)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("referenceNumber");
            entity.Property(e => e.Remarks)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ApplicationPerDistrict>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("ApplicationPerDistrict");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.FinancialYear)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<BankDetail>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("ADDRESS");
            entity.Property(e => e.Bank)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("BANK");
            entity.Property(e => e.Branch)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("BRANCH");
            entity.Property(e => e.City1)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("CITY1");
            entity.Property(e => e.City2)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("CITY2");
            entity.Property(e => e.Ifsc)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("IFSC");
            entity.Property(e => e.Phone)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("PHONE");
            entity.Property(e => e.State)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("STATE");
            entity.Property(e => e.StdCode)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("STD CODE");
        });

        modelBuilder.Entity<Block>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.BlockName)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Certificate>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.CertifiyingAuthority)
                .IsUnicode(false)
                .HasColumnName("certifiyingAuthority");
            entity.Property(e => e.ExpirationDate)
                .HasColumnType("datetime")
                .HasColumnName("expirationDate");
            entity.Property(e => e.RegisteredDate)
                .HasMaxLength(50)
                .HasColumnName("registeredDate");
            entity.Property(e => e.SerialNumber).HasColumnName("serialNumber");
        });

        modelBuilder.Entity<CitizenApplication>(entity =>
        {
            entity.HasKey(e => e.ReferenceNumber);

            entity.ToTable("Citizen_Applications");

            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CitizenId).HasColumnName("Citizen_id");
            entity.Property(e => e.CreatedAt)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Created_at");
            entity.Property(e => e.DeptVerified).HasDefaultValue(false);
            entity.Property(e => e.DistrictUidForBank)
                .HasMaxLength(6)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.VerifiedByDeptOn)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<District>(entity =>
        {
            entity.HasKey(e => e.DistrictId).HasName("District_PK");

            entity.ToTable("District");

            entity.Property(e => e.DistrictId)
                .ValueGeneratedNever()
                .HasColumnName("DistrictID");
            entity.Property(e => e.DistrictName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DistrictShort)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Uuid).HasColumnName("UUID");
        });

        modelBuilder.Entity<EmailSetting>(entity =>
        {
            entity.Property(e => e.Password).HasColumnType("text");
            entity.Property(e => e.SenderEmail)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.SenderName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.SmtpServer)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<HalqaPanchayat>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("HalqaPanchayat");

            entity.Property(e => e.HalqaPanchayatName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Uuid)
                .ValueGeneratedOnAdd()
                .HasColumnName("UUID");
        });

        modelBuilder.Entity<Muncipality>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.MuncipalityName)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<MuncipalityType>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.TypeName)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<OfficersDesignation>(entity =>
        {
            entity.HasKey(e => e.Uuid).HasName("OfficersDesignations_PK");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.AccessLevel)
                .HasMaxLength(40)
                .IsUnicode(false);
            entity.Property(e => e.Designation).IsUnicode(false);
            entity.Property(e => e.DesignationShort)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<PensionPayment>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.BankResBankDateExecuted)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("bankRes_BankDateExecuted");
            entity.Property(e => e.BankResPensionerCategory)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("bankRes_pensionerCategory");
            entity.Property(e => e.BankResStatusFromBank)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("bankRes_StatusFromBank");
            entity.Property(e => e.BankResTransactionId)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("bankRes_TransactionId");
            entity.Property(e => e.BankResTransactionStatus)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("bankRes_TransactionStatus");
            entity.Property(e => e.DistrictBankUid)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("districtBankUID");
            entity.Property(e => e.DistrictId)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("districtId");
            entity.Property(e => e.DistrictName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("districtName");
            entity.Property(e => e.DivisionCode)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("divisionCode");
            entity.Property(e => e.DivisionName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("divisionName");
            entity.Property(e => e.PayingDepartment)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("payingDepartment");
            entity.Property(e => e.PayingDeptAccountNumber)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("payingDeptAccountNumber");
            entity.Property(e => e.PayingDeptBankName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("payingDeptBankName");
            entity.Property(e => e.PayingDeptIfscCode)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("payingDeptIfscCode");
            entity.Property(e => e.PaymentFileGenerationDate)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("paymentFileGenerationDate");
            entity.Property(e => e.PaymentOfMonth)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("paymentOfMonth");
            entity.Property(e => e.PaymentOfYear)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("paymentOfYear");
            entity.Property(e => e.PensionAmount)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("pensionAmount");
            entity.Property(e => e.PensionerAccountNo)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("pensionerAccountNo");
            entity.Property(e => e.PensionerIfscCode)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("pensionerIfscCode");
            entity.Property(e => e.PensionerName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("pensionerName");
            entity.Property(e => e.PensionerType)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("pensionerType");
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("referenceNumber");
            entity.Property(e => e.StateCode)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("stateCode");
            entity.Property(e => e.StateName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("stateName");
        });

        modelBuilder.Entity<Pool>(entity =>
        {
            entity.ToTable("Pool");

            entity.HasIndex(e => e.ServiceId, "IX_Pool_ServiceId").HasFillFactor(100);

            entity.Property(e => e.AccessLevel)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.Service).WithMany(p => p.Pools)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pool_Services");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.Property(e => e.BankDetails).IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Department)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.FormElement).IsUnicode(false);
            entity.Property(e => e.NameShort)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ServiceName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.WebService).HasColumnName("webService");
        });

        modelBuilder.Entity<Tehsil>(entity =>
        {
            entity.HasKey(e => new { e.TehsilId, e.Uuid }).HasName("Tehsil_PK");

            entity.ToTable("Tehsil");

            entity.Property(e => e.Uuid)
                .ValueGeneratedOnAdd()
                .HasColumnName("UUID");
            entity.Property(e => e.DistrictId).HasColumnName("DistrictID");
            entity.Property(e => e.IsTswo).HasDefaultValue(false);
            entity.Property(e => e.TehsilName)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Tswotehsil>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("TSWOTehsil");

            entity.Property(e => e.DistrictId).HasColumnName("DistrictID");
            entity.Property(e => e.DivisionCode).HasColumnName("divisionCode");
            entity.Property(e => e.TehsilName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TswoOfficeName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("tswoOfficeName");
        });

        modelBuilder.Entity<UploadedFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK_Files");

            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.FileType).HasMaxLength(100);
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.BackupCodes).IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.MobileNumber)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Password).HasMaxLength(64);
            entity.Property(e => e.Profile)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.RegisteredDate).HasMaxLength(120);
            entity.Property(e => e.UserType)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Username)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<UserDocument>(entity =>
        {
            entity.HasKey(e => e.FileId);

            entity.Property(e => e.FileId).HasColumnName("fileId");
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.FileType).HasMaxLength(50);
            entity.Property(e => e.ReferenceNumber).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<Village>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.VillageName)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Ward>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
        });

        modelBuilder.Entity<WebService>(entity =>
        {
            entity.ToTable("WebService");

            entity.Property(e => e.ApiEndPoint).HasColumnName("apiEndPoint");
            entity.Property(e => e.CreatedAt)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("createdAt");
            entity.Property(e => e.FieldMappings).HasColumnName("fieldMappings");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.OnAction).HasColumnName("onAction");
            entity.Property(e => e.ServiceId).HasColumnName("serviceId");
            entity.Property(e => e.UpdatedAt)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("updatedAt");
            entity.Property(e => e.WebServiceName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("webServiceName");

            entity.HasOne(d => d.Service).WithMany(p => p.WebServices)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WebService_Services");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
