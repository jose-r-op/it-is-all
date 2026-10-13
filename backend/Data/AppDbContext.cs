using ItIsAll.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ItIsAll.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            entity.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(50);
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
            entity.HasKey(c => c.Id);
            entity.HasIndex(c => c.Slug).IsUnique();
            entity.Property(c => c.Name).HasMaxLength(100).IsRequired();
            entity.Property(c => c.Slug).HasMaxLength(100).IsRequired();
        });

        // Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.Slug).IsUnique();
            entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Slug).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Price).HasPrecision(10, 2);
            entity.Property(p => p.CompareAtPrice).HasPrecision(10, 2);
            entity.Property(p => p.Origin).HasConversion<string>().HasMaxLength(50);
            entity.Property(p => p.Condition).HasConversion<string>().HasMaxLength(50);
            entity.Property(p => p.Brand).HasMaxLength(100);

            entity.HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(p => p.Images)
                .WithOne(i => i.Product)
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ProductImage
        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.ToTable("product_images");
            entity.HasKey(i => i.Id);
            entity.Property(i => i.ImageUrl).HasMaxLength(500).IsRequired();
        });
    }
}
