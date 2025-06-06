﻿using System;
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

    public virtual DbSet<ActionHistory> ActionHistories { get; set; }

    public virtual DbSet<AllBankDetail> AllBankDetails { get; set; }

    public virtual DbSet<ApplicationPerDistrict> ApplicationPerDistricts { get; set; }

    public virtual DbSet<Certificate> Certificates { get; set; }

    public virtual DbSet<CitizenApplication> CitizenApplications { get; set; }

    public virtual DbSet<District> Districts { get; set; }

    public virtual DbSet<OfficerDetail> OfficerDetails { get; set; }

    public virtual DbSet<OfficersDesignation> OfficersDesignations { get; set; }

    public virtual DbSet<Pool> Pools { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<Tehsil> Tehsils { get; set; }

    public virtual DbSet<User> Users { get; set; }

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
            entity.Property(e => e.ReferenceNumber)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("referenceNumber");
        });

        modelBuilder.Entity<AllBankDetail>(entity =>
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

        modelBuilder.Entity<ApplicationPerDistrict>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.ToTable("ApplicationPerDistrict");

            entity.Property(e => e.Uuid).HasColumnName("UUID");
            entity.Property(e => e.FinancialYear)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Certificate>(entity =>
        {
            entity.HasKey(e => e.Uuid);

            entity.Property(e => e.Uuid)
                .ValueGeneratedOnAdd()
                .HasColumnName("UUID");
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

            entity.HasOne(d => d.Uu).WithOne(p => p.Certificate)
                .HasForeignKey<Certificate>(d => d.Uuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Certificates_Users");
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
            entity.Property(e => e.Status)
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

        modelBuilder.Entity<OfficerDetail>(entity =>
        {
            entity.HasKey(e => e.DetailId);

            entity.Property(e => e.DetailId).ValueGeneratedNever();
            entity.Property(e => e.AccessLevel)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Role)
                .HasMaxLength(50)
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
            entity.HasKey(e => e.TehsilId).HasName("Tehsil_PK");

            entity.ToTable("Tehsil");

            entity.Property(e => e.TehsilId).ValueGeneratedNever();
            entity.Property(e => e.DistrictId).HasColumnName("DistrictID");
            entity.Property(e => e.TehsilName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Uuid).HasColumnName("UUID");
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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
