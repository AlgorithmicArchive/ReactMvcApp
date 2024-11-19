using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ReactMvcApp.Models.Entities;

public partial class SocialWelfareDepartmentContext : DbContext
{
    public SocialWelfareDepartmentContext()
    {
    }

    public SocialWelfareDepartmentContext(DbContextOptions<SocialWelfareDepartmentContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<Application> Applications { get; set; }

    public virtual DbSet<ApplicationList> ApplicationLists { get; set; }

    public virtual DbSet<ApplicationPerDistrict> ApplicationPerDistricts { get; set; }

    public virtual DbSet<ApplicationStatus> ApplicationStatuses { get; set; }

    public virtual DbSet<ApplicationsCount> ApplicationsCounts { get; set; }

    public virtual DbSet<ApplicationsHistory> ApplicationsHistories { get; set; }

    public virtual DbSet<BankFile> BankFiles { get; set; }

    public virtual DbSet<Block> Blocks { get; set; }

    public virtual DbSet<Certificate> Certificates { get; set; }

    public virtual DbSet<Contact> Contacts { get; set; }

    public virtual DbSet<District> Districts { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<HalqaPanchayat> HalqaPanchayats { get; set; }

    public virtual DbSet<OfficerDetail> OfficerDetails { get; set; }

    public virtual DbSet<OfficersDesignation> OfficersDesignations { get; set; }

    public virtual DbSet<PaymentDetail> PaymentDetails { get; set; }

    public virtual DbSet<Pincode> Pincodes { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<Tehsil> Tehsils { get; set; }

    public virtual DbSet<UniqueId> UniqueIds { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Village> Villages { get; set; }

    public virtual DbSet<Ward> Wards { get; set; }

    public virtual DbSet<WorkFlow> WorkFlows { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(entity =>
        {
            entity.ToTable("Address");

            entity.Property(e => e.AddressDetails).IsUnicode(false);
        });

        modelBuilder.Entity<Application>(entity =>
        {
            entity.Property(e => e.ApplicationId)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ApplicantImage).IsUnicode(false);
            entity.Property(e => e.ApplicantName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.ApplicationStatus)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.BankDetails).IsUnicode(false);
            entity.Property(e => e.Category)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.DateOfBirth)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Documents).IsUnicode(false);
            entity.Property(e => e.EditList)
                .IsUnicode(false)
                .HasDefaultValue("[]");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.MobileNumber)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.PermanentAddressId)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("0");
            entity.Property(e => e.PresentAddressId)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("0");
            entity.Property(e => e.Relation)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.RelationName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.ServiceSpecific).IsUnicode(false);
            entity.Property(e => e.SubmissionDate)
                .HasMaxLength(50)
                .HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Citizen).WithMany(p => p.Applications)
                .HasForeignKey(d => d.CitizenId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Applications_Citizen");

            entity.HasOne(d => d.Service).WithMany(p => p.Applications)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Applications_Services");
        });

        modelBuilder.Entity<ApplicationList>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("ApplicationList");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.AccessLevel)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ApprovalList).IsUnicode(false);
            entity.Property(e => e.Officer)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.PoolList).IsUnicode(false);
        });

        modelBuilder.Entity<ApplicationPerDistrict>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("ApplicationPerDistrict");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.FinancialYear)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.District).WithMany(p => p.ApplicationPerDistricts)
                .HasForeignKey(d => d.DistrictId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationPerDistrict_District");
        });

        modelBuilder.Entity<ApplicationStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId);

            entity.ToTable("ApplicationStatus");

            entity.Property(e => e.ApplicationId)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CanPull).HasColumnName("canPull");
            entity.Property(e => e.LastUpdated)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Application).WithMany(p => p.ApplicationStatuses)
                .HasForeignKey(d => d.ApplicationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationStatus_Applications");

            entity.HasOne(d => d.CurrentlyWithNavigation).WithMany(p => p.ApplicationStatuses)
                .HasForeignKey(d => d.CurrentlyWith)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationStatus_Officer");

            entity.HasOne(d => d.Service).WithMany(p => p.ApplicationStatuses)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationStatus_Services");
        });

        modelBuilder.Entity<ApplicationsCount>(entity =>
        {
            entity.HasKey(e => e.CountId);

            entity.ToTable("ApplicationsCount");

            entity.Property(e => e.LastUpdated)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.Officer).WithMany(p => p.ApplicationsCounts)
                .HasForeignKey(d => d.OfficerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationsCount_Officer");

            entity.HasOne(d => d.Service).WithMany(p => p.ApplicationsCounts)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationsCount_Services");
        });

        modelBuilder.Entity<ApplicationsHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId);

            entity.ToTable("ApplicationsHistory");

            entity.Property(e => e.ActionTaken)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ApplicationId)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.File)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Remarks)
                .HasDefaultValue("")
                .HasColumnType("text");
            entity.Property(e => e.TakenAt).IsUnicode(false);

            entity.HasOne(d => d.Application).WithMany(p => p.ApplicationsHistories)
                .HasForeignKey(d => d.ApplicationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationsHistory_Applications");

            entity.HasOne(d => d.Service).WithMany(p => p.ApplicationsHistories)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationsHistory_Services");

            entity.HasOne(d => d.TakenByNavigation).WithMany(p => p.ApplicationsHistories)
                .HasForeignKey(d => d.TakenBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApplicationsHistory_Officer");
        });

        modelBuilder.Entity<BankFile>(entity =>
        {
            entity.HasKey(e => e.FileId);

            entity.Property(e => e.DbUpdate)
                .HasDefaultValue(false)
                .HasColumnName("dbUpdate");
            entity.Property(e => e.FileName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.GeneratedDate)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.RecievedOn)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ResponseFile)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.SentOn)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedOn)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.District).WithMany(p => p.BankFiles)
                .HasForeignKey(d => d.DistrictId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BankFiles_District");

            entity.HasOne(d => d.Service).WithMany(p => p.BankFiles)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BankFiles_Services");
        });

        modelBuilder.Entity<Block>(entity =>
        {
            entity.ToTable("Block");

            entity.Property(e => e.BlockId).ValueGeneratedNever();
            entity.Property(e => e.BlockName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DistrictId).HasColumnName("DistrictID");

            entity.HasOne(d => d.District).WithMany(p => p.Blocks)
                .HasForeignKey(d => d.DistrictId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Block_District");
        });

        modelBuilder.Entity<Certificate>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.EncryptionIv).HasColumnName("encryptionIV");
            entity.Property(e => e.EncryptionKey).HasColumnName("encryptionKey");
            entity.Property(e => e.RegisteredDate)
                .HasMaxLength(50)
                .HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Officer).WithMany(p => p.Certificates)
                .HasForeignKey(d => d.OfficerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Certificates_Officer");
        });

        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasKey(e => e.Uuid).HasName("PK_NewTable");

            entity.ToTable("Contact");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("fullName");
            entity.Property(e => e.Message)
                .HasColumnType("text")
                .HasColumnName("message");
            entity.Property(e => e.SubmissionDate)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("submissionDate");
        });

        modelBuilder.Entity<District>(entity =>
        {
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
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("Feedback");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.Message).IsUnicode(false);
            entity.Property(e => e.ServiceRelated)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.SubmittedAt).HasColumnType("decimal(23, 3)");
        });

        modelBuilder.Entity<HalqaPanchayat>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("HalqaPanchayat");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.PanchayatName)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.Block).WithMany(p => p.HalqaPanchayats)
                .HasForeignKey(d => d.BlockId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_HalqaPanchayat_Block");
        });

        modelBuilder.Entity<OfficerDetail>(entity =>
        {
            entity.HasKey(e => e.DetailId);

            entity.Property(e => e.AccessLevel)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Officer).WithMany(p => p.OfficerDetails)
                .HasForeignKey(d => d.OfficerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OfficerDetails_Users");
        });

        modelBuilder.Entity<OfficersDesignation>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.AccessLevel)
                .HasMaxLength(40)
                .IsUnicode(false);
            entity.Property(e => e.Designation).IsUnicode(false);
            entity.Property(e => e.DesignationShort)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<PaymentDetail>(entity =>
        {
            entity.HasKey(e => e.PaymentId);

            entity.Property(e => e.ApplicantName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.ApplicationId)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.DateOfDistribution)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.TransactionId)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.TransactionStatus)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Application).WithMany(p => p.PaymentDetails)
                .HasForeignKey(d => d.ApplicationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PaymentDetails_Applications");
        });

        modelBuilder.Entity<Pincode>(entity =>
        {
            entity.ToTable("Pincode");

            entity.Property(e => e.PincodeId).HasColumnName("pincode_id");
            entity.Property(e => e.Pincode1).HasColumnName("Pincode");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.Property(e => e.BankDetails)
                .IsUnicode(false)
                .HasDefaultValue("{}");
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
            entity.Property(e => e.OfficerEditableField).IsUnicode(false);
            entity.Property(e => e.ServiceName)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Tehsil>(entity =>
        {
            entity.ToTable("Tehsil");

            entity.Property(e => e.TehsilId).ValueGeneratedNever();
            entity.Property(e => e.DistrictId).HasColumnName("DistrictID");
            entity.Property(e => e.TehsilName)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.District).WithMany(p => p.Tehsils)
                .HasForeignKey(d => d.DistrictId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tehsil_District");
        });

        modelBuilder.Entity<UniqueId>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("UniqueId");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.District)
                .HasMaxLength(5)
                .IsUnicode(false);
            entity.Property(e => e.Month)
                .HasMaxLength(5)
                .IsUnicode(false);
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

        modelBuilder.Entity<Village>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("Village");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.VillageName)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.HalqaPanchayat).WithMany(p => p.Villages)
                .HasForeignKey(d => d.HalqaPanchayatId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Village_HalqaPanchayat");

            entity.HasOne(d => d.Tehsil).WithMany(p => p.Villages)
                .HasForeignKey(d => d.TehsilId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Village_Tehsil");
        });

        modelBuilder.Entity<Ward>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("Ward");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.WardName)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.Village).WithMany(p => p.Wards)
                .HasForeignKey(d => d.VillageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ward_Village");
        });

        modelBuilder.Entity<WorkFlow>(entity =>
        {
            entity.ToTable("WorkFlow");

            entity.Property(e => e.CanForward).HasColumnName("canForward");
            entity.Property(e => e.CanReject)
                .HasDefaultValue(true)
                .HasColumnName("canReject");
            entity.Property(e => e.CanReturn).HasColumnName("canReturn");
            entity.Property(e => e.CanReturnToEdit).HasColumnName("canReturnToEdit");
            entity.Property(e => e.CanSanction).HasColumnName("canSanction");
            entity.Property(e => e.CanUpdate).HasColumnName("canUpdate");
            entity.Property(e => e.Role)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.Service).WithMany(p => p.WorkFlows)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WorkFlow_Services");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
