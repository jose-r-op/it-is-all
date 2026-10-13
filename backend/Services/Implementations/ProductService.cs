using System.Text.RegularExpressions;
using ItIsAll.Api.Data;
using ItIsAll.Api.DTOs.Products;
using ItIsAll.Api.Models.Entities;
using ItIsAll.Api.Models.Enums;
using ItIsAll.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ItIsAll.Api.Services.Implementations;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageService;
    private readonly ILogger<ProductService> _logger;

    public ProductService(
        AppDbContext context,
        IImageStorageService imageService,
        ILogger<ProductService> logger)
    {
        _context = context;
        _imageService = imageService;
        _logger = logger;
    }

    public async Task<List<ProductDto>> GetAllAsync(
        ProductOrigin? origin = null,
        int? categoryId = null,
        string? search = null,
        bool? isFeatured = null,
        int page = 1,
        int pageSize = 50)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (origin.HasValue)
        {
            query = query.Where(p => p.Origin == origin.Value);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (isFeatured.HasValue)
        {
            query = query.Where(p => p.IsFeatured == isFeatured.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) ||
                                     p.Description.ToLower().Contains(term) ||
                                     p.Brand.ToLower().Contains(term));
        }

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return products.Select(MapToDto).ToList();
    }

    public async Task<ProductDto> GetByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            throw new KeyNotFoundException($"Producto con Id {id} no encontrado.");
        }

        return MapToDto(product);
    }

    public async Task<ProductDto> GetBySlugAsync(string slug)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower());

        if (product == null)
        {
            throw new KeyNotFoundException($"Producto '{slug}' no encontrado.");
        }

        return MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        // Generar Slug único
        var baseSlug = GenerateSlug(dto.Name);
        var slug = baseSlug;
        int counter = 1;
        while (await _context.Products.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{baseSlug}-{counter++}";
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            Slug = slug,
            Description = dto.Description.Trim(),
            Price = dto.Price,
            CompareAtPrice = dto.CompareAtPrice,
            Stock = dto.Stock,
            CategoryId = dto.CategoryId,
            Origin = dto.Origin,
            Condition = dto.Condition,
            Brand = string.IsNullOrWhiteSpace(dto.Brand) ? (dto.Origin == ProductOrigin.ItIsAll ? "It Is All" : "Vintage") : dto.Brand.Trim(),
            Sizes = dto.Sizes.Trim(),
            Color = dto.Color.Trim(),
            IsFeatured = dto.IsFeatured,
            CreatedAt = DateTime.UtcNow
        };

        // Procesar URLs de imágenes pasadas directamente
        if (dto.ImageUrls != null && dto.ImageUrls.Any())
        {
            bool first = true;
            foreach (var url in dto.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)))
            {
                product.AddImage(url.Trim(), first);
                first = false;
            }
        }

        // Procesar archivos subidos mediante formulario / pop-up
        if (dto.Files != null && dto.Files.Any())
        {
            var savedUrls = await _imageService.SaveImagesAsync(dto.Files, "products");
            bool first = !product.Images.Any();
            foreach (var url in savedUrls)
            {
                product.AddImage(url, first);
                first = false;
            }
        }

        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();

        // Recargar con relaciones
        return await GetByIdAsync(product.Id);
    }

    public async Task<ProductDto> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            throw new KeyNotFoundException($"Producto con Id {id} no encontrado.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            product.Name = dto.Name.Trim();
        }

        if (!string.IsNullOrWhiteSpace(dto.Description))
        {
            product.Description = dto.Description.Trim();
        }

        if (dto.Price.HasValue) product.Price = dto.Price.Value;
        if (dto.CompareAtPrice.HasValue) product.CompareAtPrice = dto.CompareAtPrice.Value;
        if (dto.Stock.HasValue) product.Stock = dto.Stock.Value;
        if (dto.CategoryId.HasValue) product.CategoryId = dto.CategoryId.Value;
        if (dto.Origin.HasValue) product.Origin = dto.Origin.Value;
        if (dto.Condition.HasValue) product.Condition = dto.Condition.Value;
        if (!string.IsNullOrWhiteSpace(dto.Brand)) product.Brand = dto.Brand.Trim();
        if (dto.Sizes != null) product.Sizes = dto.Sizes.Trim();
        if (dto.Color != null) product.Color = dto.Color.Trim();
        if (dto.IsFeatured.HasValue) product.IsFeatured = dto.IsFeatured.Value;
        if (dto.IsActive.HasValue) product.IsActive = dto.IsActive.Value;

        product.UpdatedAt = DateTime.UtcNow;

        // Nuevos archivos si se adjuntaron
        if (dto.NewFiles != null && dto.NewFiles.Any())
        {
            var savedUrls = await _imageService.SaveImagesAsync(dto.NewFiles, "products");
            foreach (var url in savedUrls)
            {
                product.AddImage(url, !product.Images.Any());
            }
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(product.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return false;

        // Eliminar archivos físicos asociados
        foreach (var img in product.Images)
        {
            await _imageService.DeleteImageAsync(img.ImageUrl);
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync();
    }

    public async Task<CategoryDto> CreateCategoryAsync(string name, string? description)
    {
        var slug = GenerateSlug(name);
        var category = new Category
        {
            Name = name.Trim(),
            Slug = slug,
            Description = description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description
        };
    }

    private static ProductDto MapToDto(Product p)
    {
        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            Description = p.Description,
            Price = p.Price,
            CompareAtPrice = p.CompareAtPrice,
            Stock = p.Stock,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? string.Empty,
            Origin = p.Origin.ToString(),
            Condition = p.Condition.ToString(),
            Brand = p.Brand,
            Sizes = p.Sizes,
            Color = p.Color,
            IsFeatured = p.IsFeatured,
            IsActive = p.IsActive,
            CoverImageUrl = p.CoverImageUrl,
            CreatedAt = p.CreatedAt,
            Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                IsCover = i.IsCover,
                DisplayOrder = i.DisplayOrder
            }).ToList()
        };
    }

    private static string GenerateSlug(string text)
    {
        var str = text.ToLowerInvariant().Trim();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", "-").Trim('-');
        return str;
    }
}
