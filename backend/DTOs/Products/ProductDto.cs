namespace ItIsAll.Api.DTOs.Products;

public class ProductImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsCover { get; set; }
    public int DisplayOrder { get; set; }
}

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int Stock { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;       // "ItIsAll" o "Resale"
    public string Condition { get; set; } = string.Empty;    // "NewWithTags", "LikeNew", etc.
    public string Brand { get; set; } = string.Empty;
    public string Sizes { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public string? CoverImageUrl { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
