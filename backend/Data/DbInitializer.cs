using ItIsAll.Api.Models.Entities;
using ItIsAll.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace ItIsAll.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, ILogger logger)
    {
        try
        {
            await context.Database.EnsureCreatedAsync();

            // 1. Seed Admin User
            if (!await context.Users.AnyAsync(u => u.Email == "admin@itisall.com"))
            {
                var admin = new User
                {
                    FullName = "Administrador It Is All",
                    Email = "admin@itisall.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123*"),
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow
                };

                var testCustomer = new User
                {
                    FullName = "Cliente Demo",
                    Email = "cliente@itisall.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cliente123*"),
                    Role = UserRole.Customer,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddRangeAsync(admin, testCustomer);
                await context.SaveChangesAsync();
                logger.LogInformation("Usuarios de prueba (Admin y Cliente) creados exitosamente.");
            }

            // 2. Seed Categories
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new() { Name = "Colección It Is All", Slug = "it-is-all", Description = "Prendas exclusivas diseñadas por It Is All." },
                    new() { Name = "Ropa de Reventa & Vintage", Slug = "resale-vintage", Description = "Piezas únicas y seleccionadas de reventa." },
                    new() { Name = "Accesorios", Slug = "accesorios", Description = "Joyería, gorras, bolsos y complementos." },
                    new() { Name = "Calzado", Slug = "calzado", Description = "Sneakers y calzado exclusivo." }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
                logger.LogInformation("Categorías iniciales creadas.");
            }

            // 3. Seed Products if empty
            if (!await context.Products.AnyAsync())
            {
                var catBrand = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "it-is-all");
                var catResale = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "resale-vintage");
                var catAcc = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "accesorios");

                if (catBrand != null && catResale != null && catAcc != null)
                {
                    var p1 = new Product
                    {
                        Name = "Oversized Heavyweight Hoodie 'ORIGINS'",
                        Slug = "oversized-heavyweight-hoodie-origins",
                        Description = "Buzo oversized confeccionado en algodón pesado de 450 GSM con bordado distintivo It Is All en el pecho y capucha envolvente.",
                        Price = 189000m,
                        CompareAtPrice = 220000m,
                        Stock = 12,
                        CategoryId = catBrand.Id,
                        Origin = ProductOrigin.ItIsAll,
                        Condition = ProductCondition.NewWithTags,
                        Brand = "It Is All",
                        Sizes = "S, M, L, XL",
                        Color = "Onyx Black",
                        IsFeatured = true
                    };
                    p1.AddImage("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", true);

                    var p2 = new Product
                    {
                        Name = "Chaqueta Vintage Carhartt Detroit (Reventa)",
                        Slug = "chaqueta-vintage-carhartt-detroit-resale",
                        Description = "Chaqueta Carhartt Detroit original de los 90s, desgaste natural vintage inigualable, forro acolchado intacto.",
                        Price = 320000m,
                        Stock = 1,
                        CategoryId = catResale.Id,
                        Origin = ProductOrigin.Resale,
                        Condition = ProductCondition.GoodVintage,
                        Brand = "Carhartt (Curada)",
                        Sizes = "L",
                        Color = "Washed Brown",
                        IsFeatured = true
                    };
                    p2.AddImage("https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80", true);

                    var p3 = new Product
                    {
                        Name = "Gorra Distressed Acid Wash 'It Is All'",
                        Slug = "gorra-distressed-acid-wash-it-is-all",
                        Description = "Gorra de 6 paneles en algodón tratado con efecto acid wash y herrajes metálicos envejecidos.",
                        Price = 75000m,
                        Stock = 20,
                        CategoryId = catAcc.Id,
                        Origin = ProductOrigin.ItIsAll,
                        Condition = ProductCondition.NewWithTags,
                        Brand = "It Is All",
                        Sizes = "Talla Única (Ajustable)",
                        Color = "Vintage Gray",
                        IsFeatured = false
                    };
                    p3.AddImage("https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80", true);

                    await context.Products.AddRangeAsync(p1, p2, p3);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Productos iniciales cargados en la base de datos.");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al inicializar la base de datos MySQL.");
        }
    }
}
